import { test, expect } from "@playwright/test";

type Instrumented = { __headerWrites: string[] };

// Мигание шапки видно только на колесе: плавная прокрутка доводит его затухающей
// анимацией, и на хвосте кадры приходят с долями пикселя в обе стороны. Сравнение
// «текущая позиция > предыдущей» принимало дребезг за смену направления, и шапка
// успевала выехать на кадр и уехать обратно — по замеру 4 переключения за 6 пикселей
test.describe("header", () => {
  test("hides once on a wheel scroll instead of flickering", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "колеса на тач-устройстве нет");

    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const node = document.querySelector<HTMLElement>("[data-site-header]")!;
      const writes: string[] = [];
      (window as unknown as Instrumented).__headerWrites = writes;

      const sample = () => {
        if (writes.at(-1) !== node.style.transform) writes.push(node.style.transform);
        requestAnimationFrame(sample);
      };
      sample();
    });

    for (let tick = 0; tick < 6; tick += 1) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(2500);

    const writes = await page.evaluate(
      () => (window as unknown as Instrumented).__headerWrites,
    );
    expect(writes, writes.join(" → ")).toEqual(["", "translateY(-100%)"]);
  });

  test("brings the header back on the way up", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "колеса на тач-устройстве нет");

    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const header = page.locator("[data-site-header]");

    // Плавная прокрутка догоняет колесо с задержкой: без паузы движение вверх
    // ушло бы в ещё не отработанный импульс вниз
    for (let tick = 0; tick < 6; tick += 1) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(2000);
    await expect(header).toHaveJSProperty("style.transform", "translateY(-100%)");

    for (let tick = 0; tick < 3; tick += 1) {
      await page.mouse.wheel(0, -120);
      await page.waitForTimeout(60);
    }
    await expect(header).toHaveJSProperty("style.transform", "translateY(0px)");
  });
});
