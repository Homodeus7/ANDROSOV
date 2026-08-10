import { test, expect, type Page } from "@playwright/test";

const block = (page: Page, id: string) => page.locator(`[data-block="${id}"]`);

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await page.locator("#undo-redo").scrollIntoViewIfNeeded();
  await expect(block(page, "n1")).toBeVisible();
}

async function dragBlock(page: Page, id: string, steps: number) {
  const box = (await block(page, id).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let step = 1; step <= steps; step += 1) {
    await page.mouse.move(box.x + box.width / 2 + step * 3, box.y + box.height / 2 + step);
  }
  await page.mouse.up();
}

test.describe("undo/redo demo", () => {
  test("mounts the Vue island only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    // Остров грузится отдельным чанком: до появления на экране его в DOM нет
    await expect(block(page, "n1")).toHaveCount(0);

    await page.locator("#undo-redo").scrollIntoViewIfNeeded();
    await expect(block(page, "n1")).toBeVisible();
  });

  test("writes one action for a whole drag, whatever the pointer did", async ({ page }) => {
    await openDemo(page);
    await dragBlock(page, "n1", 20);

    const signals = Number(await page.locator("[data-buffer=signals]").innerText());
    const raw = Number(await page.locator("[data-buffer=raw]").innerText());
    const sent = Number(await page.locator("[data-buffer=sent]").innerText());

    // Жест — одно действие. Промежуточные точки в буфер не попадают вовсе,
    // иначе ⌘Z отменял бы кадр перетаскивания, а не само перетаскивание
    expect(signals).toBeGreaterThan(5);
    expect(raw).toBe(1);
    expect(sent).toBe(1);
  });

  test("undoes the whole gesture at once", async ({ page }) => {
    await openDemo(page);
    const before = (await block(page, "n1").boundingBox())!;

    await dragBlock(page, "n1", 20);

    // Сочетание слушается на корне демо, а не на документе: четыре демки на
    // одной странице не должны драться за ⌘Z
    await block(page, "n1").focus();
    await page.keyboard.press("ControlOrMeta+z");

    const rewound = (await block(page, "n1").boundingBox())!;
    expect(Math.abs(rewound.x - before.x)).toBeLessThan(2);
  });

  test("rewinds the canvas from the scrubber", async ({ page }) => {
    await openDemo(page);
    const before = (await block(page, "n1").boundingBox())!;

    await dragBlock(page, "n1", 20);
    const dragged = (await block(page, "n1").boundingBox())!;
    expect(Math.abs(dragged.x - before.x)).toBeGreaterThan(20);

    await page.locator('input[type="range"]').fill("0");
    const rewound = (await block(page, "n1").boundingBox())!;
    expect(Math.abs(rewound.x - before.x)).toBeLessThan(2);
    expect(await page.locator("[data-buffer=raw]").innerText()).toBe("0");
  });

  test("erases a block that was added and removed inside the buffer", async ({ page }) => {
    await openDemo(page);

    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(block(page, "t1")).toBeVisible();

    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(block(page, "t1")).toHaveCount(0);

    expect(Number(await page.locator("[data-buffer=raw]").innerText())).toBe(2);
    expect(await page.locator("[data-buffer=sent]").innerText()).toBe("0");
  });
});
