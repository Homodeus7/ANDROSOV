import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";

/**
 * `preload: false` — не экономия ради экономии, а единственный способ не тянуть
 * то, что странице не нужно. Preload у `next/font` выписывается на все шрифты
 * модуля, а модуль общий для обеих локалей: английская страница получала три
 * кириллических подмножества (58 КБ), которые не может отрисовать ни разу.
 * Без preload браузер выбирает файлы по `unicode-range` и берёт только нужные.
 *
 * Заголовочный — исключение: первый экран держит набор скрытым, пока шрифт не
 * приедет, а без preload ссылка на файл появляется только после разбора CSS,
 * то есть на круг позже. Лишнее кириллическое подмножество на английской
 * странице — цена за то, что герой не мигает запасным шрифтом.
 */
const fontDisplay = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

const fontBody = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const fontClassName = [fontDisplay.variable, fontBody.variable, fontMono.variable].join(
  " ",
);
