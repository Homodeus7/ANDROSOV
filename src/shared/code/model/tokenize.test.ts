import { describe, expect, it } from "vitest";
import { tokenize, type TokenKind } from "./tokenize";

// Пробелы прилипают к соседнему plain-токену, поэтому сравнение по trim
const kindOf = (source: string, text: string): TokenKind | undefined =>
  tokenize(source).find((token) => token.text.trim() === text)?.kind;

describe("tokenize", () => {
  it("puts the source back together", () => {
    const source = `const answer = fn(1, "two", /three/i); // done\n`;

    expect(tokenize(source).reduce((text, token) => text + token.text, "")).toBe(source);
  });

  it("tells a keyword from an identifier that merely contains one", () => {
    expect(kindOf("const constant = 1;", "const")).toBe("keyword");
    expect(kindOf("const constant = 1;", "constant")).toBe("plain");
  });

  // Слэш после значения — деление, после оператора — регулярное выражение
  it("reads a slash by what stands before it", () => {
    expect(kindOf("const re = /^raw$/i;", "/^raw$/i")).toBe("literal");
    expect(tokenize("const half = total / 2;").find((t) => t.text.includes("/"))?.kind).toBe(
      "punctuation",
    );
  });

  it("keeps a comment whole, whatever it quotes", () => {
    expect(
      kindOf(
        '// "Bread, white or NFS" is still narrowed',
        '// "Bread, white or NFS" is still narrowed',
      ),
    ).toBe("comment");
  });

  // Примитивные типы намеренно не акцент: иначе сигнатура спорит за внимание
  // с ключевыми словами, а в палитре сайта акцент ровно один
  it("leaves the primitive types alone", () => {
    const source = "function ok(name: string): boolean {";

    expect(kindOf(source, "function")).toBe("keyword");
    expect(tokenize(source).find((t) => t.text.includes("boolean"))?.kind).toBe("plain");
    expect(tokenize(source).find((t) => t.text.includes("string"))?.kind).toBe("plain");
  });

  it("keeps a template literal whole, expressions included", () => {
    expect(kindOf("const id = `${verb}${route}`;", "`${verb}${route}`")).toBe("literal");
  });
});
