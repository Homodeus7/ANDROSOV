/**
 * Плоский список ключей словаря. Массив пишется вместе с длиной: локаль с
 * более коротким списком не падает, а тихо подставляет запасные значения —
 * например, id блоков вместо названий.
 */
export function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`];
  if (value === null || typeof value !== "object") return [prefix];

  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, nested]) => keyPaths(nested, prefix ? `${prefix}.${key}` : key))
    .sort();
}
