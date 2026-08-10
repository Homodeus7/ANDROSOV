"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { ArrowUpRight, Contrast, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { locales, usePathname, useRouter, type Locale } from "@/shared/i18n";
import { setTheme, useTheme } from "@/shared/theme";
import { PALETTE_OPEN_EVENT } from "../lib/open-event";

export type PaletteCase = { slug: string; title: string; tagline: string };

export type PaletteLink = { label: string; href: string };

type CommandPaletteProps = {
  cases: PaletteCase[];
  links: PaletteLink[];
};

const ROUTES = [
  { href: "/", key: "work" },
  { href: "/lab", key: "lab" },
  { href: "/about", key: "about" },
  { href: "/resume", key: "resume" },
] as const;

const groupClass =
  "[&_[cmdk-group-heading]]:spec [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:pb-2";

const itemClass =
  "spec data-[selected=true]:bg-accent data-[selected=true]:text-on-accent flex cursor-pointer items-center justify-between gap-4 px-4 py-3";

export function CommandPalette({ cases, links }: CommandPaletteProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PALETTE_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PALETTE_OPEN_EVENT, onOpen);
    };
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const otherLocale = locales.find((item) => item !== locale) ?? locale;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={t("openPalette")}
      className="bg-bg/80 fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] backdrop-blur-sm"
    >
      <div className="border-border bg-surface w-full max-w-xl border-2">
        <Command.Input
          placeholder={t("palettePlaceholder")}
          className="spec placeholder:text-muted border-border w-full border-b-2 bg-transparent px-4 py-4 outline-none"
        />
        <Command.List className="max-h-[60vh] overflow-y-auto">
          <Command.Empty className="spec text-muted px-4 py-6">
            {t("paletteEmpty")}
          </Command.Empty>

          <Command.Group
            heading={t("groupCases")}
            className={groupClass}
          >
            {cases.map((item) => (
              <Command.Item
                key={item.slug}
                value={`${item.title} ${item.tagline}`}
                onSelect={() => run(() => router.push(`/work/${item.slug}`))}
                className={itemClass}
              >
                <span>{item.title}</span>
                <span className="truncate opacity-50">{item.tagline}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading={t("groupPages")}
            className={groupClass}
          >
            {ROUTES.map((route) => (
              <Command.Item
                key={route.href}
                value={t(route.key)}
                onSelect={() => run(() => router.push(route.href))}
                className={itemClass}
              >
                {t(route.key)}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading={t("groupActions")}
            className={groupClass}
          >
            <Command.Item
              value={t("toggleTheme")}
              onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
              className={itemClass}
            >
              <span>{t("toggleTheme")}</span>
              <Contrast aria-hidden className="size-4 shrink-0" />
            </Command.Item>
            <Command.Item
              value={`${t("switchLocale")} ${otherLocale}`}
              onSelect={() => run(() => router.replace(pathname, { locale: otherLocale }))}
              className={itemClass}
            >
              <span>
                {t("switchLocale")} — {otherLocale.toUpperCase()}
              </span>
              <Languages aria-hidden className="size-4 shrink-0" />
            </Command.Item>
            {links.map((link) => (
              <Command.Item
                key={link.href}
                value={link.label}
                onSelect={() => run(() => window.open(link.href, "_blank", "noreferrer"))}
                className={itemClass}
              >
                <span>{link.label}</span>
                <ArrowUpRight aria-hidden className="size-4 shrink-0" />
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="spec text-muted border-border flex justify-between border-t-2 px-4 py-3">
          <span>↑ ↓ ↵</span>
          <span>ESC</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
