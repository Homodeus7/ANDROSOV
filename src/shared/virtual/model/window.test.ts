import { describe, expect, it } from "vitest";
import { sliceFor } from "./window";

const base = { scrollTop: 0, viewport: 360, rowHeight: 36, total: 500 };

describe("virtual window", () => {
  it("takes the visible rows plus the overscan", () => {
    expect(sliceFor(base)).toEqual({ start: 0, end: 14, padTop: 0, totalHeight: 18000 });
  });

  it("moves the window with the scroll and pads what is above it", () => {
    const slice = sliceFor({ ...base, scrollTop: 3600 });

    expect(slice.start).toBe(96);
    expect(slice.end).toBe(114);
    expect(slice.padTop).toBe(96 * 36);
  });

  it("never runs past either end of the list", () => {
    expect(sliceFor({ ...base, scrollTop: -200 }).start).toBe(0);

    const bottom = sliceFor({ ...base, scrollTop: 18000 });
    expect(bottom.end).toBe(500);
    expect(bottom.start).toBeLessThan(500);
  });

  it("keeps the full height whatever the window shows", () => {
    // Скроллбар обязан отражать все строки, а не отрисованные: иначе полоса
    // прокрутки прыгала бы при каждом сдвиге окна
    for (const scrollTop of [0, 900, 9000, 17999]) {
      expect(sliceFor({ ...base, scrollTop }).totalHeight).toBe(18000);
    }
  });

  it("survives an empty list", () => {
    expect(sliceFor({ ...base, total: 0 })).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      totalHeight: 0,
    });
  });
});
