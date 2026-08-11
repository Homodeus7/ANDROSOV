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
  en: `// A marker is a whole comma-segment, never a substring. "Bread, reduced
// calorie and/or high fiber, white or NFS" ends in the letters of NFS and
// is a narrowed row; "Chicken breast, fried, ..., from raw" says raw about
// what it was fried from. Substring matching claimed both.
function segments(name: string): string[] {
  return name.split(",").map((s) => s.trim().replace(/\\s*\\([^()]*\\)$/, ""));
}

// "Spaghetti, spinach, dry" is three times the calories of the cooked row —
// the same mistake as raw mince, told with a different word.
const UNCOOKED_SEGMENT = /^(?:raw|dry|uncooked|unprepared)$/i;

function declaresUncooked(name: string): boolean {
  return segments(name).some((segment) => UNCOOKED_SEGMENT.test(segment));
}`,
  ru: `// Маркер — целый сегмент через запятую, а не подстрока. "Bread, reduced
// calorie and/or high fiber, white or NFS" кончается буквами NFS и при этом
// сужен; "Chicken breast, fried, ..., from raw" говорит raw про то, из чего
// жарили. По подстроке сырыми считались оба.
function segments(name: string): string[] {
  return name.split(",").map((s) => s.trim().replace(/\\s*\\([^()]*\\)$/, ""));
}

// "Spaghetti, spinach, dry" втрое калорийнее варёной строки — та же ошибка,
// что и сырой фарш, только сказанная другим словом.
const UNCOOKED_SEGMENT = /^(?:raw|dry|uncooked|unprepared)$/i;

function declaresUncooked(name: string): boolean {
  return segments(name).some((segment) => UNCOOKED_SEGMENT.test(segment));
}`,
};

const ambiguitySnippet = {
  en: `// How far the runner-up must sit below the winner for the winner to be
// trusted. ~2000 pairs of distinct rows sit above each other's threshold —
// cottage cheese 1% against 2%, beef raw against broiled — and between two
// plausible answers the honest one is neither.
const AMBIGUITY_MARGIN = 0.05;

// Compared inside a rule, never across it: two candidates reached by
// different rules are not two readings of the same evidence.
function isAmbiguous<T>(best: Scored<T>, scored: Scored<T>[], by: NameMatcher<T>): boolean {
  const winner = by.identify(best.candidate);

  return scored.some(
    (entry) =>
      entry.rule === best.rule &&
      by.identify(entry.candidate) !== winner &&
      entry.score > best.score - AMBIGUITY_MARGIN,
  );
}`,
  ru: `// Насколько ниже победителя должен сидеть второй, чтобы победителю верили.
// Около 2000 пар разных строк стоят выше порога друг друга — творог 1%
// против 2%, говядина raw против broiled, — а между двумя правдоподобными
// ответами честный ни один.
const AMBIGUITY_MARGIN = 0.05;

// Сравнение внутри правила, никогда между правилами: два кандидата, найденные
// разными правилами, — не два прочтения одного и того же.
function isAmbiguous<T>(best: Scored<T>, scored: Scored<T>[], by: NameMatcher<T>): boolean {
  const winner = by.identify(best.candidate);

  return scored.some(
    (entry) =>
      entry.rule === best.rule &&
      by.identify(entry.candidate) !== winner &&
      entry.score > best.score - AMBIGUITY_MARGIN,
  );
}`,
};

