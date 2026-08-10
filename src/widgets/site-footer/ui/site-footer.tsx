import { useTranslations } from "next-intl";
import { site } from "@/shared/config";
import { Container } from "@/shared/ui";

const CONTACTS = [
  { label: "Email", href: `mailto:${site.email}` },
  { label: "Telegram", href: site.telegram },
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
];

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-border mt-32 border-t-2">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <ul className="spec flex flex-wrap gap-x-6 gap-y-2">
          {CONTACTS.map((contact) => (
            <li key={contact.label}>
              <a href={contact.href} className="hover:text-accent">
                {contact.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="spec text-muted">
          {t("builtWith")} <span className="mx-2">·</span> {t("grid")}
        </p>
      </Container>
    </footer>
  );
}
