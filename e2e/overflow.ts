import type { Page } from "@playwright/test";

/**
 * Две разные беды под одним именем. Рамка элемента ловит блок, уехавший за
 * край; она же слепа к строке, которая вылезла из собственного блока —
 * `getBoundingClientRect` у заголовка остаётся в колонке, а буквы уже за ней.
 * Вторую видно только по `scrollWidth`, и обрезает её `overflow-x: hidden`
 * на body, поэтому горизонтальной прокрутки при этом тоже нет.
 */
export const overflowReport = (page: Page) =>
  page.evaluate(() => {
    const clips = (el: Element) =>
      getComputedStyle(el).overflowX !== "visible" || el.hasAttribute("data-clip");

    const insideClipper = (el: HTMLElement) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        if (clips(n)) return true;
      }
      return false;
    };

    const limit = document.documentElement.clientWidth;
    const escaped: string[] = [];
    const spilled: string[] = [];

    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const name = `${el.tagName}.${el.className}`.slice(0, 70);
      const rect = el.getBoundingClientRect();

      if (rect.width > 0 && !insideClipper(el) && (rect.right > limit + 1 || rect.left < -1)) {
        escaped.push(name);
      }

      // sr-only схлопнут до пикселя намеренно — у него scrollWidth всегда больше
      if (el.clientWidth < 8 || clips(el) || insideClipper(el)) continue;
      if (el.scrollWidth > el.clientWidth + 1) {
        spilled.push(`${name} ${el.scrollWidth}>${el.clientWidth}`);
      }
    }

    return {
      escaped: escaped.slice(0, 5),
      spilled: spilled.slice(0, 5),
      scrolls: document.documentElement.scrollWidth > limit,
    };
  });
