import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCase, getCaseNeighbours, getCaseSlugs } from "@/entities/case";
import { routing, type Locale } from "@/shared/i18n";
import { CasePage } from "@/views/case";

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getCaseSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getCase(slug, locale);
  if (!item) return {};

  return { title: item.title, description: item.tagline };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;

  const item = getCase(slug, locale);
  if (!item) notFound();

  const slugs = getCaseSlugs();
  const { previous, next } = getCaseNeighbours(slug, locale);

  return (
    <CasePage
      item={item}
      index={slugs.indexOf(slug)}
      total={slugs.length}
      previous={previous}
      next={next}
    />
  );
}
