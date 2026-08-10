import { useTranslations } from "next-intl";
import type { ResolvedCase } from "@/entities/case";
import { Reveal } from "@/shared/motion";
import { Container, Marquee, SectionLabel } from "@/shared/ui";
import { ContactBand } from "@/widgets/contact-band";
import { Hero } from "@/widgets/hero";
import { Metrics } from "@/widgets/metrics";
import { WorkIndex } from "@/widgets/work-index";

const MARQUEE = [
  "FRONTEND",
  "REACT",
  "VUE",
  "TYPESCRIPT",
  "NEXT.JS",
  "GSAP",
  "REACT NATIVE",
  "FSD",
];

function Manifesto() {
  const t = useTranslations("home");

  return (
    <section className="border-border border-b-2 py-20 md:py-28">
      <Container grid>
        <div className="col-span-full lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <SectionLabel index={2} total={4}>
              {t("manifestoTitle")}
            </SectionLabel>
          </div>
        </div>

        <Reveal
          className="col-span-full mt-8 lg:col-span-8 lg:col-start-5 lg:mt-0"
          stagger={0.12}
          y={32}
        >
          <p className="display text-h2 text-balance">{t("manifesto")}</p>
          <p className="text-muted mt-8 max-w-prose">{t("manifestoNote")}</p>
        </Reveal>
      </Container>
    </section>
  );
}

export function HomePage({ cases }: { cases: ResolvedCase[] }) {
  return (
    <>
      <Hero />
      <Marquee items={MARQUEE} />
      <Manifesto />
      <WorkIndex cases={cases} />
      <Metrics />
      <ContactBand />
    </>
  );
}
