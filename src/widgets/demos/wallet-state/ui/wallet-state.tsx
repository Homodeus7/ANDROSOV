"use client";

import { useState } from "react";
import { TRANSITIONS, initialState, reduce, type EventName } from "@/entities/wallet";
import type { WalletStateStrings } from "../model/strings";
import { AppPanel } from "./app-panel";
import { WalletPanel } from "./wallet-panel";

type Step = { key: number; from: string; event: EventName; to: string };

const TRAIL = 4;

export function WalletState({ strings }: { strings: WalletStateStrings }) {
  const [state, setState] = useState(initialState);
  const [trail, setTrail] = useState<Step[]>([]);

  // Кнопка включена ровно тогда, когда переход существует. Та же таблица,
  // которую проверяет тест, — второго списка «что сейчас можно» нет
  const can = (name: EventName) => TRANSITIONS[state.status][name] !== undefined;

  function send(name: EventName, chainId?: number) {
    const next = reduce(state, { name, chainId });
    if (next === state) return;

    setState(next);
    setTrail((steps) =>
      [{ key: steps.length, from: state.status, event: name, to: next.status }, ...steps].slice(
        0,
        TRAIL,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <WalletPanel state={state} can={can} onEvent={send} strings={strings} />
        <AppPanel state={state} can={can} onEvent={send} strings={strings} />
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
