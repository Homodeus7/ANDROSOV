import { describe, expect, it } from "vitest";
import { applyUpdate, applyUpdates, createLedger, nextUpdate } from "./ledger";
import { createRandom } from "@/shared/lib";
import { TX_STATUSES } from "./types";

describe("ledger", () => {
  it("builds the same ledger from the same seed", () => {
    expect(createLedger(50)).toEqual(createLedger(50));
    expect(createLedger(50, 1)).not.toEqual(createLedger(50, 2));
  });

  it("gives every row an id of its own", () => {
    const rows = createLedger(500);
    expect(new Set(rows.map((row) => row.id)).size).toBe(500);
  });

  // Ради этого свойства всё и написано: `memo` спасает строку только тогда,
  // когда обновление оставило её тем же объектом
  it("keeps every untouched row at the same reference", () => {
    const rows = createLedger(200);
    const target = rows[42]!;

    const next = applyUpdate(rows, { id: target.id, status: "refunded" });

    expect(next).not.toBe(rows);
    expect(next[42]).not.toBe(target);
    expect(next[42]!.status).toBe("refunded");
    for (let index = 0; index < rows.length; index += 1) {
      if (index !== 42) expect(next[index], `row ${index}`).toBe(rows[index]);
    }
  });

  it("returns the very same array when nothing changed", () => {
    const rows = createLedger(20);

    expect(applyUpdate(rows, { id: rows[0]!.id, status: rows[0]!.status })).toBe(rows);
    expect(applyUpdate(rows, { id: "TX-99999", status: "failed" })).toBe(rows);
  });

  it("only ever moves a row along a status the flow allows", () => {
    const random = createRandom(7);
    let rows = createLedger(80);

    for (let step = 0; step < 400; step += 1) {
      const update = nextUpdate(rows, random);
      const before = rows.find((row) => row.id === update.id)!;

      expect(TX_STATUSES).toContain(update.status);
      expect(update.status).not.toBe(before.status);

      rows = applyUpdates(rows, [update]) as typeof rows;
    }
  });

  it("folds a batch of updates in order", () => {
    const rows = createLedger(10);
    const id = rows[3]!.id;

    const next = applyUpdates(rows, [
      { id, status: "authorised" },
      { id, status: "captured" },
    ]);

    expect(next.find((row) => row.id === id)!.status).toBe("captured");
  });
});
