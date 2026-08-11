"use client";

import { explain, type EventName, type WalletState } from "@/entities/wallet";
import { toolClass } from "../../model/tool-class";
import type { WalletStateStrings } from "../model/strings";

const INTENTS: EventName[] = ["connect", "switch", "sign"];

export function AppPanel({
  state,
  can,
  onEvent,
  strings,
}: {
  state: WalletState;
  can: (name: EventName) => boolean;
  onEvent: (name: EventName) => void;
  strings: WalletStateStrings;
}) {
  const advice = explain(state);

  return (
    <div className="border-border bg-bg flex flex-col gap-4 border-2 p-4">
      <p className="spec text-muted">{strings.app}</p>

      <div>
        <p data-status={state.status} className="display text-2xl">
          {strings.statuses[state.status]}
        </p>
        <p data-advice={advice} className="mt-2 text-sm leading-snug">
          {strings.advice[advice]}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INTENTS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={!can(name)}
            data-event={name}
            className={toolClass()}
            onClick={() => onEvent(name)}
          >
            {strings.events[name]}
          </button>
        ))}
      </div>

      <div className="border-border border-2 p-3">
        <p className="spec text-muted">{strings.raw}</p>
        <pre
          data-code={state.error?.code ?? "none"}
          className="text-muted mt-2 font-mono text-xs break-all whitespace-pre-wrap"
        >
          {state.error ? JSON.stringify(state.error, null, 2) : "—"}
        </pre>
      </div>

      {state.signature ? (
        <p className="spec" data-signature="">
          {strings.signature}: <span className="font-mono normal-case">{state.signature}</span>
        </p>
      ) : null}
    </div>
  );
}
