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

const rawRowSnippet = {
  en: `// A marker is always a whole comma-segment, never a substring.
// "Bread, reduced calorie and/or high fiber, white or NFS" ends in the
// letters NFS and is still a narrowed row; "Chicken breast, fried, ...,
// from raw" says raw about the meat it was fried from. Substring
// matching caught both.
function segments(name: string): string[] {
  return name.split(",").map((s) => s.trim().replace(/\\s*\\([^()]*\\)$/, ""));
}

// "Spaghetti, spinach, dry" is three times the calories of the cooked
// row — the same error as raw mince, told with a different word.
const UNCOOKED_SEGMENT = /^(?:raw|dry|uncooked|unprepared)$/i;

function declaresUncooked(name: string): boolean {
  return segments(name).some((segment) => UNCOOKED_SEGMENT.test(segment));
}`,
  ru: `// Маркер — всегда целый сегмент, никогда подстрока.
// "Bread, reduced calorie and/or high fiber, white or NFS" кончается
// буквами NFS и при этом сужен; "Chicken breast, fried, ..., from raw"
// говорит raw про мясо, из которого жарили. По подстроке оба ловились.
function segments(name: string): string[] {
  return name.split(",").map((s) => s.trim().replace(/\\s*\\([^()]*\\)$/, ""));
}

// "Spaghetti, spinach, dry" втрое калорийнее варёной строки — та же
// ошибка, что и сырой фарш, только другим словом.
const UNCOOKED_SEGMENT = /^(?:raw|dry|uncooked|unprepared)$/i;

function declaresUncooked(name: string): boolean {
  return segments(name).some((segment) => UNCOOKED_SEGMENT.test(segment));
}`,
};

