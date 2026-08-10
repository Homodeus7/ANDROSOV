"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "../lib/constants";

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the choice lasts for this page only */
  }
  for (const listener of listeners) listener();
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    },
    read,
    () => "dark",
  );
}
