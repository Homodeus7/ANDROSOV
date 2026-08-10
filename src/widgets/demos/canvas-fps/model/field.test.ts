import { describe, expect, it } from "vitest";
import { animateField, centreOf, createField, edgeCount, resizeField } from "./field";

const sized = (count: number) => {
  const field = createField(count);
  resizeField(field, 800, 400);
  return field;
};

describe("canvas field", () => {
  it("lays every block out inside the box", () => {
    const field = sized(120);

    for (let index = 0; index < field.count; index += 1) {
      expect(field.positions[index * 2]).toBeGreaterThanOrEqual(0);
      expect(field.positions[index * 2]! + field.blockWidth).toBeLessThanOrEqual(801);
      expect(field.positions[index * 2 + 1]! + field.blockHeight).toBeLessThanOrEqual(401);
    }
  });

  it("moves every block, and never out of its own cell", () => {
    const field = sized(120);

    for (let time = 0; time < 3000; time += 97) {
      animateField(field, time);
      for (let index = 0; index < field.count; index += 1) {
        const dx = field.positions[index * 2]! - field.homes[index * 2]!;
        const dy = field.positions[index * 2 + 1]! - field.homes[index * 2 + 1]!;
        expect(Math.hypot(dx, dy)).toBeCloseTo(field.radius, 9);
      }
    }
  });

  // Обе стратегии рисуют одну и ту же сцену: разница между режимами в том,
  // как кадр доезжает до DOM, а не в том, что на нём нарисовано
  it("puts the same scene on screen for the same timestamp", () => {
    const one = sized(120);
    const two = sized(120);

    animateField(one, 1234);
    animateField(two, 1234);

    expect(Array.from(one.positions)).toEqual(Array.from(two.positions));
  });

  it("draws one link fewer than there are blocks", () => {
    expect(edgeCount(sized(40))).toBe(39);
    expect(edgeCount(sized(1))).toBe(0);
  });

  it("takes the link endpoint from the middle of a block", () => {
    const field = sized(40);
    const centre = centreOf(field, 0);

    expect(centre.x).toBeCloseTo(field.positions[0]! + field.blockWidth / 2);
    expect(centre.y).toBeCloseTo(field.positions[1]! + field.blockHeight / 2);
  });
});
