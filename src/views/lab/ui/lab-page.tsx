import { useTranslations } from "next-intl";
import { demoIds } from "@/entities/case";
import { Container, SectionLabel } from "@/shared/ui";

export function LabPage() {
  const t = useTranslations("lab");

  return (
    <Container className="py-24">
      <SectionLabel>{t("title")}</SectionLabel>
      <h1 className="display text-h1 mt-6">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-balance">{t("lead")}</p>

      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {demoIds.map((id) => (
          <li
            key={id}
            className="border-border spec text-muted border-2 border-dashed p-8 normal-case"
          >
            <span className="font-mono">{id}</span> — {t("empty")}
          </li>
        ))}
      </ul>
    </Container>
  );
}
