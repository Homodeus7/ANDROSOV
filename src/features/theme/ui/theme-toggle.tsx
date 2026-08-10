"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { setTheme, useTheme } from "../model/theme-store";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={t("toggleTheme")}
      className="flood border-border grid size-11 cursor-pointer place-items-center border-2"
    >
      {theme === "dark" ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}
