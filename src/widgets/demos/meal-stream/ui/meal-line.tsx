"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib";
import type { Line } from "../model/meal";
import type { MealStreamStrings } from "../model/strings";
import { useTween } from "./use-tween";

export function MealLine({
  line,
  index,
  stalled,
  reduced,
  format,
  strings,
}: {
  line: Line;
  index: number;
  stalled: boolean;
  reduced: boolean;
  format: (value: number) => string;
  strings: MealStreamStrings;
}) {
  const flash = useRef<HTMLSpanElement>(null);
  const kcal = useTween(line.item?.kcal ?? 0, reduced);

  useEffect(() => {
    if (reduced || line.status === "pending") return;
    flash.current?.animate([{ opacity: 0.45 }, { opacity: 0 }], {
      duration: 900,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, [line.status, reduced]);

  const { item } = line;

  return (
    <li
      data-line={index}
      data-status={stalled ? "stalled" : line.status}
      className="border-border relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t-2 px-4 py-3"
    >
      <span
        ref={flash}
        aria-hidden
        className="bg-accent pointer-events-none absolute inset-0 opacity-0"
      />

      <span className="relative flex min-w-0 flex-wrap items-baseline gap-x-3">
        <span className={cn("font-bold", line.status === "failed" && "text-muted")}>
          {line.name}
        </span>
        <span className="spec text-muted">{line.quantity}</span>
      </span>

      <span className="relative row-span-2 flex flex-col items-end justify-center text-right">
        {item ? (
          <>
            <span className="display text-xl tabular-nums" data-kcal="">
              {Math.round(kcal)}
            </span>
            <span className="spec text-muted">{strings.kcal}</span>
          </>
        ) : line.status === "failed" ? (
          <span className="display text-muted text-xl">—</span>
        ) : (
          <span
            aria-hidden
            className={cn("bg-border block h-6 w-14", !stalled && "animate-pulse")}
          />
        )}
      </span>

      <span className="relative min-w-0 text-xs leading-snug">
        {item ? (
          <span className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-muted">{item.name}</span>
            <span className="spec text-muted whitespace-nowrap tabular-nums">
              {item.grams} {strings.grams} · {strings.protein} {format(item.protein)} ·{" "}
              {strings.fat} {format(item.fat)} · {strings.carbs} {format(item.carbs)}
            </span>
          </span>
        ) : line.status === "failed" ? (
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="spec border-muted border-2 border-dashed px-1.5">
              {strings.failed}
            </span>
            <span className="text-muted">{strings.failedHint}</span>
          </span>
        ) : stalled ? (
          <span className="spec text-muted">{strings.stalled}</span>
        ) : (
          <span className="flex items-center gap-2">
            <span aria-hidden className="bg-border block h-3 w-40 max-w-full animate-pulse" />
            <span className="spec text-muted">{strings.pending}</span>
          </span>
        )}
      </span>
    </li>
  );
}
