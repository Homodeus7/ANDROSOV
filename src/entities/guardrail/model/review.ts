import { gates } from "./gates";
import { project } from "./project";
import type { Diff, Project, Verdict } from "./types";

export function applyDiff(diff: Diff): Project {
  const patched = [...project];

  for (const file of diff.files) {
    const at = patched.findIndex((item) => item.path === file.path);
    if (at === -1) patched.push(file);
    else patched[at] = file;
  }

  return patched;
}

/** Что скажет каждый из ворот, если правку внести. */
export function review(diff: Diff): Verdict[] {
  const patched = applyDiff(diff);

  return gates.map((gate) => {
    const message = gate.check(patched);
    return { gate: gate.id, level: gate.level, passed: message === undefined, message };
  });
}

export const blocked = (verdicts: readonly Verdict[]) =>
  verdicts.some((verdict) => !verdict.passed);
