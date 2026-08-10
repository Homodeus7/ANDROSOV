import { useTranslations } from "next-intl";
import { demoIds } from "@/entities/case";
import { Container, SectionLabel } from "@/shared/ui";
import { DemoSlot } from "@/widgets/demos";

export function LabPage() {
  const t = useTranslations("lab");

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <SectionLabel>{t("title")}</SectionLabel>
          <h1 className="display text-h1 mt-6">{t("title")}</h1>
          <p className="mt-8 max-w-3xl text-xl leading-snug text-balance">{t("lead")}</p>
        </Container>
      </section>

      {demoIds.map((id, index) => (
        <section
          key={id}
          id={id}
          className="border-border scroll-mt-24 border-b-2 py-16 md:py-24"
        >
          <Container>
            <SectionLabel index={index + 1} total={demoIds.length}>
              {id}
            </SectionLabel>
            <div className="mt-6">
              <DemoSlot demo={id} />
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
