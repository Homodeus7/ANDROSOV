import type { Point } from "./types";

export type Column = { min: number; max: number } | undefined;

/**
 * Рисуется не точка на событие, а min/max на пиксельную колонку: на узком
 * экране бакетов больше, чем пикселей, и выбросы обязаны дожить до картинки.
 */
export function downsample(points: readonly Point[], columns: number): Column[] {
  if (columns <= 0 || points.length === 0) return [];

  const result: Column[] = Array.from({ length: columns }, () => undefined);

  points.forEach((point, index) => {
    if (point === undefined) return;

    const column = Math.min(Math.floor((index * columns) / points.length), columns - 1);
    const current = result[column];
    result[column] = current
      ? { min: Math.min(current.min, point), max: Math.max(current.max, point) }
      : { min: point, max: point };
  });

  return result;
}
