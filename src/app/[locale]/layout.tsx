import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeScript } from "@/features/theme";
import { site } from "@/shared/config";
import { fontClassName } from "@/shared/fonts";
import { routing } from "@/shared/i18n";
import { SmoothScroll } from "@/shared/motion";
import { CommandPalette } from "@/widgets/command-palette";
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
          <CommandPalette />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
