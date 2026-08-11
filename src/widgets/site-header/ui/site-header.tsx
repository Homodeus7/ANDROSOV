import { useTranslations } from "next-intl";
import { PaletteButton } from "@/features/command-palette";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeToggle } from "@/features/theme";
import { Link } from "@/shared/i18n";
import { Container } from "@/shared/ui";
import { HeaderShell } from "./header-shell";
import { NavLink } from "./nav-link";

const NAV = [
  // Грид работ живёт на главной, отдельной страницы под него нет — поэтому
  // подсветка не выводится из href: раздел «работы» это и главная, и кейс
  { href: "/#work", key: "work", match: ["/", "/work"] },
  { href: "/lab", key: "lab", match: ["/lab"] },
  { href: "/about", key: "about", match: ["/about"] },
  { href: "/resume", key: "resume", match: ["/resume"] },
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
                <NavLink href={item.href} match={item.match}>
                  {t(item.key)}
                </NavLink>
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
