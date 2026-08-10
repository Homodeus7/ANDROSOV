import { Link } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import type { ResolvedCase } from "../model/schema";

type CaseCardProps = {
  item: ResolvedCase;
  index: number;
  total: number;
  className?: string;
};

export function CaseCard({ item, index, total, className }: CaseCardProps) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-flip-id={`case-${item.slug}`}
      className={cn(
        "flood group border-border flex min-h-64 flex-col justify-between border-2 p-6",
        className,
      )}
    >
      <div className="spec flex items-baseline justify-between">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span>{item.nda ? "NDA" : "PUBLIC"}</span>
      </div>

      <div className="mt-12">
        <h3 className="display text-h2">{item.title}</h3>
        <p className="mt-2 max-w-prose text-balance">{item.tagline}</p>
      </div>

      <ul className="spec mt-8 flex flex-wrap gap-x-4 gap-y-1">
        {item.stack.slice(0, 5).map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
    </Link>
  );
}
