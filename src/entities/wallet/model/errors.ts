import type { AdviceKey, ProviderError, WalletState } from "./types";

/** Дословно то, что возвращает провайдер по EIP-1193. */
export const REJECTED: ProviderError = { code: 4001, message: "User rejected the request." };

export const PENDING: ProviderError = {
  code: -32002,
  message:
    "Request of type 'wallet_requestPermissions' already pending for origin. Please wait.",
};

/**
 * Тексты пишутся по этому ключу, а не по коду: одному коду отвечают разные
 * состояния — 4001 на подключении выкидывает в исходную точку, 4001 на подписи
 * не трогает подключение вообще.
 */
export function explain(state: WalletState): AdviceKey {
  if (state.error?.code === PENDING.code) return "pending";
  if (state.error?.code === REJECTED.code) return "rejected";

  switch (state.status) {
    case "disconnected":
      return "idle";
    case "ready":
      return state.signature ? "signed" : "ready";
    default:
      return state.status;
  }
}
