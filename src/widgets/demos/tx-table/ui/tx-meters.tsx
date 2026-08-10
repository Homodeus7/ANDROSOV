"use client";

import { useEffect, useState, type RefObject } from "react";
import type { FrameStats } from "@/entities/frame";
import type { TxTableStrings } from "../model/strings";

const REPORT_MS = 250;

export type Meters = {
  renders: number;
  messages: number;
  stats: () => FrameStats;
};

type Snapshot = { renders: number; messages: number; fps: number };

/**
 * Счётчики живут отдельным компонентом со своим состоянием: если бы их
 * обновление перерисовывало таблицу, измеритель попадал бы в собственные
 * измерения.
 */
export function TxMeters({
  meters,
  rowsInDom,
  rowsTotal,
  strings,
}: {
  meters: RefObject<Meters>;
  rowsInDom: number;
  rowsTotal: number;
  strings: TxTableStrings;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot>({ renders: 0, messages: 0, fps: 0 });

  useEffect(() => {
    let renders = meters.current.renders;
    let messages = meters.current.messages;

    const timer = setInterval(() => {
      const perSecond = 1000 / REPORT_MS;
      const current = meters.current;
      setSnapshot({
        renders: Math.round((current.renders - renders) * perSecond),
        messages: Math.round((current.messages - messages) * perSecond),
        fps: current.stats().fps,
      });
      renders = current.renders;
      messages = current.messages;
    }, REPORT_MS);

    return () => clearInterval(timer);
  }, [meters]);

  // Первым идёт то, что демо доказывает: не кадры, а число перерисованных
  // строк. Кадры на быстрой машине почти не проседают даже без мемоизации —
  // но работа всё равно делается впустую, и видно это здесь
  const cells: [string, string, boolean][] = [
    [strings.renders, String(snapshot.renders), true],
    [strings.rowsInDom, `${rowsInDom} / ${rowsTotal}`, false],
    [strings.fps, String(snapshot.fps), false],
    [strings.messages, String(snapshot.messages), false],
  ];

  return (
    <div className="border-border bg-surface flex flex-wrap gap-y-4 border-2 p-4">
      {cells.map(([label, value, accent]) => (
        <div
          key={label}
          className="border-border grow basis-28 border-l-2 pl-3 first:border-l-0"
        >
          <p
            data-meter={label}
            className={`display text-2xl tabular-nums ${accent ? "text-accent-ink" : "text-fg"}`}
          >
            {value}
          </p>
          <p className="spec text-muted mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
