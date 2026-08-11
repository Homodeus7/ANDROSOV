import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n";
import { Container, SectionLabel } from "@/shared/ui";

const ROUTES = [
  { href: "/", label: "work" },
  { href: "/lab", label: "lab" },
  { href: "/about", label: "about" },
  { href: "/resume", label: "resume" },
] as const;

export function NotFoundPage() {
  const t = useTranslations("notFound");
  const tNav = useTranslations("nav");

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <SectionLabel>{t("label")}</SectionLabel>
          <h1 className="display text-h1 mt-6 max-w-4xl text-balance">{t("title")}</h1>
          <p className="mt-8 max-w-3xl text-xl leading-snug text-balance">{t("lead")}</p>
        </Container>
      </section>

      <nav
        aria-label={t("title")}
        // Две колонки, а не четыре: «ЛАБОРАТОРИЯ» в наборе text-h2 шире
        // четверти строки и вылезала на соседнюю ячейку
        className="border-border bg-border grid gap-px border-b-2 sm:grid-cols-2"
      >
        {ROUTES.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="flood group bg-bg flex min-h-44 flex-col justify-between gap-8 p-6 md:p-10"
          >
            <span className="spec text-muted group-hover:text-on-accent">{route.href}</span>
            <span className="display text-h2 text-balance">{tNav(route.label)}</span>
          </Link>
        ))}
      </nav>

      {/* Совет про клавиши прячется там же, где прячется сама кнопка палитры:
          на телефоне нажимать нечем */}
      <section className="hidden py-16 sm:block md:py-24">
        <Container>
          <p className="text-muted max-w-prose">
            {t.rich("hint", {
              kbd: (chunks) => <kbd className="text-fg font-mono">{chunks}</kbd>,
            })}
          </p>
        </Container>
      </section>
    </>
  );
}
