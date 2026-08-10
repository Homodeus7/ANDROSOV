import { useTranslations } from "next-intl";
import { PaletteButton } from "@/features/command-palette";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeToggle } from "@/features/theme";
import { Link } from "@/shared/i18n";
import { Container } from "@/shared/ui";
import { HeaderShell } from "./header-shell";

const NAV = [
  { href: "/lab", key: "lab" },
  { href: "/about", key: "about" },
  { href: "/resume", key: "resume" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <HeaderShell>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="display text-base tracking-tight">
          {t("wordmark")}
        </Link>

        <nav className="flex items-center gap-3">
          <ul className="spec mr-3 hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          <PaletteButton />
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </Container>
    </HeaderShell>
  );
}
