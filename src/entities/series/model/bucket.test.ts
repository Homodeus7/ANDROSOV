import { describe, expect, it } from "vitest";
import { alignBucket, rollupFromBuckets, rollupFromRaw } from "./bucket";
import { createRing } from "./ring";
import type { Sample } from "./types";

const BASE = 1000;

const ringOf = (samples: Sample[]) => {
  const ring = createRing(Math.max(samples.length, 1));
  samples.forEach((sample) => ring.push(sample));
  return ring;
};

const at = (time: number, value: number, arrival = time): Sample => ({ time, arrival, value });

/** Ровный поток: одно событие каждые 100 мс на протяжении минуты. */
const even = () =>
  ringOf(Array.from({ length: 600 }, (_, index) => at(index * 100, 50 + (index % 7) * 10)));

describe("bucket boundaries", () => {
  it("gives the boundary to the bucket it opens", () => {
    expect(alignBucket(4999, 5000)).toBe(0);
    expect(alignBucket(5000, 5000)).toBe(5000);
  });

  it("counts an event exactly on the boundary once", () => {
    const ring = ringOf([at(5000, 1)]);
    expect(rollupFromRaw(ring, "count", 5000, 0, 2)).toEqual([undefined, 1]);
  });
});

describe("decomposable metrics", () => {
  // Инвариант: сумму и количество можно пересобрать из чего угодно, и никакая
  // гранулярность не имеет права изменить ответ
  for (const size of [1000, 5000, 15000, 60000]) {
    it(`keeps sum and count identical at ${size / 1000}s`, () => {
      const ring = even();
      const count = 60000 / size;

      for (const metric of ["sum", "count"] as const) {
        expect(rollupFromRaw(ring, metric, size, 0, count)).toEqual(
          rollupFromBuckets(ring, metric, size, 0, count, BASE),
        );
      }
    });
  }
});

describe("average", () => {
  it("survives the fold while the buckets are filled equally", () => {
    const ring = ringOf([at(0, 100), at(100, 300), at(1000, 150), at(1100, 250)]);

    expect(rollupFromRaw(ring, "avg", 2000, 0, 1)).toEqual([200]);
    expect(rollupFromBuckets(ring, "avg", 2000, 0, 1, BASE)).toEqual([200]);
  });

  it("loses the weights as soon as the buckets are filled unequally", () => {
    const light = [at(0, 100)];
    const heavy = Array.from({ length: 9 }, (_, index) => at(1000 + index * 10, 200));
    const ring = ringOf([...light, ...heavy]);

    expect(rollupFromRaw(ring, "avg", 2000, 0, 1)).toEqual([190]);
    expect(rollupFromBuckets(ring, "avg", 2000, 0, 1, BASE)).toEqual([150]);
  });
});

describe("p95", () => {
  // Контрпример, а не погрешность: свёртка отвечает 51 там, где ответ 2
  it("cannot be rebuilt from percentiles of the parts", () => {
    const spiky = [...Array.from({ length: 9 }, (_, index) => at(index * 10, 1)), at(100, 100)];
    const flat = Array.from({ length: 10 }, (_, index) => at(1000 + index * 10, 2));
    const ring = ringOf([...spiky, ...flat]);

    expect(rollupFromRaw(ring, "p95", 2000, 0, 1)).toEqual([2]);
    expect(rollupFromBuckets(ring, "p95", 2000, 0, 1, BASE)).toEqual([51]);
  });
});

describe("silence", () => {
  it("leaves a hole in the raw roll-up and a zero in the folded one", () => {
    const ring = ringOf([at(0, 42)]);

    expect(rollupFromRaw(ring, "sum", BASE, 0, 3)).toEqual([42, undefined, undefined]);
    expect(rollupFromBuckets(ring, "sum", BASE, 0, 3, BASE)).toEqual([42, 0, 0]);
  });
});

describe("late events", () => {
  it("puts a late event where it happened, and the fold puts it where it arrived", () => {
    const ring = ringOf([at(500, 7, 3500)]);

    expect(rollupFromRaw(ring, "sum", BASE, 0, 4)).toEqual([
      7,
      undefined,
      undefined,
      undefined,
    ]);
    expect(rollupFromBuckets(ring, "sum", BASE, 0, 4, BASE)).toEqual([0, 0, 0, 7]);
  });
});

describe("ring", () => {
  it("drops the oldest events and keeps the order they were written in", () => {
    const ring = createRing(3);
    [1, 2, 3, 4, 5].forEach((value) => ring.push(at(value * 100, value)));

    const seen: number[] = [];
    ring.each((_time, _arrival, value) => seen.push(value));

    expect(ring.length).toBe(3);
    expect(seen).toEqual([3, 4, 5]);
  });
});
