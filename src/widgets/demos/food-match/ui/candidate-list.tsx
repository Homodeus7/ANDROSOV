"use client";

import type { ReferenceRow } from "@/entities/reference-food";

const key = (row: ReferenceRow) => `${row.dataset}:${row.externalId}`;

export function CandidateList({
  title,
  rows,
  dropped,
  droppedLabel,
}: {
  title: string;
  rows: ReferenceRow[];
  /** Строки, отсеянные выбранной ступенью лестницы. */
  dropped?: ReferenceRow[];
  droppedLabel: string;
}) {
  const marked = new Set((dropped ?? []).map(key));

  return (
    <div className="border-border bg-bg min-w-0 border-2">
      <p className="border-border spec text-muted border-b-2 px-3 py-2">{title}</p>
      <ul>
        {rows.map((row, index) => {
          const out = marked.has(key(row));

          return (
            <li
              key={key(row)}
              data-row={key(row)}
              data-chosen={index === 0 ? "" : undefined}
              data-dropped={out ? "" : undefined}
              className={`border-border flex items-baseline gap-3 border-t-2 px-3 py-2 first:border-t-0 ${
                out ? "opacity-40" : ""
              }`}
            >
              <span
                className={`display shrink-0 tabular-nums ${
                  index === 0 ? "text-accent-ink text-xl" : "text-muted"
                }`}
              >
                {row.kcal}
              </span>
              <span className="min-w-0 text-sm leading-snug">
                {row.name}
                <span className="spec text-muted ml-2 whitespace-nowrap">{row.dataset}</span>
                {out ? <span className="spec text-muted ml-2">{droppedLabel}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
