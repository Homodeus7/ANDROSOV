import { createRandom, type Random } from "./random";
import type { Transaction, TxStatus, TxUpdate } from "./types";

const METHODS = ["CARD", "SEPA", "SWIFT", "CRYPTO"] as const;
const CURRENCIES = ["EUR", "USD", "GBP"] as const;

const FLOW: Record<TxStatus, readonly TxStatus[]> = {
  pending: ["authorised", "failed"],
  authorised: ["captured", "failed"],
  captured: ["refunded", "pending"],
  refunded: ["pending"],
  failed: ["pending"],
};

const pick = <T>(options: readonly T[], random: Random) =>
  options[Math.floor(random() * options.length)]!;

export function createLedger(count: number, seed = 20250401): Transaction[] {
  const random = createRandom(seed);

  return Array.from({ length: count }, (_, index) => ({
    id: `TX-${String(index + 1).padStart(5, "0")}`,
    merchant: `MRC-${1000 + Math.floor(random() * 400)}`,
    method: pick(METHODS, random),
    amount: Math.round(random() * 480000) / 100 + 5,
    currency: pick(CURRENCIES, random),
    status: pick(["pending", "authorised", "captured"] as const, random),
  }));
}

export const nextUpdate = (rows: readonly Transaction[], random: Random): TxUpdate => {
  const row = pick(rows, random);
  return { id: row.id, status: pick(FLOW[row.status], random) };
};

/**
 * Строки, которых обновление не касается, возвращаются **той же ссылкой** —
 * на этом и держится `memo` в таблице. Мемоизация без стабильных ссылок не
 * стоит ничего: строка перерисовывается, потому что это другой объект, а не
 * потому что в ней что-то изменилось.
 */
export function applyUpdate(
  rows: readonly Transaction[],
  update: TxUpdate,
): readonly Transaction[] {
  const index = rows.findIndex((row) => row.id === update.id);
  if (index === -1 || rows[index]!.status === update.status) return rows;

  const next = rows.slice();
  next[index] = { ...rows[index]!, status: update.status };
  return next;
}

export const applyUpdates = (rows: readonly Transaction[], updates: readonly TxUpdate[]) =>
  updates.reduce(applyUpdate, rows);
