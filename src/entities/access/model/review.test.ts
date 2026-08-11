import { describe, expect, it } from "vitest";
import { divergences, review } from "./review";
import { actors, tickets } from "./tickets";
import { roles, ruleKeys, type Action, type Role } from "./types";

const allowed = (role: Role, action: Action) =>
  review(actors[role], tickets)
    .filter((row) => row.verdicts[action].allowed)
    .map((row) => row.ticket.id);

describe("access rules", () => {
  it("shows a resident their own flat and nothing else", () => {
    expect(allowed("resident", "read")).toEqual(["TCK-1041", "TCK-1042", "TCK-1047"]);
  });

  it("lets a dispatcher close only what is assigned to them", () => {
    expect(allowed("dispatcher", "close")).toEqual(["TCK-1041", "TCK-1044", "TCK-1045"]);
  });

  it("holds an invoice until the ticket is done", () => {
    expect(allowed("accountant", "invoice")).toEqual(["TCK-1041", "TCK-1044", "TCK-1048"]);
    expect(allowed("accountant", "assign")).toEqual([]);
  });

  it("names the rule behind every allowed action", () => {
    for (const role of roles) {
      for (const row of review(actors[role], tickets)) {
        for (const [action, verdict] of Object.entries(row.verdicts)) {
          const where = `${role}/${action}/${row.ticket.id}`;
          if (verdict.allowed) expect(ruleKeys, where).toContain(verdict.rule);
          else expect(verdict.rule, where).toBeUndefined();
        }
      }
    }
  });

  // Ради этого демо и существует: проверка по роли ошибается на строках, а не
  // на ролях, и потому выглядит рабочей ровно до первой чужой квартиры
  it("diverges from the role-only check row by row", () => {
    expect(divergences(review(actors.resident, tickets))).toBe(12);
    expect(divergences(review(actors.dispatcher, tickets))).toBe(5);
    expect(divergences(review(actors.operator, tickets))).toBe(5);
    expect(divergences(review(actors.accountant, tickets))).toBe(5);
  });

  it("never lets the role-only check be the stricter of the two", () => {
    for (const role of roles) {
      for (const row of review(actors[role], tickets)) {
        for (const [action, verdict] of Object.entries(row.verdicts)) {
          expect(verdict.allowed && !verdict.naive, `${role}/${action}`).toBe(false);
        }
      }
    }
  });
});
