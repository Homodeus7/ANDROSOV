const SPACE = "[ \\u00A0\\u202F\\u2009]";
const NUMBER = new RegExp(`\\d+(?:${SPACE}\\d{3})*`, "g");
const SEPARATOR = new RegExp(SPACE);

export type ParsedMetric = {
  prefix: string;
  suffix: string;
  from: number;
  to: number;
  separator: string;
};

const digitsOf = (raw: string) => Number(raw.replace(/\D/g, ""));

/**
 * Считается последнее число строки: «25 → 60» отсчитывает от 25, всё остальное
 * от нуля. Разряды («13 619») остаются одним числом, а разделитель едет дальше
 * форматтеру — иначе на счётчике мелькнёт неразбитое «13619»
 */
export function parseMetric(value: string): ParsedMetric | null {
  const numbers = [...value.matchAll(NUMBER)];
  const last = numbers.at(-1);
  if (!last || last.index === undefined) return null;

  const previous = numbers.at(-2);

  return {
    prefix: value.slice(0, last.index),
    suffix: value.slice(last.index + last[0].length),
    from: previous ? digitsOf(previous[0]) : 0,
    to: digitsOf(last[0]),
    separator: SEPARATOR.exec(last[0])?.[0] ?? "",
  };
}

export function groupDigits(value: number, separator: string) {
  const digits = String(value);
  return separator ? digits.replace(/\B(?=(\d{3})+$)/g, separator) : digits;
}
