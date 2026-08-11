export type TokenKind = "comment" | "literal" | "keyword" | "punctuation" | "plain";

export type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "readonly",
  "return",
  "satisfies",
  "static",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "yield",
]);

const SPACE = /\s+/y;
const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?\*\//y;
const STRING = /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y;
const REGEXP = /\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n])+\/[a-z]*/y;
const NUMBER = /\d[\w.]*/y;
const WORD = /[A-Za-z_$][\w$]*/y;

/**
 * Разбор TypeScript на пять видов токенов — ровно столько, сколько различает
 * палитра сайта. Сниппеты в кейсах написаны здесь же и читаются целиком, поэтому
 * грамматика не нужна: цена ошибки — неверный цвет одного слова, а не сборка.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  // Слэш после значения — деление, после оператора — начало регулярного
  // выражения. Одно и то же место в тексте, разный смысл
  let expectValue = true;

  const take = (pattern: RegExp): string | undefined => {
    pattern.lastIndex = index;
    return pattern.exec(source)?.[0];
  };

  const push = (kind: TokenKind, text: string) => {
    const last = tokens.at(-1);
    if (last?.kind === kind) last.text += text;
    else tokens.push({ kind, text });
    index += text.length;
  };

  while (index < source.length) {
    const space = take(SPACE);
    if (space !== undefined) {
      push("plain", space);
      continue;
    }

    const comment = take(COMMENT);
    if (comment !== undefined) {
      push("comment", comment);
      continue;
    }

    const literal = take(STRING) ?? (expectValue ? take(REGEXP) : undefined) ?? take(NUMBER);
    if (literal !== undefined) {
      push("literal", literal);
      expectValue = false;
      continue;
    }

    const word = take(WORD);
    if (word !== undefined) {
      const keyword = KEYWORDS.has(word);
      push(keyword ? "keyword" : "plain", word);
      expectValue = keyword;
      continue;
    }

    const char = source[index];
    push("punctuation", char);
    expectValue = !")]}".includes(char);
  }

  return tokens;
}
