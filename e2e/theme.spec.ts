import { test, expect } from "@playwright/test";

test("keeps the chosen theme when the language changes", async ({ page }, testInfo) => {
  const noise: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("script tag")) noise.push(message.text());
  });

  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: "Toggle theme" });

  await page.goto("/en");

  // На узком экране тема и язык живут в оверлее навигации, а не в шапке
  if (testInfo.project.name === "mobile") {
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(toggle).toBeVisible();
  }

  await expect
    .poll(async () => {
      if ((await html.getAttribute("data-theme")) === "light") return "light";
      await toggle.click();
      await page.waitForTimeout(100);
      return html.getAttribute("data-theme");
    })
    .toBe("light");

  await page.getByRole("group", { name: "Switch language" }).getByText("ru").click();
  await expect(page).toHaveURL(/\/ru$/);

  await expect(html).toHaveAttribute("data-theme", "light");
  expect(noise, noise.join("\n")).toEqual([]);
});
