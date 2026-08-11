"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  alignBucket,
  createRing,
  createStream,
  drift,
  metricIds,
  metrics,
  rollupFromBuckets,
  rollupFromRaw,
  type MetricId,
  type Point,
} from "@/entities/series";
import { toolClass } from "../../model/tool-class";
import type { LiveRollupStrings } from "../model/strings";
import { RollupChart, type ChartApi } from "./rollup-chart";
import { RollupMeters, type Meters } from "./rollup-meters";

/** Минутный бакет не наполнится за то время, что человек смотрит на демо. */
const SPEED = 60;
const BASE = 1_000;
const WINDOW_MS = 480_000;
const SIZES = [1_000, 5_000, 15_000, 60_000];
/** Кольцо обязано пережить всё окно: вытесненное событие стало бы дырой,
 *  которой в потоке не было, и демо соврало бы в свою пользу. */
const RING = 24_000;
const SEED = 20260811;
const REDRAW_MS = 50;
const MAX_FRAME_MS = 100;

const EMPTY: Meters = { events: 0, rawTotal: 0, foldedTotal: 0, drift: 0, worst: 0 };

const bucketLabel = (size: number) =>
  size < 60_000 ? `${size / 1_000}s` : `${size / 60_000}m`;

const total = (points: Point[]) =>
  points.reduce<number>((carry, point) => carry + (point ?? 0), 0);

export function LiveRollup({
  strings,
  locale,
}: {
  strings: LiveRollupStrings;
  locale: string;
}) {
  const [metric, setMetric] = useState<MetricId>("p95");
  const [size, setSize] = useState(5_000);
  const [running, setRunning] = useState(true);
  const [late, setLate] = useState(false);
  const [gap, setGap] = useState(false);

  const ring = useMemo(() => createRing(RING), []);
  const stream = useMemo(() => createStream(SEED), []);
  const chart = useRef<ChartApi | null>(null);
  const meters = useRef<Meters>({ ...EMPTY });

  useEffect(() => {
    // Худшее расхождение принадлежит той настройке, на которой его получили
    meters.current.worst = 0;
  }, [metric, size, late, gap]);

  useEffect(() => {
    let handle = 0;
    let last = 0;
    let painted = 0;

    const render = () => {
      const from = alignBucket(stream.clock - WINDOW_MS, size);
      const count = WINDOW_MS / size + 1;
      const raw = rollupFromRaw(ring, metric, size, from, count);
      const folded = rollupFromBuckets(ring, metric, size, from, count, BASE);
      const spread = drift(raw, folded);

      meters.current.rawTotal = total(raw);
      meters.current.foldedTotal = total(folded);
      meters.current.drift = spread.mean;
      meters.current.worst = Math.max(meters.current.worst, spread.worst);
      chart.current?.draw(raw, folded);
    };

    const tick = (now: number) => {
      handle = requestAnimationFrame(tick);

      const delta = last === 0 ? 0 : Math.min(now - last, MAX_FRAME_MS);
      last = now;

      const samples = stream.advance(delta * SPEED, { late, gap });
      for (const sample of samples) ring.push(sample);
      meters.current.events += samples.length;

      // Свёртки считаются реже кадра: окно держит тысячи событий, и пересчёт
      // на каждый кадр съел бы бюджет, ничего не добавив глазу
      if (now - painted < REDRAW_MS) return;
      painted = now;
      render();
    };

    render();
    if (!running) return;

    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [ring, stream, metric, size, late, gap, running]);

  function reset() {
    ring.clear();
    stream.reset();
    meters.current = { ...EMPTY };
    chart.current?.draw([], []);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {metricIds.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === metric}
            className={toolClass(id === metric)}
            onClick={() => setMetric(id)}
          >
            {id}
          </button>
        ))}
        <span className="spec text-muted ml-1">
          {metrics[metric].decomposable ? strings.decomposable : strings.notDecomposable}
        </span>
        <span className="spec text-muted ml-auto">{strings.clock}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <RollupChart ref={chart} label={strings.chart} />
          <div className="spec text-muted flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="flex items-center gap-2">
              <span aria-hidden className="bg-accent-ink inline-block h-0.5 w-6" />
              {strings.fromRaw}
            </span>
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="border-muted inline-block w-6 border-t-2 border-dashed"
              />
              {strings.fromBuckets}
            </span>
          </div>
        </div>

        <RollupMeters
          meters={meters}
          bucket={bucketLabel(size)}
          locale={locale}
          strings={strings}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SIZES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={value === size}
            className={toolClass(value === size)}
            onClick={() => setSize(value)}
          >
            {bucketLabel(value)}
          </button>
        ))}

        <button
          type="button"
          aria-pressed={late}
          className={`${toolClass(late)} ml-2`}
          onClick={() => setLate((on) => !on)}
        >
          {strings.late}
        </button>
        <button
          type="button"
          aria-pressed={gap}
          className={toolClass(gap)}
          onClick={() => setGap((on) => !on)}
        >
          {strings.gap}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" className={toolClass()} onClick={() => setRunning((on) => !on)}>
            {running ? strings.pause : strings.resume}
          </button>
          <button type="button" className={toolClass()} onClick={reset}>
            {strings.reset}
          </button>
        </div>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
      <p className="text-muted max-w-prose text-xs">{strings.note}</p>
    </div>
  );
}
