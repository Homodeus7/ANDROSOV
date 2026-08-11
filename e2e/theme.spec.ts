import { test, expect } from "@playwright/test";

// Смена языка меняет сегмент корневого layout, поэтому React собирает <html>
// заново и снимает с него всё, чего нет в разметке. Тема живёт ровно там —
// и светлая уезжала в тёмную на каждом переключении
test("keeps the chosen theme when the language changes", async ({ page }) => {
  const noise: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("script tag")) noise.push(message.text());
  });

  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: "Toggle theme" });

  await page.goto("/en");

  // Слушатель кнопки появляется только после гидратации, до неё клик — ничто
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
