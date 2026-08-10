import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { caseFlipId, type ResolvedCase } from "@/entities/case";
import { cn } from "@/shared/lib";
import { FlipLink } from "@/shared/motion";

type CaseNavProps = {
  previous?: ResolvedCase;
  next?: ResolvedCase;
};

function NavCard({
  item,
  direction,
  label,
}: {
  item: ResolvedCase;
  direction: "previous" | "next";
  label: string;
}) {
  const Arrow = direction === "previous" ? ArrowLeft : ArrowRight;

  return (
    <FlipLink
      href={`/work/${item.slug}`}
      flipId={caseFlipId(item.slug)}
      className={cn(
        "flood group bg-bg flex flex-col justify-between gap-8 p-6 md:p-10",
        direction === "next" && "md:items-end md:text-right",
      )}
    >
      <span
        className={cn(
          "spec text-muted group-hover:text-on-accent flex items-center gap-2",
          direction === "next" && "md:flex-row-reverse",
        )}
      >
        <Arrow
          aria-hidden
          className={cn(
            "size-4 transition-transform duration-300",
            direction === "previous"
              ? "group-hover:-translate-x-1"
              : "group-hover:translate-x-1",
          )}
        />
        {label}
      </span>
      <span data-flip-id={caseFlipId(item.slug)} className="display text-h2 text-balance">
        {item.title}
      </span>
    </FlipLink>
  );
}

export function CaseNav({ previous, next }: CaseNavProps) {
  const t = useTranslations("case");
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={t("nextCase")}
      className="border-border bg-border grid gap-px border-t-2 md:grid-cols-2"
    >
      {previous ? <NavCard item={previous} direction="previous" label={t("prevCase")} /> : null}
      {next ? <NavCard item={next} direction="next" label={t("nextCase")} /> : null}
    </nav>
  );
}
