import { useTranslations } from "next-intl";
import { Container, SectionLabel } from "@/shared/ui";

export function AboutPage() {
  const t = useTranslations("about");
  const paragraphs = t.raw("body") as string[];
  const principles = t.raw("principles") as { title: string; body: string }[];

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <SectionLabel>{t("title")}</SectionLabel>
          <h1 data-page-title className="display text-h1 mt-6 max-w-4xl text-balance">
            {t("headline")}
          </h1>
          <div className="mt-8 max-w-prose space-y-4 text-lg leading-relaxed">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-border border-b-2 py-12 md:py-16">
        <Container>
          <SectionLabel>{t("principlesTitle")}</SectionLabel>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {principles.map((principle) => (
              <div key={principle.title} className="border-border border-t-2 pt-4">
                <h2 className="display text-h4">{principle.title}</h2>
                <p className="text-muted mt-3 leading-relaxed">{principle.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
