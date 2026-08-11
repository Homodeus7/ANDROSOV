"use client";

import { chains, type EventName, type WalletState } from "@/entities/wallet";
import { toolClass } from "../../model/tool-class";
import type { WalletStateStrings } from "../model/strings";

const ANSWERS: EventName[] = ["approve", "reject", "busy", "disconnect"];

export function WalletPanel({
  state,
  can,
  onEvent,
  strings,
}: {
  state: WalletState;
  can: (name: EventName) => boolean;
  onEvent: (name: EventName, chainId?: number) => void;
  strings: WalletStateStrings;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 border-2 p-4">
      <p className="spec text-muted">{strings.wallet}</p>

      <div>
        <p className="spec text-muted normal-case">{strings.chain}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chains.map((chain) => (
            <button
              key={chain.id}
              type="button"
              aria-pressed={chain.id === state.chainId}
              data-chain={chain.id}
              className={toolClass(chain.id === state.chainId)}
              onClick={() => onEvent("chainChanged", chain.id)}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ANSWERS.map((name) => (
          <button
            key={name}
            type="button"
            // Здесь `disabled` честен: кошельку, которого ни о чём не спросили,
            // нечего ответить — переход отсутствует, а не запрещён
            disabled={!can(name)}
            data-event={name}
            className={toolClass()}
            onClick={() => onEvent(name)}
          >
            {strings.events[name]}
          </button>
        ))}
      </div>

      <p className="text-muted max-w-prose text-xs">{strings.quiet}</p>
    </div>
  );
}
