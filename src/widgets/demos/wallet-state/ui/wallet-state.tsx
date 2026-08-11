"use client";

import { useReducer } from "react";
import {
  TRANSITIONS,
  initialState,
  reduce,
  type EventName,
  type WalletEvent,
  type WalletState as Wallet,
} from "@/entities/wallet";
import type { WalletStateStrings } from "../model/strings";
import { AppPanel } from "./app-panel";
import { WalletPanel } from "./wallet-panel";

type Step = { key: number; from: string; event: EventName; to: string };
type Log = { wallet: Wallet; trail: Step[] };

const TRAIL = 4;

function advance(log: Log, event: WalletEvent): Log {
  const wallet = reduce(log.wallet, event);
  if (wallet === log.wallet) return log;

  const entry = {
    key: (log.trail[0]?.key ?? 0) + 1,
    from: log.wallet.status,
    event: event.name,
    to: wallet.status,
  };
  return { wallet, trail: [entry, ...log.trail].slice(0, TRAIL) };
}

export function WalletState({ strings }: { strings: WalletStateStrings }) {
  const [{ wallet, trail }, send] = useReducer(advance, { wallet: initialState, trail: [] });

  // Кнопка включена ровно тогда, когда переход существует. Та же таблица,
  // которую проверяет тест, — второго списка «что сейчас можно» нет
  const can = (name: EventName) => TRANSITIONS[wallet.status][name] !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <WalletPanel
          state={wallet}
          can={can}
          onEvent={(name, chainId) => send({ name, chainId })}
          strings={strings}
        />
        <AppPanel
          state={wallet}
          can={can}
          onEvent={(name) => send({ name })}
          strings={strings}
        />
      </div>

      <div className="border-border bg-surface border-2 p-3">
        <p className="spec text-muted">{strings.trail}</p>
        <ol className="mt-2 flex flex-col gap-1 font-mono text-xs">
          {trail.length === 0 ? <li className="text-muted">—</li> : null}
          {trail.map((step) => (
            <li key={step.key} data-step={step.event}>
              {step.from} <span className="text-muted">—{step.event}→</span> {step.to}
            </li>
          ))}
        </ol>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
      <p className="text-muted max-w-prose text-xs">{strings.note}</p>
    </div>
  );
}
