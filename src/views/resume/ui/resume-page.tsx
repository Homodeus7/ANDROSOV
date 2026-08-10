import { useTranslations } from "next-intl";
import { Container, SectionLabel } from "@/shared/ui";

export function ResumePage() {
  const t = useTranslations("resume");

  return (
    <Container className="py-24">
      <SectionLabel>{t("title")}</SectionLabel>
      <h1 className="display text-h1 mt-6">{t("title")}</h1>
      <p className="mt-4 max-w-2xl">{t("lead")}</p>
    </Container>
  );
}
