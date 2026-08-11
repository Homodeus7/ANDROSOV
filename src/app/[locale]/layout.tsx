import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCases } from "@/entities/case";
import { CommandPalette } from "@/features/command-palette";
import { ThemeScript } from "@/features/theme";
import { site } from "@/shared/config";
import { fontClassName } from "@/shared/fonts";
import { routing } from "@/shared/i18n";
import { SmoothScroll } from "@/shared/motion";
import { GridOverlay } from "@/widgets/grid-overlay";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import "@/shared/styles/globals.css";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s — ${site.name}` },
    description: t("description"),
  };
}

function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a
      href="#main"
      className="spec bg-accent text-on-accent sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[300] focus:px-4 focus:py-2"
    >
      {t("skipToContent")}
    </a>
  );
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // В палитру уходят только заголовки: полный контент кейсов в клиентский бандл не нужен
  const paletteCases = getCases(locale).map(({ slug, title, tagline }) => ({
    slug,
    title,
    tagline,
  }));

  const paletteLinks = [
    { label: "GitHub", href: site.github },
    { label: "Telegram", href: site.telegram },
    { label: "LinkedIn", href: site.linkedin },
  ];

  return (
    <html lang={locale} data-theme="dark" className={fontClassName} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <SkipLink />
          <SmoothScroll />
          <GridOverlay />
          <CommandPalette cases={paletteCases} links={paletteLinks} />
          <SiteHeader />
          {/* tabIndex={-1} — без него ссылка «к содержимому» только проматывает
              страницу, а фокус остаётся в шапке, и клавиатуре приходится
              проходить всю навигацию заново */}
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
