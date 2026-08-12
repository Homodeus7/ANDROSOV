import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/shared/i18n";
import { ResumePage } from "@/views/resume";

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resume" });
  return { title: t("title") };
}

export default function Page() {
  return <ResumePage />;
}
