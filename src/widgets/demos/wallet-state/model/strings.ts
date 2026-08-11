import type { AdviceKey, EventName, Status } from "@/entities/wallet";

export type WalletStateStrings = {
  wallet: string;
  app: string;
  chain: string;
  statuses: Record<Status, string>;
  advice: Record<AdviceKey, string>;
  events: Record<EventName, string>;
  raw: string;
  quiet: string;
  signature: string;
  trail: string;
  hint: string;
  note: string;
};
