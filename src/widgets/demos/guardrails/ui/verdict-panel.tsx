"use client";

import { tierIds, type Review, type TierId, type Verdict } from "@/entities/guardrail";
import type { GuardrailsStrings } from "../model/strings";

const Row = ({
  mark,
  passed,
  name,
  aside,
  body,
  attrs,
}: {
  mark: string;
  passed: boolean;
  name: string;
  aside?: string;
  body?: string;
  attrs: Record<string, string | undefined>;
}) => (
  <li {...attrs} className="border-border border-t-2 px-3 py-2 first:border-t-0">
    <div className="flex items-baseline gap-3">
      <span aria-hidden className={`display shrink-0 ${passed ? "text-muted" : "text-accent-ink"}`}>
        {mark}
      </span>
      <span className="spec grow">{name}</span>
      {aside ? <span className="spec text-muted shrink-0 tabular-nums">{aside}</span> : null}
    </div>

    {body ? (
      // Печатается как есть: это то, что сказал инструмент. Возражение ревьюера
      // длиннее сообщения линта, поэтому прокручивается, а не сокращается
      <p className="text-accent-ink mt-2 max-h-56 overflow-y-auto font-mono text-xs leading-snug whitespace-pre-wrap">
        {body}
      </p>
    ) : null}
  </li>
);

function row(verdict: Verdict, strings: GuardrailsStrings) {
  if (verdict.tier === "build") {
    return (
      <Row
        key={verdict.gate}
        attrs={{ "data-gate": verdict.gate, "data-passed": verdict.passed ? "" : undefined }}
        mark={verdict.passed ? "✓" : "✗"}
        passed={verdict.passed}
        name={strings.gateNames[verdict.gate]}
        body={verdict.message}
      />
    );
  }

  if (verdict.tier === "threshold") {
    return (
      <Row
        key={verdict.meter}
        attrs={{ "data-meter": verdict.meter }}
        mark="="
        passed
        name={strings.meterNames[verdict.meter]}
        aside={`${verdict.value} ${verdict.unit} · ${
          verdict.ceiling === undefined
            ? strings.noCeiling
            : `${strings.ceiling} ${verdict.ceiling}`
        }`}
      />
    );
  }

  return (
    <Row
      key={verdict.link}
      attrs={{ "data-link": verdict.link, "data-silent": verdict.body ? undefined : "" }}
      mark={verdict.body ? (verdict.soft ? "?" : "✗") : "✓"}
      passed={!verdict.body || Boolean(verdict.soft)}
      name={strings.linkNames[verdict.link]}
      aside={verdict.body ? undefined : strings.silent}
      body={verdict.body}
    />
  );
}

export function VerdictPanel({
  result,
  strings,
}: {
  result: Review;
  strings: GuardrailsStrings;
}) {
  const rows: Record<TierId, Verdict[]> = {
    build: result.build,
    threshold: result.threshold,
    chain: result.chain,
  };

  return (
    <div className="flex flex-col gap-3">
      {tierIds.map((tier) => (
        <div key={tier} data-tier={tier} className="border-border bg-surface border-2">
          <p className="border-border flex items-baseline gap-3 border-b-2 px-3 py-2">
            <span className="spec text-muted grow">{strings.tiers[tier]}</span>
            <span className="spec text-muted shrink-0 tabular-nums" data-cost={tier}>
              {strings.calls}: {tier === "chain" ? result.calls : 0}
            </span>
          </p>

          {rows[tier].length > 0 ? (
            <ul>{rows[tier].map((verdict) => row(verdict, strings))}</ul>
          ) : (
            <p className="spec text-muted px-3 py-2 normal-case">{strings.notReached}</p>
          )}
        </div>
      ))}
    </div>
  );
}
