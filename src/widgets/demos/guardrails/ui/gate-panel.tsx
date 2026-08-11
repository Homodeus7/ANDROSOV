"use client";

import type { Verdict } from "@/entities/guardrail";
import type { GuardrailsStrings } from "../model/strings";

export function GatePanel({
  verdicts,
  strings,
}: {
  verdicts: Verdict[];
  strings: GuardrailsStrings;
}) {
  return (
    <div className="border-border bg-surface border-2">
      <p className="border-border spec text-muted border-b-2 px-3 py-2">{strings.gates}</p>
      <ul>
        {verdicts.map((verdict) => (
          <li
            key={verdict.gate}
            data-gate={verdict.gate}
            data-passed={verdict.passed ? "" : undefined}
            className="border-border border-t-2 px-3 py-2 first:border-t-0"
          >
            <div className="flex items-baseline gap-3">
              <span
                aria-hidden
                className={`display shrink-0 ${verdict.passed ? "text-muted" : "text-accent-ink"}`}
              >
                {verdict.passed ? "✓" : "✗"}
              </span>
              <span className="spec grow">{strings.gateNames[verdict.gate]}</span>
              <span className="spec text-muted shrink-0">{strings.levels[verdict.level]}</span>
            </div>

            {verdict.message ? (
              // Сообщение печатается как есть: это то, что скажет сборка
              <p className="text-accent-ink mt-2 font-mono text-xs leading-snug break-words">
                {verdict.message}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
