import "server-only";
import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/shared/theme";

const script = `(function(){var d=document.documentElement;d.dataset.js="1";try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.dataset.theme=t==="light"?"light":"dark"}catch(e){d.dataset.theme="dark"}})()`;

/**
 * Тема ставится до первой отрисовки, иначе светлая тема мигает тёмной.
 *
 * Обычный `<script>` React 19 встречает предупреждением: скрипт, отрисованный
 * компонентом, на клиенте не исполняется. Для нас это ровно нужное поведение —
 * скрипт обязан отработать один раз из серверной разметки, — но в консоли это
 * шум на каждой загрузке. `next/script` со стратегией `beforeInteractive` кладёт
 * скрипт в `<head>` сам, минуя React.
 */
export function ThemeScript() {
  return (
    // Правило из времён Pages Router: там `beforeInteractive` жил в
    // `_document.js`. В App Router документация Next требует обратного —
    // класть его именно в корневой layout
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="theme"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
