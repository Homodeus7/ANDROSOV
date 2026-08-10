import { useTranslations } from "next-intl";
import { CaseCard, type ResolvedCase } from "@/entities/case";
import { Container, SectionLabel } from "@/shared/ui";

export function HomePage({ cases }: { cases: ResolvedCase[] }) {
  const t = useTranslations("home");

  return (
    <>
      <section className="border-border border-b-2 py-24 md:py-32">
        <Container>
          <SectionLabel index={1} total={4}>
            {t("role")} — {t("location")}
          </SectionLabel>
          <h1 className="display text-display mt-8">
            Viacheslav
            <br />
            Androsov
          </h1>
        </Container>
      </section>

      <section className="border-border border-b-2 py-24">
        <Container grid>
          <SectionLabel index={2} total={4} className="col-span-full lg:col-span-3">
            {t("manifestoTitle")}
          </SectionLabel>
          <p className="text-h2 display col-span-full mt-6 text-balance lg:col-span-8 lg:col-start-5 lg:mt-0">
            {t("manifesto")}
          </p>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <SectionLabel index={3} total={4}>
            {t("workTitle")}
          </SectionLabel>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {cases.map((item, index) => (
              <li key={item.slug} className="contents">
                <CaseCard item={item} index={index} total={cases.length} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
