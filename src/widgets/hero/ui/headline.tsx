import { cn } from "@/shared/lib";

export type HeadlineLine = {
  text: string;
  widthEm: number;
  invert?: boolean;
};

// Ширина набора в em при font-kerning: none и tracking -0.04em.
// Это стартовое приближение для SSR, no-JS и reduced-motion: после разбивки
// SplitText герой доводит размер замером. Границы держит e2e/hero-fit.spec.ts.
export const HEADLINE: HeadlineLine[] = [
  { text: "Viacheslav", widthEm: 8.139 },
  { text: "Androsov", widthEm: 7.188, invert: true },
];

export function Headline({ lines, className }: { lines: HeadlineLine[]; className?: string }) {
  return (
    <h1
      data-page-title
      data-title-own
      aria-label={lines.map((line) => line.text).join(" ")}
      className={cn("hero-fit display leading-[0.98] tracking-[-0.04em]", className)}
    >
      {lines.map((line) => (
        <span
          key={line.text}
          data-hero-line
          className="relative block"
          style={{ fontSize: `calc(100cqw / ${line.widthEm})` }}
        >
          {line.invert ? (
            <span
              aria-hidden
              data-hero-band
              className="bg-accent absolute inset-0 origin-left"
            />
          ) : null}
          <span
            data-hero-text
            className={cn("relative block whitespace-nowrap", line.invert && "text-on-accent")}
          >
            {line.text}
          </span>
        </span>
      ))}
    </h1>
  );
}
