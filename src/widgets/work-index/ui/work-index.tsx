import { useTranslations } from "next-intl";
import { CaseCard, type ResolvedCase } from "@/entities/case";
import { cn } from "@/shared/lib";
import { Reveal } from "@/shared/motion";
import { Container, SectionLabel } from "@/shared/ui";

const LAYOUT = [
  "md:col-span-8 lg:col-span-7",
  "md:col-span-8 lg:col-span-5",
  "md:col-span-4 lg:col-span-5",
  "md:col-span-4 lg:col-span-7",
  "md:col-span-8 lg:col-span-12",
];

export function WorkIndex({ cases }: { cases: ResolvedCase[] }) {
  const t = useTranslations("home");

  return (
    <section id="work" className="border-border border-b-2 py-20 md:py-28">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionLabel index={3} total={4}>
            {t("workTitle")}
          </SectionLabel>
          <span className="spec text-muted">
            {String(cases.length).padStart(2, "0")} {t("workCount")}
          </span>
        </div>

        <Reveal as="ul" className="grid-page mt-10 gap-y-4" stagger={0.06}>
          {cases.map((item, index) => (
            <li
              key={item.slug}
              className={cn("col-span-full", LAYOUT[index % LAYOUT.length])}
            >
              <CaseCard
                item={item}
                index={index}
                total={cases.length}
                featured={index === 0}
                className="h-full"
              />
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
