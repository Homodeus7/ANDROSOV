import type { TxStatus } from "@/entities/ledger";

export type TxTableStrings = {
  table: string;
  virtual: string;
  memo: string;
  pause: string;
  resume: string;
  reset: string;
  columns: { id: string; merchant: string; method: string; amount: string; status: string };
  statuses: Record<TxStatus, string>;
  rowsInDom: string;
  rowsTotal: string;
  renders: string;
  messages: string;
  fps: string;
  hint: string;
  note: string;
};
