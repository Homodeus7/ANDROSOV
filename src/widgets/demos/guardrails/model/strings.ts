import type { DiffId, GateId, LinkId, MeterId, TierId } from "@/entities/guardrail";

export type GuardrailsStrings = {
  proposes: string;
  files: string;
  tiers: Record<TierId, string>;
  calls: string;
  gateNames: Record<GateId, string>;
  meterNames: Record<MeterId, string>;
  linkNames: Record<LinkId, string>;
  noCeiling: string;
  ceiling: string;
  silent: string;
  notReached: string;
  outcomes: Record<TierId, string>;
  passed: string;
  diffs: Record<DiffId, { title: string; body: string }>;
  hint: string;
  note: string;
};
