import { useTranslations } from "next-intl";
import { demoIds } from "@/entities/case";
import { Container, SectionLabel } from "@/shared/ui";
import { DemoSlot } from "@/widgets/demos";

export function LabPage() {
  const t = useTranslations("lab");

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container grid className="gap-y-0">
          <SectionLabel className="col-span-full">{t("title")}</SectionLabel>
          <h1 data-page-title className="display text-h1 col-span-full mt-6">
            {t("title")}
          </h1>
          <p className="col-span-full mt-8 text-xl leading-snug lg:col-span-6">{t("lead")}</p>
        </Container>
      </section>

      {demoIds.map((id, index) => (
        <section
          key={id}
          id={id}
          className="border-border scroll-mt-24 border-b-2 py-16 md:py-24"
        >
          <Container grid className="gap-y-0">
            <SectionLabel index={index + 1} total={demoIds.length} className="col-span-full">
              {id}
            </SectionLabel>
            <DemoSlot demo={id} className="col-span-full mt-6" />
          </Container>
        </section>
      ))}
    </>
  );
}
