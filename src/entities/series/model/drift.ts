import type { Point } from "./types";

function difference(raw: Point, folded: Point): number {
  if (raw === undefined && folded === undefined) return 0;
  // Свёртка утверждает измерение там, где его не было. Это не приближение
  if (raw === undefined || folded === undefined) return 1;

  const scale = Math.max(Math.abs(raw), Math.abs(folded));
  return scale === 0 ? 0 : Math.abs(raw - folded) / scale;
}

/**
 * Считается только промежуток между первым и последним бакетом, где пересчёт
 * из сырых хоть что-то нашёл. По краям окно просто шире данных: слева оно
 * старше потока, справа бакет ещё не наполнился, и расхождения там нет — есть
 * отсутствие измерений.
 */
export function drift(raw: readonly Point[], folded: readonly Point[]) {
  const first = raw.findIndex((point) => point !== undefined);
  if (first === -1) return { mean: 0, worst: 0 };

  let last = raw.length - 1;
  while (raw[last] === undefined) last -= 1;

  let total = 0;
  let worst = 0;

  for (let index = first; index <= last; index += 1) {
    const value = difference(raw[index], folded[index]);
    total += value;
    worst = Math.max(worst, value);
  }

  return { mean: total / (last - first + 1), worst };
}
