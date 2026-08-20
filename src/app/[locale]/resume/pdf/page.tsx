import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/shared/i18n";
import { ResumePdfPage } from "@/views/resume-pdf";

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resume.viewer" });
  return {
    title: t("title"),
    description: t("lead"),
    openGraph: { title: t("title"), description: t("lead"), type: "profile" },
  };
}

export default function Page() {
  return <ResumePdfPage />;
}
