import type { NormalizeRule } from "@/entities/flow";

export type FlowDemoStrings = {
  seedNames: string[];
  newBlockName: string;
  add: string;
  connect: string;
  connecting: string;
  remove: string;
  rename: string;
  undo: string;
  redo: string;
  reset: string;
  canvas: string;
  hint: string;
  buffer: string;
  saved: string;
  signals: string;
  empty: string;
  earlier: string;
  timeline: string;
  coverage: string;
  rules: Record<NormalizeRule, string>;
};
