import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeToggle } from "@/features/theme";
import { Link } from "@/shared/i18n";
import { Container } from "@/shared/ui";

const NAV = [
  { href: "/lab", key: "lab" },
  { href: "/about", key: "about" },
  { href: "/resume", key: "resume" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="border-border bg-bg sticky top-0 z-50 border-b-2">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="display text-base tracking-tight">
          АНДРОСОВ
        </Link>

        <nav className="flex items-center gap-4">
          <ul className="spec hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}
