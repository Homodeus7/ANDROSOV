import { getCases } from "@/entities/case";
import type { Locale } from "@/shared/i18n";
import { HomePage } from "@/views/home";

type PageProps = { params: Promise<{ locale: Locale }> };

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return <HomePage cases={getCases(locale)} />;
}
