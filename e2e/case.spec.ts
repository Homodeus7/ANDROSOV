import { test, expect } from "@playwright/test";

test.describe("case page", () => {
  test("carries the shared-element target and the neighbour band", async ({ page }) => {
    await page.goto("/en/work/foodiq");

    await expect(page.locator('h1 [data-flip-id="case-foodiq"]')).toBeVisible();

    const neighbours = page.locator('nav a[href*="/work/"]');
    await expect(neighbours).toHaveCount(2);
    for (const href of await neighbours.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    )) {
      expect(href).not.toContain("/work/foodiq");
    }
  });

  test("flies the title over from the card it was opened from", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator('a[href$="/work/blocks-editor"]').first();
    await card.scrollIntoViewIfNeeded();

    const from = await card.locator("[data-flip-id]").boundingBox();
    await card.click();

    const title = page.locator('h1 [data-flip-id="case-blocks-editor"]');
    await expect(title).toBeVisible();

    // Через 120 мс заголовок обязан быть ещё в пути: без перехода он
    // сразу стоит на месте, и разница между кадром и финалом будет нулевой
    await page.waitForTimeout(120);
    const moving = await title.boundingBox();
    await page.waitForTimeout(900);
    const landed = await title.boundingBox();

    expect(from).not.toBeNull();
    expect(moving).not.toBeNull();
    expect(landed).not.toBeNull();
    expect(Math.abs(moving!.y - landed!.y)).toBeGreaterThan(8);
  });

  test("serves an og image for every case", async ({ request }) => {
    const response = await request.get("/en/work/foodiq/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});
