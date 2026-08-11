import { metrics, summarise, type MetricId } from "./metrics";
import type { Ring } from "./ring";
import type { Point } from "./types";

export const alignBucket = (time: number, size: number) => Math.floor(time / size) * size;

export type Placement = (time: number, arrival: number, size: number) => number;

export const byTime: Placement = (time, _arrival, size) => alignBucket(time, size);

/**
 * Опоздавшее событие попадает в бакет, который уже отдали, — и достаётся
 * текущему. Пересчёт из сырых кладёт его туда, где оно случилось, и правит
 * прошлое; свёртка готовых точек так не умеет.
 */
export const byArrival: Placement = (time, arrival, size) => {
  const start = alignBucket(time, size);
  return arrival < start + size ? start : alignBucket(arrival, size);
};

function collect(
  ring: Ring,
  size: number,
  from: number,
  count: number,
  place: Placement,
): number[][] {
  const columns: number[][] = Array.from({ length: count }, () => []);

  ring.each((time, arrival, value) => {
    const index = (place(time, arrival, size) - from) / size;
    if (index >= 0 && index < count) columns[index]!.push(value);
  });

  return columns;
}

export function rollupFromRaw(
  ring: Ring,
  metric: MetricId,
  size: number,
  from: number,
  count: number,
): Point[] {
  return collect(ring, size, from, count, byTime).map((values) =>
    values.length ? metrics[metric].raw(values) : undefined,
  );
}

/**
 * Так считает админка, которой бэкенд отдал готовые точки базовой
 * гранулярности. Дыр в результате не бывает: там, где ничего не измеряли,
 * стоит ноль, потому что в свёрнутом ответе «не было» и «нуль» — одно и то же.
 */
export function rollupFromBuckets(
  ring: Ring,
  metric: MetricId,
  size: number,
  from: number,
  count: number,
  base: number,
): Point[] {
  const ratio = size / base;
  const parts = collect(ring, base, from, count * ratio, byArrival).map(summarise);

  return Array.from({ length: count }, (_, index) =>
    metrics[metric].fold(parts.slice(index * ratio, (index + 1) * ratio)),
  );
}
