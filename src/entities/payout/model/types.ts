export const PAYOUT_METHODS = ["card", "sepa", "swift", "crypto"] as const;
export const CURRENCIES = ["EUR", "USD", "GBP"] as const;
export const NETWORKS = ["TRC20", "ERC20"] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export type Check =
  | { kind: "min"; value: number }
  | { kind: "max"; value: number }
  | { kind: "pattern"; source: string };

export type PayoutField = {
  name: string;
  type: "string" | "number" | "enum";
  options?: readonly string[];
  checks: readonly Check[];
};

export type PayoutValues = Record<string, string>;
