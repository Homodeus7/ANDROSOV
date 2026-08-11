import type { ReferenceRow } from "./types";

/**
 * Очевидное правило: имя короче — значит ближе, измерений больше — значит
 * надёжнее. Оно ничего не знает ни о состоянии еды, ни о том, чем датасеты
 * отличаются друг от друга, и в этом вся разница.
 */
export function rankNaively(rows: readonly ReferenceRow[]): ReferenceRow[] {
  return [...rows].sort(
    (a, b) =>
      a.name.length - b.name.length ||
      b.measuredCount - a.measuredCount ||
      (a.externalId < b.externalId ? -1 : 1),
  );
}
