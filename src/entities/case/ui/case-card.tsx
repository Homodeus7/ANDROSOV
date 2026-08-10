import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib";
import { FlipLink } from "@/shared/motion";
import { caseFlipId } from "../model/flip-id";
import type { ResolvedCase } from "../model/schema";

type CaseCardProps = {
  item: ResolvedCase;
  index: number;
  total: number;
  featured?: boolean;
  className?: string;
};

export function CaseCard({ item, index, total, featured = false, className }: CaseCardProps) {
  const t = useTranslations("case");
  const status = item.nda ? "badgeNda" : item.links.length > 0 ? "badgeLive" : "badgeClosed";

  return (
    <FlipLink
      href={`/work/${item.slug}`}
      flipId={caseFlipId(item.slug)}
      className={cn(
        "flood group border-border flex flex-col justify-between border-2 p-5 md:p-8",
        featured ? "min-h-[20rem] md:min-h-[24rem]" : "min-h-60 md:min-h-64",
        className,
      )}
    >
      <div className="spec flex items-baseline justify-between gap-4">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span
          className={cn(
            status === "badgeLive"
              ? "text-accent-ink group-hover:text-on-accent"
              : "text-muted",
            "group-hover:text-on-accent",
          )}
        >
          {t(status)}
        </span>
      </div>

      <div className="mt-10">
        <div className="flex items-start justify-between gap-4">
          <h3
            data-flip-id={caseFlipId(item.slug)}
            className={cn("display text-balance", featured ? "text-h1" : "text-h2")}
          >
            {item.title}
          </h3>
          <ArrowUpRight
            aria-hidden
            className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
        <p className={cn("mt-3 max-w-prose text-balance", featured ? "text-lg" : "text-base")}>
          {item.tagline}
        </p>
      </div>

      <div className="border-fg/20 group-hover:border-on-accent/20 mt-8 border-t-2 pt-4">
        <div className="spec flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {item.stack.slice(0, featured ? 6 : 4).map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <span className="text-muted group-hover:text-on-accent">{item.period}</span>
        </div>
      </div>
    </FlipLink>
  );
}
