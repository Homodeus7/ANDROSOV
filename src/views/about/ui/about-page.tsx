import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container, SectionLabel } from "@/shared/ui";
import portrait from "../assets/portrait.jpg";

export function AboutPage() {
  const t = useTranslations("about");
  const paragraphs = t.raw("body") as string[];
  const principles = t.raw("principles") as { title: string; body: string }[];

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <SectionLabel>{t("title")}</SectionLabel>
          <div className="grid-page mt-6 gap-y-8">
            <h1
              data-page-title
              className="display text-h1 col-span-4 text-balance md:col-span-8 lg:col-span-8"
            >
              {t("headline")}
            </h1>
            <Image
              src={portrait}
              alt={t("photoAlt")}
              placeholder="blur"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 37vw, 50vw"
              className="border-border col-span-2 border-2 contrast-125 grayscale transition-[filter] duration-300 hover:grayscale-0 md:col-span-3 lg:col-span-3 lg:col-start-10 lg:row-span-2"
            />
            <div className="col-span-4 max-w-prose space-y-4 text-lg leading-relaxed md:col-span-5 lg:col-span-8">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
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
