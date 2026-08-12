import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/shared/i18n";
import { LabPage } from "@/views/lab";

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });
  return { title: t("title"), description: t("lead") };
}

export default function Page() {
  return <LabPage />;
}