export const foodiq: CaseRecord = {
  slug: "foodiq",
  order: 0,
  nda: false,
  demos: ["food-match"],
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
      tagline: "A calorie tracker that reads plain language and refuses to invent the numbers",
      role: "Solo — frontend, backend, design, deploy",
      period: "2026 — present",
      metrics: [
        { value: "13 619", label: "reference rows", detail: "USDA FNDDS, SR and Foundation" },
        {
          value: "78%",
          label: "of entries matched",
          detail: "the rest stay honestly unlinked",
        },
        { value: "1049 KB", label: "entry bundle", detail: "down from 2139 KB" },
        { value: "3", label: "queries per day", detail: "however much was eaten" },
        { value: "0", label: "type drift", detail: "the client is generated from OpenAPI" },
        { value: "2", label: "clients", detail: "web and React Native, one contract" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Logging food is too much work to keep doing",
          body: [
            "Every tracker asks you to search a database, pick a portion and repeat that per item. People quit in a week.",
            "The input should be the sentence you would say out loud: “breakfast: 50g oats with a banana, coffee with milk”. Everything after that is the app's problem.",
          ],
        },
        {
          kind: "constraint",
          title: "One developer, a whole product",
          body: [
            "Diary, meal plans, macros, micronutrients, a private food and recipe base, a public recipe board, token billing paid in crypto, an admin panel, a landing page — and a React Native port.",
            "With no team, anything that can drift apart eventually will. The architecture had to delete whole classes of maintenance rather than absorb them.",
          ],
        },
        {
          kind: "solution",
          title: "The model names the food. It never counts the calories",
          body: [
            "Ask an LLM for kilocalories and it returns a plausible number. For a tracker that is the worst possible answer: wrong, and convincing.",
            "So the model has one job — turn a sentence into structure: dish, ingredient, quantity, unit. The counting is deterministic, on top of 13 619 imported USDA rows reached through a concept layer with Russian, English and Spanish aliases.",
            "That layer is where the work is. A reference row declares its condition inside its own name, and misreading that name is a threefold error: dry spaghetti against cooked, raw mince against fried.",
          ],
          code: {
            lang: "ts",
            caption: "reference-foods/domain — a row's condition lives in its name",
            source: rawRowSnippet.en,
          },
        },
        {
          kind: "solution",
          title: "When two answers are equally plausible, there is no answer",
          body: [
            "Roughly two thousand pairs of reference rows sit above each other's similarity threshold — cottage cheese at 1% and at 2%, beef raw and broiled. The difference between them is the entire difference in the result.",
            "So clearing the bar is not enough: the winner has to pull away from the runner-up. When it does not, the matcher returns nothing and the item is logged as unaccounted rather than handed another food's vitamins.",
            "That refusal is what the 78% is. The remaining fifth of entries carries no reference link, and the day says so instead of printing a number nobody measured.",
          ],
          code: {
            lang: "ts",
            caption: "name-score — the bar the winner has to clear over the runner-up",
            source: ambiguitySnippet.en,
          },
        },
        {
          kind: "solution",
          title: "Make the contract generate itself",
          body: [
            "The typed API client is generated from the backend's OpenAPI schema, so frontend and backend cannot physically disagree about types. Hook names come from the HTTP verb and route rather than the NestJS operationId, which keeps them stable across regenerations — and lets React Native reuse the same contract with no second hand-written layer.",
            "FSD layers with public APIs, held by lint rules: an import going upwards is impossible, not merely discouraged.",
            "Tests where a mistake is expensive: validation schemas, stores, critical flows — and the query count of the day aggregate, pinned by a test on a counter, because the naive version made three requests per item instead of three per day.",
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
            "The first production build shipped 2.1 MB of JavaScript to the entry route: the mock layer and its fixture generator were in the bundle because the API client was generated as one file, and the diary imported the video renderer statically.",
            "Splitting the generated client, making the heavy imports lazy and eventually deleting the mocks outright took the entry route to 1049 KB.",
            "It is also the only project here you can open. Live, public, maintained — every claim on this page is checkable against the running app and its two repositories.",
          ],
        },
      ],
    },
    ru: {
      title: "FoodIQ",
      tagline: "Трекер калорий, который понимает обычный текст и не выдумывает цифры",
      role: "Один — фронтенд, бэкенд, дизайн, деплой",
      period: "2026 — настоящее время",
      metrics: [
        { value: "13 619", label: "строк справочника", detail: "USDA FNDDS, SR и Foundation" },
        {
          value: "78%",
          label: "записей связаны",
          detail: "остальные честно остались без ссылки",
        },
        { value: "1049 КБ", label: "входной бандл", detail: "было 2139 КБ" },
        { value: "3", label: "запроса на день", detail: "сколько бы ни было съедено" },
        { value: "0", label: "расхождений типов", detail: "клиент генерируется из OpenAPI" },
        { value: "2", label: "клиента", detail: "веб и React Native, один контракт" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Вести дневник питания слишком трудоёмко",
          body: [
            "Любой трекер просит найти продукт в базе, выбрать граммовку и повторить это для каждой позиции. Люди бросают через неделю.",
            "Вводить нужно так, как человек сказал бы вслух: «завтрак: овсянка 50 г с бананом, кофе с молоком». Всё, что дальше, — забота приложения.",
          ],
        },
        {
          kind: "constraint",
          title: "Один разработчик и целый продукт",
          body: [
            "Дневник, планы питания, БЖУ, микронутриенты, своя база продуктов и рецептов, публичная доска рецептов, биллинг на токенах с оплатой криптой, админка, лендинг — и порт на React Native.",
            "Без команды всё, что может разойтись, однажды разойдётся. Архитектура должна была убирать целые классы поддержки, а не поглощать их.",
          ],
        },
        {
          kind: "solution",
          title: "Модель называет еду. Калории она не считает",
          body: [
            "Спросите у LLM килокалории — она вернёт правдоподобное число. Для трекера это худший ответ: неверный и убедительный.",
            "Поэтому у модели одна работа — превратить фразу в структуру: блюдо, ингредиент, количество, единица. Считает детерминированный слой поверх 13 619 импортированных строк USDA, до которых доводит слой концептов с русскими, английскими и испанскими алиасами.",
            "Вся работа там. Строка справочника объявляет своё состояние прямо в имени, и прочитать имя неверно — ошибиться втрое: сухие спагетти против варёных, сырой фарш против жареного.",
          ],
          code: {
            lang: "ts",
            caption: "reference-foods/domain — состояние строки живёт в её имени",
            source: rawRowSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Когда два ответа одинаково правдоподобны, ответа нет",
          body: [
            "Около двух тысяч пар строк справочника стоят выше порога сходства друг друга: творог 1% и 2%, говядина сырая и запечённая. Разница между ними — вся разница в ответе.",
            "Поэтому пройти порог мало: победитель обязан оторваться от второго. Не оторвался — матчер возвращает пустоту, и позиция уходит в дневник неучтённой, а не с чужими витаминами.",
            "Этот отказ и есть те самые 78%. Оставшаяся пятая часть записей живёт без ссылки на справочник, и день говорит это прямо, вместо того чтобы напечатать число, которого никто не мерил.",
          ],
          code: {
            lang: "ts",
            caption: "name-score — насколько победитель обязан оторваться от второго",
            source: ambiguitySnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Пусть контракт генерирует себя сам",
          body: [
            "Типизированный клиент генерируется из OpenAPI-схемы бэкенда — фронт и бэк физически не могут разойтись в типах. Имена хуков выводятся из HTTP-метода и маршрута, а не из operationId NestJS, поэтому переживают перегенерацию схемы и годятся React Native без второго рукописного слоя.",
            "Слои FSD с публичными API, границы держит линтер: импорт «снизу вверх» невозможен, а не просто нежелателен.",
            "Тесты там, где ошибка дорогая: схемы валидации, сторы, критичные сценарии — и число запросов дневного агрегата, закреплённое тестом на счётчике: наивная версия делала три запроса на позицию вместо трёх на день.",
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
            "Первая прод-сборка отдавала на входном маршруте 2,1 МБ JavaScript: слой моков и генератор фикстур попали в бандл, потому что API-клиент генерировался одним файлом, а дневник импортировал видеорендер статически.",
            "Разделение генерируемого клиента, ленивая загрузка тяжёлого и в итоге удаление моков целиком довели входной маршрут до 1049 КБ.",
            "Это ещё и единственный проект здесь, который можно открыть. Живой, публичный, поддерживается — каждое утверждение на странице проверяется по работающему приложению и двум его репозиториям.",
          ],
        },
      ],
    },
  },
};
