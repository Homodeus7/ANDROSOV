"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { cn } from "@/shared/lib";
import type { LiveRollupStrings } from "../model/strings";

const REPORT_MS = 250;
/** Ниже этого расхождение — шум последнего, ещё не закрытого бакета. */
const SAME = 0.0005;

export type Meters = {
  events: number;
  rawTotal: number;
  foldedTotal: number;
  drift: number;
  worst: number;
};

type Snapshot = Omit<Meters, "events"> & { perSecond: number };

const EMPTY: Snapshot = { perSecond: 0, rawTotal: 0, foldedTotal: 0, drift: 0, worst: 0 };

export function RollupMeters({
  meters,
  bucket,
  locale,
  strings,
  className,
}: {
  meters: RefObject<Meters>;
  bucket: string;
  locale: string;
  strings: LiveRollupStrings;
  className?: string;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);

  useEffect(() => {
    let events = meters.current.events;

    const timer = setInterval(() => {
      const current = meters.current;
      setSnapshot({
        perSecond: Math.round(((current.events - events) * 1000) / REPORT_MS),
        rawTotal: current.rawTotal,
        foldedTotal: current.foldedTotal,
        drift: current.drift,
        worst: current.worst,
      });
      events = current.events;
    }, REPORT_MS);

    return () => clearInterval(timer);
  }, [meters]);

  const number = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale],
  );

  const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const apart =
    Math.abs(snapshot.rawTotal - snapshot.foldedTotal) /
    Math.max(Math.abs(snapshot.rawTotal), Math.abs(snapshot.foldedTotal), 1);
  const identical = apart < SAME;

  const cells: { id: string; label: string; value: string; accent: boolean }[] = [
    {
      id: "drift",
      label: strings.drift,
      value: percent(snapshot.drift),
      accent: snapshot.drift >= SAME,
    },
    { id: "worst", label: strings.worstDrift, value: percent(snapshot.worst), accent: false },
    { id: "bucket", label: strings.bucket, value: bucket, accent: false },
    {
      id: "events",
      label: strings.events,
      value: number.format(snapshot.perSecond),
      accent: false,
    },
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="border-border bg-surface flex flex-wrap items-baseline gap-x-6 gap-y-2 border-2 p-4">
        <span className="spec text-muted basis-full">{strings.plotted}</span>
        <span className="flex items-baseline gap-2">
          <span className="display text-xl tabular-nums" data-meter="raw">
            {number.format(snapshot.rawTotal)}
          </span>
          <span className="spec text-muted">{strings.fromRaw}</span>
        </span>
        <span className="flex items-baseline gap-2">
          <span className="display text-muted text-xl tabular-nums" data-meter="folded">
            {number.format(snapshot.foldedTotal)}
          </span>
          <span className="spec text-muted">{strings.fromBuckets}</span>
        </span>
        <span
          data-verdict={identical ? "identical" : "drift"}
          className={`spec ml-auto ${identical ? "text-muted" : "text-accent-ink"}`}
        >
          {identical ? strings.identical : `${strings.offBy} ${percent(apart)}`}
        </span>
      </div>

      <div className="border-border bg-surface flex flex-wrap gap-y-4 border-2 p-4">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="border-border grow basis-28 border-l-2 pl-3 first:border-l-0"
          >
            <p
              data-meter={cell.id}
              className={`display text-2xl tabular-nums ${cell.accent ? "text-accent-ink" : "text-fg"}`}
            >
              {cell.value}
            </p>
            <p className="spec text-muted mt-1">{cell.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