const missingNutrientSnippet = {
  en: `type NutrientReading = {
  key: NutrientKey;
  amount: number;
  unit: NutrientUnit;
};

type DayNutrients = {
  readings: NutrientReading[];
  // Items whose composition could not be read: they neither vanish
  // nor turn into zero — the day says plainly what it does not know
  unaccountedItems: UnaccountedItem[];
};`,
  ru: `type NutrientReading = {
  key: NutrientKey;
  amount: number;
  unit: NutrientUnit;
};

type DayNutrients = {
  readings: NutrientReading[];
  // Позиции, состав которых прочитать не удалось: они не исчезают
  // и не превращаются в ноль — день честно говорит, чего не знает
  unaccountedItems: UnaccountedItem[];
};`,
};

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
    "MongoDB",
    "React Native (Expo)",
  ],
  links: [
    { label: "foodiq.space", href: "https://foodiq.space" },
    { label: "GitHub", href: "https://github.com/Homodeus7" },
  ],
  content: {
    en: {
      title: "FoodIQ",
      tagline: "Calorie tracker that reads plain language — and refuses to guess the numbers",
      role: "Solo — frontend, backend, design, deploy",
      period: "2026 — present",
      metrics: [
        { value: "13 619", label: "reference rows", detail: "USDA FNDDS, SR and Foundation" },
        { value: "78%", label: "of diary entries matched", detail: "to a measured reference row" },
        { value: "1049 KB", label: "entry bundle", detail: "down from 2139 KB" },
        { value: "3", label: "queries per day view", detail: "regardless of how much was eaten" },
        { value: "0", label: "type drift", detail: "client generated from the OpenAPI schema" },
        { value: "2", label: "clients", detail: "web and React Native from one contract" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Logging food is too much work to keep doing",
          body: [
            "Every tracker asks you to search a database, pick a portion size and repeat that for each item. People quit in a week.",
            "The input should be the sentence a person would say out loud: “breakfast: 50g oats with a banana, coffee with milk”. Everything after that is the app's problem, not the user's.",
          ],
        },
        {
          kind: "constraint",
          title: "One developer, a full product surface",
          body: [
            "Diary, meal plans, macro ratios, micronutrients, a private food and recipe base, a public recipe board, token billing with crypto payments, an admin panel, a marketing landing page — and a React Native port.",
            "With no team, anything that can drift out of sync eventually will. The architecture had to remove entire classes of maintenance instead of absorbing them.",
          ],
        },
        {
          kind: "solution",
          title: "The model names the food. It never counts the calories.",
          body: [
            "An LLM asked for kilocalories will produce a plausible number, and a plausible number is the worst possible answer for a tracker: it is wrong and it looks right.",
            "So the model does one job — turn free text into structure: dish, ingredients, quantity, unit. The counting is a deterministic layer on top of 13 619 imported USDA reference rows, reached through a concept layer with Russian, English and Spanish aliases.",
            "That layer is where the real work is. A reference row states its condition inside its own name, and reading that name wrong changes the answer threefold: dry spaghetti against cooked, raw mince against fried. Markers are read as whole comma-segments — a bracketed rider once hid the word “raw” from the very rule written to catch it, and the pollock stayed on the raw row.",
          ],
          code: {
            lang: "ts",
            caption: "reference-foods/domain — the condition of a row lives in its name",
            source: rawRowSnippet.en,
          },
        },
        {
          kind: "solution",
          title: "An unmeasured nutrient is absent, not zero",
          body: [
            "MyFitnessPal shows a zero where nobody measured anything, and passes it off as a measurement. That single lie is what Cronometer beats it with.",
            "So the invariant is the opposite: a nutrient nobody measured has no reading at all. Recipe items that cannot be read stay visible as unaccounted; a day where nothing could be read says that in one sentence instead of printing 27 dashes against 27 targets.",
            "The same honesty applies to targets. A recommendation is a range, not a number — sodium, saturated fat and cholesterol only ever fell out of the table because they are ceilings and there was no field for a ceiling.",
          ],
          code: {
            lang: "ts",
            caption: "day nutrients — what the day does not know is part of the answer",
            source: missingNutrientSnippet.en,
          },
        },
        {
          kind: "solution",
          title: "Make the contract generate itself",
          body: [
            "The typed API client is generated from the backend OpenAPI schema, so frontend and backend cannot physically disagree about types. Hook names are derived from the HTTP verb and route rather than the NestJS operationId, which keeps them stable across regenerations — and lets the React Native client consume the same contract without a second hand-written layer.",
            "FSD layers with public APIs, enforced by lint rules: bottom-up imports are impossible, not merely discouraged.",
            "Tests only where a mistake is expensive: validation schemas, stores, critical flows, and the query count of the day aggregate — that one is pinned by a test on a counter, because a naive implementation would have made three requests per item instead of three per day.",
          ],
          code: {
            lang: "ts",
            caption: "orval.config.ts — hook names survive schema regeneration",
            source: operationNameSnippet,
          },
        },
        {
          kind: "result",
          title: "Half the entry bundle was never needed",
          body: [
            "The first production build shipped 2.1 MB of JavaScript to the entry route: the mock layer and its fixture generator were sitting in the production bundle because the API client was generated as a single file, and the video renderer was imported statically by the diary.",
            "Splitting the generated client, making the heavy imports lazy and eventually deleting the mock layer outright took the entry route to 1049 KB. The mocks were never used by anything except their own scaffolding.",
          ],
        },
        {
          kind: "result",
          title: "The only project here you can open",
          body: [
            "Live, public and maintained. Nothing on this page is reconstructed — the source of every claim is the running app and its two repositories.",
          ],
        },
      ],
    },
    ru: {
      title: "FoodIQ",
      tagline: "Трекер калорий, который понимает обычный текст — и не выдумывает цифры",
      role: "Один — фронтенд, бэкенд, дизайн, деплой",
      period: "2026 — настоящее время",
      metrics: [
        { value: "13 619", label: "строк справочника", detail: "USDA FNDDS, SR и Foundation" },
        { value: "78%", label: "записей дневника связаны", detail: "с измеренной строкой справочника" },
        { value: "1049 КБ", label: "входной бандл", detail: "было 2139 КБ" },
        { value: "3", label: "запроса на день", detail: "сколько бы ни было съедено" },
        { value: "0", label: "расхождений типов", detail: "клиент генерируется из OpenAPI" },
        { value: "2", label: "клиента", detail: "веб и React Native из одного контракта" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Вести дневник питания слишком трудоёмко",
          body: [
            "Любой трекер заставляет искать продукт в базе, выбирать граммовку и повторять это для каждой позиции. Люди бросают через неделю.",
            "Вводить нужно так, как человек сказал бы вслух: «завтрак: овсянка 50 г с бананом, кофе с молоком». Всё, что дальше, — забота приложения, а не пользователя.",
          ],
        },
        {
          kind: "constraint",
          title: "Один разработчик и полноценный продукт",
          body: [
            "Дневник, планы питания, БЖУ, микронутриенты, своя база продуктов и рецептов, публичная доска рецептов, биллинг на токенах с оплатой криптой, админка, маркетинговый лендинг — и порт на React Native.",
            "Без команды всё, что может разойтись, однажды разойдётся. Архитектура должна была убирать целые классы поддержки, а не поглощать их.",
          ],
        },
        {
          kind: "solution",
          title: "Модель называет еду. Калории она не считает никогда",
          body: [
            "LLM, у которой спросили килокалории, выдаст правдоподобное число, а правдоподобное число — худший из возможных ответов для трекера: оно неверное и при этом выглядит верным.",
            "Поэтому у модели одна работа — превратить свободный текст в структуру: блюдо, ингредиенты, количество, единица. Считает детерминированный слой поверх 13 619 импортированных строк справочника USDA, до которых доводит слой концептов с русскими, английскими и испанскими алиасами.",
            "Вся настоящая работа — там. Строка справочника объявляет своё состояние прямо в имени, и неверно прочитанное имя меняет ответ втрое: сухие спагетти против варёных, сырой фарш против жареного. Маркеры читаются целыми сегментами через запятую — однажды скобочная приписка спрятала слово «raw» от правила, написанного ровно ради него, и минтай остался на сырой строке.",
          ],
          code: {
            lang: "ts",
            caption: "reference-foods/domain — состояние строки живёт в её имени",
            source: rawRowSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Неизмеренный нутриент отсутствует, а не равен нулю",
          body: [
            "MyFitnessPal рисует ноль там, где никто ничего не мерил, и выдаёт его за измерение. Ровно этой ложью его и бьёт Cronometer.",
            "Поэтому инвариант обратный: у нутриента, который никто не измерял, показания нет вовсе. Позиции рецепта, состав которых прочитать не удалось, остаются видимыми как неучтённые; день, где не прочиталась ни одна позиция, говорит это одной фразой вместо 27 прочерков против 27 целей.",
            "Та же честность и в нормах. Рекомендация — это диапазон, а не число: натрий, насыщенные жиры и холестерин выпадали из таблицы только потому, что их рекомендация — потолок, а поля под потолок не было.",
          ],
          code: {
            lang: "ts",
            caption: "нутриенты дня — то, чего день не знает, входит в ответ",
            source: missingNutrientSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Пусть контракт генерирует себя сам",
          body: [
            "Типизированный клиент генерируется из OpenAPI-схемы бэкенда — фронт и бэк физически не могут разойтись в типах. Имена хуков выводятся из HTTP-метода и маршрута, а не из operationId NestJS, поэтому переживают перегенерацию схемы — и позволяют клиенту на React Native жить на том же контракте без второго рукописного слоя.",
            "Слои FSD с публичными API, границы держит линтер: импорты «снизу вверх» невозможны, а не просто нежелательны.",
            "Тесты там, где ошибка дорогая: схемы валидации, сторы, критичные сценарии — и число запросов дневного агрегата: оно закреплено тестом на счётчике, потому что наивная реализация сделала бы три запроса на позицию вместо трёх на день.",
          ],
          code: {
            lang: "ts",
            caption: "orval.config.ts — имена хуков переживают перегенерацию схемы",
            source: operationNameSnippet,
          },
        },
        {
          kind: "result",
          title: "Половина входного бандла была там не нужна",
          body: [
            "Первая прод-сборка отдавала на входном маршруте 2,1 МБ JavaScript: слой моков и генератор фикстур попали в прод-бандл, потому что API-клиент генерировался одним файлом, а видеорендер импортировался дневником статически.",
            "Разделение генерируемого клиента, ленивая загрузка тяжёлого и в итоге удаление слоя моков целиком довели входной маршрут до 1049 КБ. Моками не пользовалось ничего, кроме их собственной обвязки.",
          ],
        },
        {
          kind: "result",
          title: "Единственный проект здесь, который можно открыть",
          body: [
            "Живой, публичный, поддерживается. Ничего на этой странице не реконструировано — источник каждого утверждения это работающее приложение и два его репозитория.",
          ],
        },
      ],
    },
  },
};
