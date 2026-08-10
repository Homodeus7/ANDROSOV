import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { site } from "@/shared/config";
import { Container, SectionLabel } from "@/shared/ui";

export function ContactBand() {
  const t = useTranslations("contact");

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionLabel>{t("label")}</SectionLabel>
        <a
          href={`mailto:${site.email}`}
          className="flood group border-border mt-6 flex flex-col gap-8 border-2 p-6 md:p-10"
        >
          <span className="flex items-start justify-between gap-6">
            <span className="display text-h2 max-w-4xl text-balance">{t("headline")}</span>
            <ArrowUpRight
              aria-hidden
              className="size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:size-10"
            />
          </span>
          <span className="spec flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span>{site.email}</span>
            <span>{t("timezone")}</span>
          </span>
        </a>
      </Container>
    </section>
  );
}
