import type { Summary } from "./types";

export const metricIds = ["sum", "count", "avg", "p95"] as const;

export type MetricId = (typeof metricIds)[number];

export type Metric = {
  /** Разложима ли метрика: можно ли получить её из свёрнутых кусков. */
  decomposable: boolean;
  /** Из сырых значений бакета. */
  raw: (values: readonly number[]) => number;
  /** Из того, что осталось от бакетов уровнем ниже. */
  fold: (parts: readonly Summary[]) => number;
};

export function quantile(values: readonly number[], probability: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil(probability * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)] ?? 0;
}

const total = (values: readonly number[]) => values.reduce((carry, value) => carry + value, 0);

const mean = (values: readonly number[]) => (values.length ? total(values) / values.length : 0);

export function summarise(values: readonly number[]): Summary {
  return {
    count: values.length,
    sum: total(values),
    p95: values.length ? quantile(values, 0.95) : 0,
  };
}

/**
 * `fold` получает бакеты плотным рядом, включая пустые: тот, кто складывает
 * готовые точки, не отличает «событий не было» от «сумма нулевая» — в ответе
 * бэкенда этой разницы уже нет.
 */
export const metrics: Record<MetricId, Metric> = {
  sum: {
    decomposable: true,
    raw: total,
    fold: (parts) => total(parts.map((part) => part.sum)),
  },
  count: {
    decomposable: true,
    raw: (values) => values.length,
    fold: (parts) => total(parts.map((part) => part.count)),
  },
  avg: {
    decomposable: false,
    // Среднее средних: веса остались в бакетах уровнем ниже и в свёртку не поехали
    raw: mean,
    fold: (parts) => mean(parts.map((part) => (part.count ? part.sum / part.count : 0))),
  },
  p95: {
    decomposable: false,
    // Операции над двенадцатью p95, дающей p95 минуты, не существует. Среднее
    // здесь стоит не потому, что оно верное, а потому, что так делают
    raw: (values) => quantile(values, 0.95),
    fold: (parts) => mean(parts.map((part) => part.p95)),
  },
};
