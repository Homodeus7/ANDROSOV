import type { DiffId, GateId, Level } from "@/entities/guardrail";

export type GuardrailsStrings = {
  proposes: string;
  gates: string;
  files: string;
  stopped: string;
  passed: string;
  advice: string;
  levels: Record<Level, string>;
  gateNames: Record<GateId, string>;
  diffs: Record<DiffId, { title: string; body: string }>;
  hint: string;
  note: string;
};
