import { tokenize, type TokenKind } from "../model/tokenize";

type CodeBlockProps = {
  lang: string;
  source: string;
  caption?: string;
};

const TOKEN_CLASS: Record<Exclude<TokenKind, "plain">, string> = {
  comment: "text-muted italic",
  literal: "text-code",
  keyword: "text-accent-ink",
  punctuation: "text-muted",
};

export function CodeBlock({ lang, source, caption }: CodeBlockProps) {
  return (
    <figure className="border-border border-2">
      {caption ? (
        <figcaption className="spec text-muted border-border flex items-baseline justify-between gap-4 border-b-2 px-4 py-3 normal-case">
          <span>{caption}</span>
          <span className="shrink-0">{lang}</span>
        </figcaption>
      ) : null}
      <pre
        data-clip
        tabIndex={0}
        className="overflow-x-auto p-4 font-mono text-xs leading-relaxed md:p-6"
      >
        <code>
          {tokenize(source).map((token, index) =>
            token.kind === "plain" ? (
              token.text
            ) : (
              <span key={index} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
