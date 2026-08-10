import { cn } from "@/shared/lib";

type SectionLabelProps = {
  index?: number;
  total?: number;
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ index, total, children, className }: SectionLabelProps) {
  const counter =
    index !== undefined && total !== undefined
      ? `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
      : null;

  return (
    <div className={cn("spec text-muted flex items-baseline gap-4", className)}>
      {counter ? <span aria-hidden>{counter}</span> : null}
      <span>{children}</span>
    </div>
  );
}
