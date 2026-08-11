"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY, useThemeAttribute } from "@/shared/theme";

const script = `(function(){var d=document.documentElement;d.dataset.js="1";try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.dataset.theme=t==="light"?"light":"dark"}catch(e){d.dataset.theme="dark"}})()`;

/**
 * Тема ставится до первой отрисовки, иначе светлая тема мигает тёмной.
 *
 * Работает скрипт ровно один раз — из серверной разметки. На клиенте React его
 * не исполняет вовсе, зато при смене языка корневой layout собирается заново,
 * и на пустой тег в консоль летит предупреждение. После гидратации компонент
 * молчит: скрипт своё уже отработал.
 */
let hydrated = false;

export function ThemeScript() {
  useThemeAttribute();

  useEffect(() => {
    hydrated = true;
  }, []);

  if (hydrated) return null;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
