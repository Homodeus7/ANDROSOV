"use client";

import { cn } from "@/shared/lib";
import type { Verdict } from "@/entities/access";
import type { AccessMatrixStrings } from "../model/strings";
import type { Asked } from "./ticket-row";

export function RulePanel({
  asked,
  verdict,
  naiveMode,
  visible,
  total,
  diverges,
  strings,
  className,
}: {
  asked?: Asked;
  verdict?: Verdict;
  naiveMode: boolean;
  visible: number;
  total: number;
  diverges: number;
  strings: AccessMatrixStrings;
  className?: string;
}) {
  const allowed = verdict && (naiveMode ? verdict.naive : verdict.allowed);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="border-border bg-surface border-2 p-4">
        {asked && verdict ? (
          <>
            <p className="spec text-muted">
              {asked.id} · {strings.actions[asked.action]}
            </p>
            <p
              data-verdict={allowed ? "allowed" : "denied"}
              className={`display mt-2 text-2xl ${allowed ? "text-accent-ink" : ""}`}
            >
              {allowed ? strings.allowed : strings.denied}
            </p>
            <p data-rule={verdict.rule ?? "none"} className="mt-3 text-sm leading-snug">
              {verdict.rule ? strings.rules[verdict.rule] : strings.noRule}
            </p>
            <p className="spec text-muted mt-3 normal-case">
              {strings.byRole}: {verdict.naive ? strings.allowed : strings.denied}
            </p>
          </>
        ) : (
          <p className="spec text-muted normal-case">{strings.ask}</p>
        )}
      </div>

      <dl className="border-border bg-bg grid grid-cols-2 gap-3 border-2 p-4">
        <div>
          <dd className="display text-2xl tabular-nums" data-count="visible">
            {visible}/{total}
          </dd>
          <dt className="spec text-muted mt-1">{strings.visible}</dt>
        </div>
        <div>
          <dd
            className={`display text-2xl tabular-nums ${diverges > 0 ? "text-accent-ink" : ""}`}
            data-count="diverges"
          >
            {diverges}
          </dd>
          <dt className="spec text-muted mt-1">{strings.diverges}</dt>
        </div>
      </dl>

      <p className="text-muted max-w-prose text-xs">{strings.note}</p>
    </div>
  );
}
