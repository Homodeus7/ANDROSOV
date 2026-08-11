import { describe, expect, it } from "vitest";
import { diffs } from "./diffs";
import { gates, meters } from "./gates";
import { project } from "./project";
import { review, stopped } from "./review";
import { linkIds, type Diff } from "./types";

const failed = (diff: Diff) =>
  review(diff)
    .build.filter((verdict) => verdict.tier === "build" && !verdict.passed)
    .map((verdict) => (verdict.tier === "build" ? verdict.gate : undefined));

describe("the project as it stands", () => {
  it("passes every gate", () => {
    for (const gate of gates) expect(gate.check(project), gate.id).toBeUndefined();
  });

  it("measures without stopping, because neither meter has a ceiling", () => {
    for (const meter of meters) expect(meter.ceiling, meter.id).toBeUndefined();
  });
});

describe("every prepared diff", () => {
  // Ограждение, срабатывания которого никто не видел, ограждением не является
  for (const diff of diffs) {
    it(`is stopped by exactly the gates "${diff.id}" claims`, () => {
      expect(failed(diff)).toEqual(diff.caught);
    });
  }

  it("leaves one diff that clears all three tiers", () => {
    expect(diffs.filter((diff) => !stopped(review(diff)))).toHaveLength(1);
  });
});

describe("the tiers run cheapest first", () => {
  for (const diff of diffs.filter((item) => item.caught.length > 0)) {
    it(`spends nothing on the chain when the build already refused "${diff.id}"`, () => {
      const result = review(diff);

      expect(result.stoppedAt).toBe("build");
      expect(result.threshold).toEqual([]);
      expect(result.chain).toEqual([]);
      expect(result.calls).toBe(0);
    });
  }

  it("never charges a model call for a gate or a meter", () => {
    for (const diff of diffs) {
      const result = review(diff);
      expect(result.calls, diff.id).toBe(result.chain.length);
    }
  });
});

describe("the chain", () => {
  // Звено, возражения которого никто не видел, — та же неоткрывающаяся стена
  for (const link of linkIds) {
    it(`has "${link}" object to at least one diff`, () => {
      const objecting = diffs.filter((diff) =>
        diff.objections.some((objection) => objection.link === link && objection.body),
      );

      expect(objecting.length).toBeGreaterThan(0);
    });
  }

  it("stops at the first link that objects, so later links never ran", () => {
    for (const diff of diffs) {
      const chain = review(diff).chain;
      const hard = chain.findIndex(
        (verdict) => verdict.tier === "chain" && verdict.body && !verdict.soft,
      );

      if (hard !== -1) expect(hard, diff.id).toBe(chain.length - 1);
    }
  });

  it("records an objection only for a link that was reached", () => {
    for (const diff of diffs) {
      const reached = review(diff).chain.map((verdict) =>
        verdict.tier === "chain" ? verdict.link : undefined,
      );

      for (const objection of diff.objections) {
        expect(reached, `${diff.id} / ${objection.link}`).toContain(objection.link);
      }
    }
  });
});
