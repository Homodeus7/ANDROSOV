export const statuses = [
  "disconnected",
  "connecting",
  "wrongChain",
  "switching",
  "ready",
  "signing",
] as const;

export type Status = (typeof statuses)[number];

/** Первые три идут от приложения, остальные — ответ кошелька и внешние события. */
export const eventNames = [
  "connect",
  "switch",
  "sign",
  "approve",
  "reject",
  "busy",
  "chainChanged",
  "disconnect",
] as const;

export type EventName = (typeof eventNames)[number];

export type WalletEvent = { name: EventName; chainId?: number };

export type ProviderError = { code: number; message: string };

export const adviceKeys = [
  "idle",
  "connecting",
  "wrongChain",
  "switching",
  "ready",
  "signing",
  "rejected",
  "pending",
  "signed",
] as const;

export type AdviceKey = (typeof adviceKeys)[number];

export type WalletState = {
  status: Status;
  /** Сеть кошелька, а не та, которую хочет приложение. */
  chainId: number;
  /** Последний сырой ответ провайдера. Живёт до следующего запроса. */
  error?: ProviderError;
  signature?: string;
};
