"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./constants";

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

// Первым значение ставит скрипт темы, в атрибуте. Дальше правда живёт здесь:
// атрибут переживает не всякую пересборку разметки, а модуль — переживает
let current: Theme | undefined;

function read(): Theme {
  return (current ??= document.documentElement.dataset.theme === "light" ? "light" : "dark");
}

export function setTheme(theme: Theme) {
  current = theme;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the choice lasts for this page only */
  }
  for (const listener of listeners) listener();
}

// Смена языка меняет сегмент корневого layout, React собирает <html> заново и
// снимает атрибут, которого нет в разметке. Возвращаем его в том же кадре —
// раскладочный эффект успевает до отрисовки, мигания нет
export function useThemeAttribute() {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = read();
  }, []);
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
