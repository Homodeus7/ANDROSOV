import { describe, expect, it } from "vitest";
import { downsample } from "./downsample";
import { drift } from "./drift";
import { metrics, quantile, summarise } from "./metrics";

describe("quantile", () => {
  it("takes the nearest rank, without inventing a value between samples", () => {
    expect(quantile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.95)).toBe(10);
    expect(quantile([5], 0.95)).toBe(5);
    expect(quantile([], 0.95)).toBe(0);
  });
});

describe("summary", () => {
  it("says a bucket is empty by its count, not by its sum", () => {
    expect(summarise([])).toEqual({ count: 0, sum: 0, p95: 0 });
    expect(summarise([-5, 5])).toEqual({ count: 2, sum: 0, p95: 5 });
  });
});

describe("decomposability", () => {
  it("marks exactly the metrics that survive a fold", () => {
    expect(metrics.sum.decomposable).toBe(true);
    expect(metrics.count.decomposable).toBe(true);
    expect(metrics.avg.decomposable).toBe(false);
    expect(metrics.p95.decomposable).toBe(false);
  });
});

describe("drift", () => {
  it("is zero while the two roll-ups agree", () => {
    expect(drift([1, 2, 3], [1, 2, 3])).toEqual({ mean: 0, worst: 0 });
  });

  it("ignores the buckets before the stream started", () => {
    expect(drift([undefined, 10, 10], [0, 10, 20])).toEqual({ mean: 0.25, worst: 0.5 });
  });

  // Окно шире данных, а не разошлось с ними: последний бакет ещё наполняется
  it("ignores the bucket that has not been filled yet", () => {
    expect(drift([10, undefined], [10, 0])).toEqual({ mean: 0, worst: 0 });
  });

  // Ноль там, где ничего не измеряли, — не приближение, а другой ответ
  it("counts a claimed measurement against a hole as a full miss", () => {
    expect(drift([10, undefined, 10], [10, 0, 10])).toEqual({ mean: 1 / 3, worst: 1 });
  });
});

describe("downsample", () => {
  it("keeps the extremes of every pixel column", () => {
    expect(downsample([1, 1, 3, 5], 2)).toEqual([
      { min: 1, max: 1 },
      { min: 3, max: 5 },
    ]);
  });

  it("leaves a column empty when nothing was measured in it", () => {
    expect(downsample([undefined, undefined, 4, 4], 2)).toEqual([
      undefined,
      { min: 4, max: 4 },
    ]);
  });
});
