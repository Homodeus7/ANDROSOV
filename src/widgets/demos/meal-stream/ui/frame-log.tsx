"use client";

import { Fragment, useEffect, useRef } from "react";
import { cn } from "@/shared/lib";
import type { StreamEvent } from "../model/protocol";
import type { MealStreamStrings } from "../model/strings";

export type LogEntry =
  | { kind: "chunk"; at: number; bytes: number; text: string }
  | { kind: "event"; event: StreamEvent }
  | { kind: "dropped"; text: string };

export type Wire = "waiting" | "live" | "closed" | "cut";

const describe = (event: StreamEvent) => {
  switch (event.type) {
    case "status":
      return `status · ${event.step}`;
    case "parsed":
      return `parsed · ${event.items.length} items · ${event.confidence}`;
    case "item":
      return `item #${event.index} · ${event.item.kcal} kcal`;
    case "item-failed":
      return `item-failed #${event.index}`;
    case "done":
      return `done · ${event.confidence}`;
    case "error":
      return `error · ${event.code}`;
  }
};

/** Перевод строки — граница кадра, поэтому он виден, а не съеден переносом. */
function Raw({ text }: { text: string }) {
  return text.split("\n").map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <span className="text-accent-ink">↵</span> : null}
      {part}
    </Fragment>
  ));
}

export function FrameLog({
  entries,
  pending,
  wire,
  strings,
  className,
}: {
  entries: LogEntry[];
  pending: string;
  wire: Wire;
  strings: MealStreamStrings;
  className?: string;
}) {
  const scroller = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [entries.length, pending]);

  let bytes = 0;
  let chunks = 0;
  let frames = 0;
  for (const entry of entries) {
    if (entry.kind === "chunk") {
      bytes += entry.bytes;
      chunks += 1;
    }
    if (entry.kind === "event") frames += 1;
  }

  const wireLabel = {
    waiting: strings.waiting,
    live: strings.live,
    closed: strings.closed,
    cut: strings.cut,
  }[wire];

  return (
    <div
      className={cn("border-border bg-bg flex min-h-0 min-w-0 flex-col border-2", className)}
    >
      <div className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 border-b-2 px-3 py-2">
        <span className="spec">{strings.log}</span>
        <span className="spec text-muted flex items-center gap-2" data-wire-label="">
          <span
            aria-hidden
            className={cn(
              "inline-block size-2",
              wire === "live" && "bg-accent animate-pulse",
              wire === "closed" && "bg-muted",
              wire === "cut" && "border-fg border-2",
              wire === "waiting" && "border-muted border-2",
            )}
          />
          {wireLabel}
        </span>
        <span className="spec text-muted ml-auto tabular-nums">
          {bytes} {strings.bytes} · {chunks} {strings.chunks} · {frames} {strings.frames}
        </span>
      </div>

      <ol
        ref={scroller}
        className="h-80 grow overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed lg:h-auto lg:min-h-0"
      >
        {entries.map((entry, index) =>
          entry.kind === "chunk" ? (
            <li key={index} data-log="chunk" className="flex gap-3">
              <span className="text-muted w-14 shrink-0 text-right tabular-nums">
                +{(entry.at / 1000).toFixed(2)}s
              </span>
              <span className="text-muted w-10 shrink-0 text-right tabular-nums">
                {entry.bytes}B
              </span>
              <span className="min-w-0 break-all">
                <Raw text={entry.text} />
              </span>
            </li>
          ) : entry.kind === "event" ? (
            <li
              key={index}
              data-log="event"
              data-event={entry.event.type}
              className="text-accent-ink pl-[7.5rem] font-bold"
            >
              ▸ {describe(entry.event)}
            </li>
          ) : (
            <li key={index} data-log="dropped" className="pl-[7.5rem] break-all">
              <span className="font-bold">✕ {strings.dropped}</span>{" "}
              <span className="text-muted line-through">{entry.text}</span>
            </li>
          ),
        )}
      </ol>

      <div className="border-border flex min-w-0 items-baseline gap-3 border-t-2 px-3 py-2 font-mono text-xs">
        <span className="spec text-muted shrink-0">{strings.buffer}</span>
        <span className="text-muted min-w-0 truncate" data-buffer="">
          {pending ? <Raw text={pending.slice(-72)} /> : null}
          {wire === "live" ? (
            <span
              aria-hidden
              className="bg-fg ml-0.5 inline-block h-3 w-1.5 animate-pulse align-middle"
            />
          ) : null}
        </span>
      </div>
    </div>
  );
}
