import { test, expect, type Page } from "@playwright/test";

const schema = (page: Page) => page.locator("[data-schema]");
const field = (page: Page, name: string) => page.locator(`[data-field="${name}"]`);

const press = (page: Page, name: string) =>
  page.locator("#dynamic-form").getByRole("button", { name, exact: true }).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await page.locator("#dynamic-form").scrollIntoViewIfNeeded();
  await expect(schema(page)).toBeVisible();
}

test.describe("dynamic form demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(schema(page)).toHaveCount(0);

    await page.locator("#dynamic-form").scrollIntoViewIfNeeded();
    await expect(schema(page)).toBeVisible();
  });

  test("swaps both the fields and the schema with the method", async ({ page }) => {
    await openDemo(page);
    await expect(field(page, "cardNumber")).toBeVisible();
    await expect(schema(page)).toContainText("cardNumber");

    await press(page, "SEPA");
    await expect(field(page, "cardNumber")).toHaveCount(0);
    await expect(field(page, "iban")).toBeVisible();
    await expect(schema(page)).toContainText("iban");
    await expect(schema(page)).not.toContainText("cardNumber");
  });

  // Схема идёт не только за способом вывода, но и за значением соседнего поля
  test("follows the network the user picked", async ({ page }) => {
    await openDemo(page);
    await press(page, "Crypto");

    await field(page, "network").selectOption("TRC20");
    await expect(schema(page)).toContainText("^T[1-9A-HJ-NP-Za-km-z]{33}$");

    await field(page, "network").selectOption("ERC20");
    await expect(schema(page)).toContainText("^0x[0-9a-fA-F]{40}$");
  });

  test("leaves SEPA no currency to pick", async ({ page }) => {
    await openDemo(page);
    await press(page, "SEPA");

    await expect(field(page, "currency").locator("option")).toHaveCount(2);
    await expect(schema(page)).toContainText('z.enum(["EUR"])');
  });

  test("turns valid only once every rule is met", async ({ page }) => {
    await openDemo(page);
    await expect(page.locator("[data-valid]")).toHaveAttribute("data-valid", "false");

    await field(page, "amount").fill("250");
    await field(page, "cardNumber").fill("4111111111111111");
    await field(page, "holder").fill("Acme Ltd");

    await expect(page.locator("[data-valid]")).toHaveAttribute("data-valid", "true");
  });

  // Поле со старого шага не должно уехать на бэкенд вместе с новой выплатой
  test("drops values the new schema has no place for", async ({ page }) => {
    await openDemo(page);
    await press(page, "SEPA");
    await field(page, "amount").fill("250");
    await field(page, "iban").fill("DE89370400440532013000");
    await field(page, "holder").fill("Acme Ltd");

    await press(page, "Card");
    await field(page, "cardNumber").fill("4111111111111111");
    await press(page, "Submit");

    const payload = await page.locator("[data-payload]").innerText();
    expect(payload).toContain("cardNumber");
    expect(payload).not.toContain("iban");
  });
});
