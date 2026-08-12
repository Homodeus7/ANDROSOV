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
  { href: "/", key: "work", match: ["/", "/work"] },
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
          {/* На телефоне тема и язык живут в оверлее навигации — в шапке они
              были бы вторым набором тех же кнопок */}
          <div className="hidden items-center gap-3 sm:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </Container>
    </HeaderShell>
  );
}
