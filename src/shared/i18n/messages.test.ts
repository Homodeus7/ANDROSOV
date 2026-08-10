import { describe, expect, it } from "vitest";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";

// Массив пишем вместе с длиной: локаль с более коротким списком не падает,
// а тихо подставляет запасные значения — например, id блоков вместо названий
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`];
  if (value === null || typeof value !== "object") return [prefix];

  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, nested]) => keyPaths(nested, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("messages", () => {
  it("keeps both locales on the same key set", () => {
    expect(keyPaths(ru)).toEqual(keyPaths(en));
  });

  it("leaves no empty strings", () => {
    for (const [locale, messages] of Object.entries({ en, ru })) {
      const blank = JSON.stringify(messages).match(/:\s*""/g);
      expect(blank, `locale "${locale}"`).toBeNull();
    }
  });
});
