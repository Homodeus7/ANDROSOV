import { describe, expect, it } from "vitest";
import { distribute, distributeNaively, paid, subtotal } from "./split";
import { flatten, team } from "./tree";

const POOLS = [1, 2, 7, 99, 100, 4999, 10_000, 123_457, 999_983];

describe("referral split", () => {
  it("pays out the pool exactly, whatever the pool is", () => {
    for (const pool of POOLS) {
      expect(paid(distribute(pool, team)), `pool ${pool}`).toBe(pool);
    }
  });

  // Тот же расчёт построчным округлением: он не сходится, и видно, на сколько
  it("shows the row-by-row rounding missing the pool", () => {
    const drifts = POOLS.map((pool) => paid(distributeNaively(pool, team)) - pool);

    expect(drifts.some((drift) => drift !== 0)).toBe(true);
    expect(paid(distributeNaively(1, team)) - 1).toBe(-1);
    expect(paid(distributeNaively(100, team)) - 100).toBe(1);
  });

  it("gives the same answer for the same pool", () => {
    expect([...distribute(4999, team)]).toEqual([...distribute(4999, team)]);
  });

  it("never rounds a share up by more than a cent", () => {
    const members = flatten(team);
    const volume = members.reduce((total, member) => total + member.volume, 0);
    const shares = distribute(123_457, team);

    for (const member of members) {
      const exact = (123_457 * member.volume) / volume;
      const cents = shares.get(member.id)!;
      expect(cents, member.id).toBeGreaterThanOrEqual(Math.floor(exact));
      expect(cents, member.id).toBeLessThanOrEqual(Math.floor(exact) + 1);
    }
  });

  it("adds every subtree up to the total above it", () => {
    const shares = distribute(88_888, team);

    expect(subtotal(team, shares)).toBe(paid(shares));
    for (const member of flatten(team)) {
      const own = shares.get(member.id)!;
      const children = member.children.reduce(
        (total, child) => total + subtotal(child, shares),
        0,
      );
      expect(subtotal(member, shares), member.id).toBe(own + children);
    }
  });

  it("leaves nobody out of the tree", () => {
    expect(distribute(10_000, team).size).toBe(flatten(team).length);
    expect(flatten(team)).toHaveLength(12);
  });
});
