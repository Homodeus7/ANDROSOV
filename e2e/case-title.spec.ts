import { test, expect, type Page } from "@playwright/test";

/**
 * Слово, разложенное на несколько прямоугольников, — это перенос внутри него.
 * Дефис такую точку переноса создаёт законно, поэтому в счёт идут только
 * сплошные буквенные куски.
 */
const brokenWords = (page: Page) =>
  page.evaluate(() => {
    const h1 = document.querySelector<HTMLElement>("h1[data-page-title]");
    if (!h1) throw new Error("title not found");

    const node = h1.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) throw new Error("title has no text node");

    const text = node.textContent ?? "";
    const broken: string[] = [];

    for (const match of text.matchAll(/[^\s-]+/g)) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 0);

      if (rects.length > 1 || rects.some((rect) => rect.width > h1.clientWidth + 1)) {
        broken.push(match[0]);
      }
    }

    return broken;
  });

const SLUGS = ["property-ops", "payment-gateways", "tender-stat", "blocks-editor"];

for (const locale of ["ru", "en"]) {
  test(`case title keeps its words whole (${locale})`, async ({ page }) => {
    for (const slug of SLUGS) {
      await page.goto(`/${locale}/work/${slug}`);
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => brokenWords(page), { timeout: 5000 }).toEqual([]);
    }
  });
}

// Колонка бывает уже, чем считает `--text-display`: у vw своя арифметика со
// скроллбаром, и «Управление» ровно на этой разнице и рвалось посреди слова
test("case title shrinks when its column gets narrower", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "проверяется десктопная колонка");

  await page.goto("/ru/work/property-ops");
  await page.evaluate(() => document.fonts.ready);

  const fontSize = () =>
    page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector("h1[data-page-title]")!).fontSize),
    );

  const before = await fontSize();

  await page.evaluate(() => {
    const h1 = document.querySelector<HTMLElement>("h1[data-page-title]")!;
    h1.parentElement!.style.width = "1000px";
  });

  await expect.poll(fontSize, { timeout: 5000 }).toBeLessThan(before);
  expect(await brokenWords(page)).toEqual([]);
});
