"use client";

import type { LadderStep, RuleId } from "@/entities/reference-food";
import type { FoodMatchStrings } from "../model/strings";

export function RuleLadder({
  steps,
  diverging,
  selected,
  onSelect,
  strings,
}: {
  steps: LadderStep[];
  diverging?: RuleId;
  selected?: RuleId;
  onSelect: (rule: RuleId | undefined) => void;
  strings: FoodMatchStrings;
}) {
  return (
    <div className="border-border bg-surface border-2">
      <p className="border-border spec text-muted border-b-2 px-3 py-2">{strings.why}</p>
      <ol>
        {steps.map((step, index) => {
          const active = step.id === selected;

          return (
            <li key={step.id} className="border-border border-t-2 first:border-t-0">
              <button
                type="button"
                aria-pressed={active}
                data-rule={step.id}
                disabled={step.dropped.length === 0}
                onClick={() => onSelect(active ? undefined : step.id)}
                className={`flood flex w-full cursor-pointer items-baseline gap-3 px-3 py-2 text-left disabled:cursor-default disabled:opacity-45 ${
                  active ? "bg-accent text-on-accent" : ""
                }`}
              >
                <span className="spec shrink-0 tabular-nums">{index + 1}</span>
                <span className="spec grow">{strings.rules[step.id]}</span>
                {step.dropped.length > 0 ? (
                  <span className="spec shrink-0 tabular-nums">−{step.dropped.length}</span>
                ) : null}
              </button>

              {step.id === diverging ? (
                <p
                  data-diverging={step.id}
                  className="spec text-accent-ink border-border border-t-2 px-3 py-2 normal-case"
                >
                  {strings.divergeHere}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
