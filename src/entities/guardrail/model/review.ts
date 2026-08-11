import { gates, meters } from "./gates";
import { project } from "./project";
import { linkIds, type Diff, type Project, type TierId, type Verdict } from "./types";

export function applyDiff(diff: Diff): Project {
  const patched = [...project];

  for (const file of diff.files) {
    const at = patched.findIndex((item) => item.path === file.path);
    if (at === -1) patched.push(file);
    else patched[at] = file;
  }

  return patched;
}

export type Review = {
  build: Verdict[];
  threshold: Verdict[];
  chain: Verdict[];
  /** Ярус, на котором правку остановили. `undefined` — она доехала. */
  stoppedAt?: TierId;
  /** Вызовов модели. Два нижних яруса не стоят ни одного. */
  calls: number;
};

/**
 * Ярусы идут снизу вверх и дешёвое считается первым: цепочку не зовут по
 * правке, которую уже не пропустила сборка.
 */
export function review(diff: Diff): Review {
  const patched = applyDiff(diff);

  const build: Verdict[] = gates.map((gate) => {
    const message = gate.check(patched);
    return { tier: "build", gate: gate.id, passed: message === undefined, message };
  });

  if (build.some((verdict) => verdict.tier === "build" && !verdict.passed)) {
    return { build, threshold: [], chain: [], stoppedAt: "build", calls: 0 };
  }

  const threshold: Verdict[] = meters.map((meter) => ({
    tier: "threshold",
    meter: meter.id,
    value: meter.measure(patched),
    unit: meter.unit,
    ceiling: meter.ceiling,
  }));

  const over = threshold.find(
    (verdict) =>
      verdict.tier === "threshold" &&
      verdict.ceiling !== undefined &&
      verdict.value >= verdict.ceiling,
  );

  if (over) return { build, threshold, chain: [], stoppedAt: "threshold", calls: 0 };

  const chain: Verdict[] = [];

  for (const link of linkIds) {
    const objection = diff.objections.find((item) => item.link === link);
    chain.push({ tier: "chain", link, body: objection?.body, soft: objection?.soft });

    // Звено видит только то, что пережило предыдущее
    if (objection?.body && !objection.soft) {
      return { build, threshold, chain, stoppedAt: "chain", calls: chain.length };
    }
  }

  return { build, threshold, chain, calls: chain.length };
}

export const stopped = (result: Review) => result.stoppedAt !== undefined;
