import { describe, expect, it } from "vitest";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import { keyPaths } from "@/shared/lib";

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
