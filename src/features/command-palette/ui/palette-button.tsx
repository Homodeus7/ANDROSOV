"use client";

import { useTranslations } from "next-intl";
import { openCommandPalette } from "../lib/open-event";

export function PaletteButton() {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label={t("openPalette")}
      className="flood spec border-border hidden h-11 cursor-pointer items-center border-2 px-3 sm:flex"
    >
      <kbd className="font-mono">⌘K</kbd>
    </button>
  );
}
