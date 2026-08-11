import { PENDING, REJECTED } from "./errors";
import type { EventName, Status, WalletEvent, WalletState } from "./types";

/** Сеть, в которой приложение умеет работать. Всё остальное — не та сеть. */
export const EXPECTED_CHAIN = 1;

export const SIGNATURE = "0x9f1c…4ae2";

/** Имена сетей — имена собственные, переводить в словарях нечего. */
export const chains = [
  { id: EXPECTED_CHAIN, name: "Ethereum" },
  { id: 137, name: "Polygon" },
];

/**
 * Переходы заданы таблицей, а не цепочкой `if`: события, которого в текущем
 * состоянии нет, не существует — им нечего сломать.
 */
export const TRANSITIONS: Record<Status, Partial<Record<EventName, Status>>> = {
  disconnected: { connect: "connecting" },
  connecting: {
    approve: "ready",
    reject: "disconnected",
    busy: "connecting",
    chainChanged: "connecting",
    disconnect: "disconnected",
  },
  wrongChain: { switch: "switching", chainChanged: "ready", disconnect: "disconnected" },
  switching: {
    approve: "ready",
    reject: "wrongChain",
    busy: "switching",
    chainChanged: "switching",
    disconnect: "disconnected",
  },
  ready: { sign: "signing", chainChanged: "ready", disconnect: "disconnected" },
  signing: {
    approve: "ready",
    reject: "ready",
    busy: "signing",
    chainChanged: "ready",
    disconnect: "disconnected",
  },
};

export const initialState: WalletState = { status: "disconnected", chainId: EXPECTED_CHAIN };

const ERRORS = { reject: REJECTED, busy: PENDING } as const;

export function reduce(state: WalletState, event: WalletEvent): WalletState {
  const next = TRANSITIONS[state.status][event.name];
  if (!next) return state;

  const chainId =
    event.name === "chainChanged" ? (event.chainId ?? state.chainId) : state.chainId;

  // Подключиться, подтвердить и всё равно оказаться не в той сети — обычный
  // случай, а не край: подтверждение относится к доступу, а не к сети
  const status = next === "ready" && chainId !== EXPECTED_CHAIN ? "wrongChain" : next;

  const signed = state.status === "signing" && event.name === "approve";
  const keepsSignature = status === "ready" && event.name !== "sign";

  return {
    status,
    chainId,
    error: event.name in ERRORS ? ERRORS[event.name as keyof typeof ERRORS] : undefined,
    signature: signed ? SIGNATURE : keepsSignature ? state.signature : undefined,
  };
}
