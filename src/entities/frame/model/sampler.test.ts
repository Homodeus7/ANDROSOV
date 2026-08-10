import { describe, expect, it } from "vitest";
import { createSampler, EMPTY_STATS } from "./sampler";

const feed = (sampler: ReturnType<typeof createSampler>, deltas: number[]) => {
  for (const delta of deltas) sampler.push(delta);
  return sampler.stats();
};

describe("frame sampler", () => {
  it("reports nothing until a frame arrives", () => {
    expect(createSampler().stats()).toEqual(EMPTY_STATS);
  });

  it("derives fps from the mean interval", () => {
    const stats = feed(createSampler(), [16, 17, 16, 17]);

    expect(stats.fps).toBe(61);
    expect(stats.samples).toBe(4);
  });

  it("keeps percentiles apart from the mean", () => {
    const stats = feed(createSampler(), [...Array(18).fill(10), 200, 200]);

    expect(stats.p50).toBe(10);
    expect(stats.p95).toBe(200);
  });

  it("counts a frame as lost only past one and a half budgets", () => {
    // 17 мс — обычное дрожание метки rAF на ровных 60 Гц, а не потеря кадра
    expect(feed(createSampler(), [17, 17, 17, 17]).dropped).toBe(0);
    expect(feed(createSampler(), [17, 40, 17, 40]).dropped).toBe(50);
  });

  it("forgets samples that fell out of the window", () => {
    const sampler = createSampler(4);

    feed(sampler, [100, 100, 100, 100]);
    const stats = feed(sampler, [10, 10, 10, 10]);

    expect(stats.samples).toBe(4);
    expect(stats.p95).toBe(10);
  });

  it("returns the window oldest first, so a strip reads left to right", () => {
    const sampler = createSampler(3);

    feed(sampler, [1, 2, 3, 4]);

    expect(sampler.recent()).toEqual([2, 3, 4]);
  });

  it("drops everything on reset", () => {
    const sampler = createSampler();

    feed(sampler, [16, 16]);
    sampler.reset();

    expect(sampler.stats()).toEqual(EMPTY_STATS);
  });
});
