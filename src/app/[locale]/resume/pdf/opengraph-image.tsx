import { getTranslations } from "next-intl/server";
import { site } from "@/shared/config";
import { routing, type Locale } from "@/shared/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/shared/og";

export const alt = site.name;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type ImageProps = { params: Promise<{ locale: Locale }> };

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resume" });

  return renderOgImage({
    eyebrow: t("viewer.label"),
    title: site.name,
    tagline: t("viewer.lead"),
    footer: ["React", "Vue", "TypeScript"],
    badge: "PDF",
  });
}
