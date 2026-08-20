import { useLocale, useTranslations } from "next-intl";
import { CopyLink } from "@/features/copy-link";
import { resumeFile } from "@/entities/resume";
import { Link, type Locale } from "@/shared/i18n";
import { Container, SectionLabel } from "@/shared/ui";

export function ResumePdfPage() {
  const t = useTranslations("resume");
  const locale = useLocale() as Locale;
  const file = resumeFile(locale);

  return (
    <section className="pt-28 pb-16 md:pt-36">
      <Container>
        <SectionLabel>{t("viewer.label")}</SectionLabel>
        <h1 data-page-title className="display text-h2 mt-6">
          {t("viewer.title")}
        </h1>
        <p className="text-muted mt-4 max-w-prose leading-relaxed">{t("viewer.lead")}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={file}
            download
            className="spec bg-accent text-on-accent inline-flex min-h-11 items-center border-2 border-transparent px-3"
          >
            {t("download")}
          </a>
          <a
            href={file}
            target="_blank"
            rel="noreferrer"
            className="spec border-border text-fg flood inline-flex min-h-11 items-center border-2 px-3"
          >
            {t("viewer.newTab")}
          </a>
          <CopyLink href={`/${locale}/resume/pdf`} />
          <Link href="/resume" className="spec text-accent-ink">
            {t("viewer.webVersion")} →
          </Link>
        </div>

        {/* object, а не iframe: у него есть штатный фолбэк для мобильных браузеров,
            где встроенный просмотр PDF отключён и рамка осталась бы пустой */}
        <object
          data={file}
          type="application/pdf"
          title={t("viewer.title")}
          className="border-border mt-10 h-[80vh] min-h-128 w-full border-2"
        >
          <div className="p-8">
            <p className="max-w-prose">{t("viewer.fallback")}</p>
            <a
              href={file}
              target="_blank"
              rel="noreferrer"
              className="spec border-border text-fg flood mt-4 inline-flex min-h-11 items-center border-2 px-3"
            >
              {t("viewer.newTab")}
            </a>
          </div>
        </object>
      </Container>
    </section>
  );
}
