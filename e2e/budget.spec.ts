import { test, expect, type Page } from "@playwright/test";

// Потолок, а не цель: 233 КБ на замере, из них ~115 КБ — сам React с Next,
// а ~65 КБ — GSAP с плагинами, который сборщик поднимает в общий чанк.
// Тест ловит регрессию, а не подтверждает, что бюджет из плана взят
const INITIAL_JS_KB = 260;

async function initialScripts(page: Page, route: string) {
  let bytes = 0;
  page.on("response", (response) => {
    if (response.request().resourceType() !== "script") return;
    void response
      .request()
      .sizes()
      .then((sizes) => {
        bytes += sizes.responseBodySize;
      })
      .catch(() => {});
  });

  await page.goto(route, { waitUntil: "load" });
  return Math.round(bytes / 1024);
}

test.describe("payload budget", () => {
  for (const route of ["/en", "/en/lab", "/en/resume"]) {
    test(`keeps the initial javascript under budget on ${route}`, async ({ page }) => {
      const kilobytes = await initialScripts(page, route);
      expect(kilobytes, `${kilobytes} KB of javascript before load`).toBeLessThan(
        INITIAL_JS_KB,
      );
    });
  }

  // Vue не входит в начальную загрузку страницы. Отдельный чанк с ним Next
  // подтягивает уже после `load`, по простою — это не то же самое, что «по
  // появлению на экране», но в отрисовку первого экрана он не попадает
  async function scriptsContaining(page: Page, needle: string) {
    const bodies: Promise<{ url: string; hit: boolean }>[] = [];
    let loaded = false;

    page.on("response", (response) => {
      if (loaded || response.request().resourceType() !== "script") return;
      bodies.push(
        response
          .text()
          .then((body) => ({ url: response.url(), hit: body.includes(needle) }))
          .catch(() => ({ url: response.url(), hit: false })),
      );
    });

    await page.goto("/en/lab", { waitUntil: "load" });
    loaded = true;

    return (await Promise.all(bodies)).filter((script) => script.hit).map((s) => s.url);
  }

  test("keeps Vue out of the initial payload", async ({ page }) => {
    const vue = await scriptsContaining(page, "createApp");
    expect(vue, vue.join("\n")).toEqual([]);
  });

  // Правила доступа целиком лежат в чанке демо: один импорт из обёртки утянул
  // бы и CASL, и таблицу правил в начальную загрузку каждой страницы
  test("keeps the rules engine out of the initial payload", async ({ page }) => {
    const casl = await scriptsContaining(page, "__caslSubjectType__");
    expect(casl, casl.join("\n")).toEqual([]);
  });
});
