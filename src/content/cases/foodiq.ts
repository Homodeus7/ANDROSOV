import type { CaseRecord } from "@/entities/case";

const operationNameSnippet = `const operationName = (_op: unknown, route: string, verb: string): string =>
  \`\${verb}\${route.split("/").filter(Boolean).map(pascal).join("")}\`;

export default defineConfig({
  "nutri-ai": {
    input: { target: "./src/shared/api/schema.yml" },
    output: {
      target: "./src/shared/api/generated",
      mode: "split",
      client: "react-query",
      override: { operationName, mutator: { path: "./src/shared/api/api-instance.ts" } },
    },
  },
});`;

export const foodiq: CaseRecord = {
  slug: "foodiq",
  order: 0,
  nda: false,
  stack: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind v4",
    "shadcn/ui",
    "TanStack Query",
    "Zustand",
    "Zod",
    "Orval / OpenAPI",
    "NestJS",
    "React Native (Expo)",
  ],
  links: [
    { label: "foodiq.space", href: "https://foodiq.space" },
    { label: "GitHub", href: "https://github.com/Homodeus7" },
  ],
  content: {
    en: {
      title: "FoodIQ",
      tagline: "Calorie tracker that reads plain language",
      role: "Solo — frontend, backend, design, deploy",
      period: "2026 — present",
      metrics: [
        { value: "0", label: "type drift", detail: "client generated from the OpenAPI schema" },
        { value: "2", label: "languages", detail: "EN / RU across web and mobile" },
        { value: "50+", label: "modules", detail: "FSD layers with enforced public APIs" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Logging food is too much work to keep doing",
          body: [
            "Every tracker asks you to search a database, pick a portion size and repeat that for each item. People quit in a week.",
            "The input should be the sentence a person would say out loud: “breakfast: 50g oats with a banana, coffee with milk”.",
          ],
        },
        {
          kind: "constraint",
          title: "One developer, a real product surface",
          body: [
            "Diary, meal plans, macro ratios, a private food and recipe base, a public recipe library, token billing with crypto payments, an admin panel, a marketing landing page — and a React Native port.",
            "With no team, anything that can drift out of sync eventually will. The architecture had to remove entire classes of maintenance instead of absorbing them.",
          ],
        },
        {
          kind: "solution",
          title: "Make the contract generate itself",
          body: [
            "The typed API client is generated from the backend OpenAPI schema, so frontend and backend cannot physically disagree about types. Hook names are derived from the HTTP verb and route rather than the NestJS operationId, which keeps them stable across regenerations.",
            "FSD layers with public APIs, enforced by lint rules: bottom-up imports are impossible, not merely discouraged.",
            "Tests only where a mistake is expensive: validation schemas, stores, critical flows. Vitest for units, Playwright end to end, Storybook for components.",
          ],
          code: {
            lang: "ts",
            caption: "orval.config.ts — hook names survive schema regeneration",
            source: operationNameSnippet,
          },
        },
        {
          kind: "result",
          title: "The only project here you can open",
          body: [
            "Live, public and maintained. Nothing on this page is reconstructed — the source of every claim is the running app.",
          ],
        },
      ],
    },
    ru: {
      title: "FoodIQ",
      tagline: "Трекер калорий, который понимает обычный текст",
      role: "Один — фронтенд, бэкенд, дизайн, деплой",
      period: "2026 — настоящее время",
      metrics: [
        { value: "0", label: "расхождений типов", detail: "клиент генерируется из OpenAPI" },
        { value: "2", label: "языка", detail: "EN / RU на вебе и в мобилке" },
        { value: "50+", label: "модулей", detail: "слои FSD с публичными API" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Вести дневник питания слишком трудоёмко",
          body: [
            "Любой трекер заставляет искать продукт в базе, выбирать граммовку и повторять это для каждой позиции. Люди бросают через неделю.",
            "Вводить нужно так, как человек сказал бы вслух: «завтрак: овсянка 50 г с бананом, кофе с молоком».",
          ],
        },
        {
          kind: "constraint",
          title: "Один разработчик и полноценный продукт",
          body: [
            "Дневник, планы питания, соотношение БЖУ, своя база продуктов и рецептов, публичная библиотека, биллинг на токенах с оплатой криптой, админка, маркетинговый лендинг — и порт на React Native.",
            "Без команды всё, что может разойтись, однажды разойдётся. Архитектура должна была убирать целые классы поддержки, а не поглощать их.",
          ],
        },
        {
          kind: "solution",
          title: "Пусть контракт генерирует себя сам",
          body: [
            "Типизированный клиент генерируется из OpenAPI-схемы бэкенда — фронт и бэк физически не могут разойтись в типах. Имена хуков выводятся из HTTP-метода и маршрута, а не из operationId NestJS, поэтому переживают перегенерацию схемы.",
            "Слои FSD с публичными API, границы держит линтер: импорты «снизу вверх» невозможны, а не просто нежелательны.",
            "Тесты там, где ошибка дорогая: схемы валидации, сторы, критичные сценарии. Vitest на юниты, Playwright сквозные, Storybook на компоненты.",
          ],
          code: {
            lang: "ts",
            caption: "orval.config.ts — имена хуков переживают перегенерацию схемы",
            source: operationNameSnippet,
          },
        },
        {
          kind: "result",
          title: "Единственный проект здесь, который можно открыть",
          body: [
            "Живой, публичный, поддерживается. Ничего на этой странице не реконструировано — источник каждого утверждения это работающее приложение.",
          ],
        },
      ],
    },
  },
};
