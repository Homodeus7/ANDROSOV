import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/shared/i18n";

type PageProps = { params: Promise<{ locale: Locale }> };

/**
 * Ловушка под несуществующие адреса. Без неё `/ru/чего-нибудь` не совпадает ни
 * с одним сегментом, `[locale]/layout.tsx` не отрисовывается вовсе, и Next
 * отдаёт свою служебную страницу — без шапки, подвала, темы и перевода.
 */
export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  notFound();
}
