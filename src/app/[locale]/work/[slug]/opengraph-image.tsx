import { getCase, getCaseSlugs } from "@/entities/case";
import { routing, type Locale } from "@/shared/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/shared/og";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getCaseSlugs().map((slug) => ({ locale, slug })));
}

type ImageProps = { params: Promise<{ locale: Locale; slug: string }> };

export default async function Image({ params }: ImageProps) {
  const { locale, slug } = await params;
  const item = getCase(slug, locale);
  if (!item) return new Response(null, { status: 404 });

  return renderOgImage({
    eyebrow: item.period,
    title: item.title,
    tagline: item.tagline,
    badge: item.nda ? "NDA" : item.links.length > 0 ? "Live" : undefined,
    footer: item.stack.slice(0, 4),
  });
}
