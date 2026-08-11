"use client";

import { useMemo, useState } from "react";
import { blocked, diffs, review, type Diff } from "@/entities/guardrail";
import type { GuardrailsStrings } from "../model/strings";
import { GatePanel } from "./gate-panel";

export function Guardrails({ strings }: { strings: GuardrailsStrings }) {
  const [selected, setSelected] = useState<Diff>(diffs[0]!);

  const verdicts = useMemo(() => review(selected), [selected]);
  const stopped = blocked(verdicts);

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="border-border bg-bg border-2">
          <p className="border-border spec text-muted border-b-2 px-3 py-2">
            {strings.proposes}
          </p>
          <ul>
            {diffs.map((item) => {
              const active = item === selected;

              return (
                <li key={item.id} className="border-border border-t-2 first:border-t-0">
                  <button
                    type="button"
                    aria-pressed={active}
                    data-diff={item.id}
                    onClick={() => setSelected(item)}
                    className={`flood w-full cursor-pointer px-3 py-3 text-left ${
                      active ? "bg-accent text-on-accent" : ""
                    }`}
                  >
                    <span className="block text-sm leading-snug">
                      {strings.diffs[item.id].title}
                    </span>
                    <span
                      className={`spec mt-1 block normal-case ${active ? "" : "text-muted"}`}
                    >
                      {strings.diffs[item.id].body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="spec text-muted normal-case">{strings.hint}</p>
      </div>

      <div className="flex flex-col gap-4">
        <GatePanel verdicts={verdicts} strings={strings} />

        <p
          data-outcome={stopped ? "stopped" : selected.advice ? "advice" : "passed"}
          className={`border-2 p-4 text-sm ${
            stopped
              ? "border-accent-ink text-accent-ink"
              : // Пунктир: правка прошла, но чистой её назвать нельзя
                `border-border text-muted ${selected.advice ? "border-dashed" : ""}`
          }`}
        >
          {stopped ? strings.stopped : selected.advice ? strings.advice : strings.passed}
        </p>

        <div className="border-border bg-surface border-2 p-3">
          <p className="spec text-muted">{strings.files}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {selected.files.map((file) => (
              <li key={file.path} className="font-mono text-xs break-all">
                {file.path}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted max-w-prose text-xs">{strings.note}</p>
      </div>
    </div>
  );
}
