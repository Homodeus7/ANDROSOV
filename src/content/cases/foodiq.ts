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
};

const streamSnippet = {
  ru: `export class PreviewStreamError extends Error {
  constructor(
    message: string,
    readonly code: number | null,
    // Сломался поток — сеть, не-200, оборванное тело: повторить имеет смысл,
    // и есть куда, на обычный эндпоинт. Иначе бэкенд прислал \`error\` с тем же
    // доменным кодом, что лежит в HTTP-ошибках, и повтор упадет так же
    readonly transport: boolean,
  ) {
    super(message);
  }
}

flush() {
  // Здесь либо целый кадр, который сервер закрыл без пустой строки — обычно
  // это \`done\`, — либо половина кадра, потому что связь оборвалась. Отличить
  // одно от другого можно только по неудачному разбору, и рутина тут второе:
  // телефоны теряют сеть. Дать ему бросить — значит выпустить SyntaxError из
  // \`streamPreview\`, где он не транспортная и не смысловая ошибка
  if (buffer.trim()) {
    try {
      emitFrame(buffer);
    } catch {
      // Хвост, который не разобрался, кадром и не был. Выбросив его, мы
      // оставляем поток незавершенным — а это \`streamPreview\` уже умеет
      // сообщить как транспортный сбой, которым он и является
    }
  }
  buffer = "";
}`,
};

const interceptorSnippet = {
  ru: `/**
 * Эндпоинты, до которых доходят без сессии: 401 там — отклоненные данные
 * входа, а не протухший токен.
 *
 * \`/auth/logout\` попал сюда не ради порядка. Обновление сессии на его 401
 * вызвало бы \`clearSession\` изнутри уже летящего \`clearSession\`, а
 * single-flight вернул бы ему ровно тот промис, звеном которого он является.
 * Этот await не резолвится никогда: вкладка залипает залогиненной, с каждым
 * падающим запросом, до перезагрузки
 */
const ANONYMOUS_PATHS = ["/auth/refresh", "/auth/logout", "/auth/login", /* … */];

/**
 * Регистрация на импорте модуля, а не из эффекта: axios замораживает цепочку
 * перехватчиков в момент отправки запроса, копируя обработчики в его промис.
 * Эффекты выполняются снизу вверх, поэтому все, что дерево запрашивает на
 * маунте — \`/auth/me\` в первую очередь, — уходит раньше, чем родительский
 * эффект успел бы поставить перехватчик, ссылки на него не держит, и
 * протухший access-токен закончил бы сессию вместо того, чтобы обновить ее
 */
installAuthInterceptor();`,
};

const layoutSyncSnippet = {
  ru: `// Раскладку писал клиент новее: принять ее нечем, но и затирать своим
// дефолтом нельзя. Вкладка старой сборки живет с \`staleTime: Infinity\` и про
// новую версию не узнает никогда — не пометив текущее состояние синхронным,
// она через 800 мс отправила бы поверх нее свой начальный снимок. Уедет
// только то, что пользователь поменяет руками
if (!accepted) {
  lastSynced.current = JSON.stringify(latest.current);
  return;
}

/**
 * Список из ответа сервера, годный для текущей версии, или \`null\`.
 * Версия из будущего не мигрируется: раскладку писал клиент, который знает
 * больше, и угадывать ее форму назад нельзя
 */
function acceptStored(stored, version, migrate) {
  if (stored.version === version) return { widgets: stored.widgets, migrated: false };
  if (typeof stored.version !== "number" || stored.version > version) return null;

  const widgets = migrate?.(stored.widgets, stored.version);
  return widgets ? { widgets, migrated: true } : null;
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
    "dnd-kit",
    "Zod",
    "Orval / OpenAPI",
    "Remotion",
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
      tagline:
        "A calorie tracker that understands plain language without inventing the numbers",
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
            "Most trackers make you search a database, choose a portion and repeat it for every item. That gets old fast.",
            "FoodIQ starts with the sentence you would actually say: “breakfast: 50g oats with a banana, coffee with milk”. The app handles the rest.",
          ],
        },
        {
          kind: "constraint",
          title: "One developer, a whole product",
          body: [
            "Diary, meal plans, nutrition, a private food and recipe base, a public recipe board, billing, admin, landing page — plus a React Native app.",
            "With one developer, the main constraint was keeping the same product from turning into several different codebases.",
          ],
        },
        {
          kind: "solution",
          title: "The model names the food. It never counts the calories",
          body: [
            "An LLM can give you a plausible calorie count. That's exactly what a tracker should not do.",
            "The model only turns the sentence into structure: dish, ingredient, quantity and unit. Calories come from deterministic code and 13 619 USDA rows, connected through Russian, English and Spanish aliases.",
            "The tricky part is the food's condition: dry vs cooked, raw vs fried. It is encoded in the reference name and has to be matched correctly.",
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
            "About two thousand pairs of reference rows are close enough to be genuinely ambiguous — for example, cottage cheese 1% vs 2%, or raw vs broiled beef.",
            "A match is accepted only when the winner is clearly ahead of the runner-up. Otherwise the item stays unlinked instead of inheriting another food's nutrition.",
            "That is where the 78% comes from: the rest is left unresolved on purpose.",
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
            "The API client is generated from the backend's OpenAPI schema, so web and React Native use the same typed contract. Hook names come from the HTTP method and route, which keeps them stable between regenerations.",
            "FSD boundaries are enforced by lint rules rather than convention. Tests cover the places where a small regression is expensive: validation, state and critical flows.",
          ],
          code: {
            lang: "ts",
            caption: "orval.config.ts — hook names survive schema regeneration",
            source: operationNameSnippet,
          },
        },
        {
          kind: "result",
          title: "A smaller entry bundle",
          body: [
            "The entry route went from 2.1 MB to 1049 KB by splitting the generated API client and lazy-loading heavy modules.",
            "The result is a lighter first load without changing the product itself.",
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
        { value: "1049 КБ", label: "входной бандл", detail: "было 2139 КБ" },
        {
          value: "16",
          label: "виджетов на двух дашбордах",
          detail: "порядок и состав пользователь собирает сам",
        },
        {
          value: "800 мс",
          label: "дебаунс раскладки",
          detail: "драг двигает порядок каждый кадр, на сервер уезжает успокоившийся",
        },
        {
          value: "13 619",
          label: "строк справочника USDA",
          detail: "калории считает детерминированный код, а не модель",
        },
        {
          value: "78%",
          label: "записей связаны со справочником",
          detail: "остальные интерфейс показывает несвязанными",
        },
        {
          value: "2",
          label: "клиента",
          detail: "web и React Native, один OpenAPI-контракт",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "Дневник питания бросают через неделю",
          body: [
            "Большинство трекеров заставляют искать продукт в базе, выбирать порцию и повторять это для каждой позиции.",
            "Здесь достаточно написать как обычно: «завтрак: овсянка 50 г с бананом, кофе с молоком». Остальное разбирает приложение.",
          ],
        },
        {
          kind: "constraint",
          title: "Один разработчик, целый продукт",
          body: [
            "Целый продукт в одиночку: дневник, статистика, планы питания, нутриенты, рецепты, биллинг, админка, лендинг и React Native.",
            "Поэтому архитектура здесь не про сложность ради сложности. Она про то, чтобы web, mobile и backend не разошлись каждый в свою сторону.",
          ],
        },
        {
          kind: "solution",
          title: "Модель называет еду, цифры берет код",
          body: [
            "LLM не считает калории. Она превращает фразу в структуру, а детерминированный матчер связывает ее с одной из 13 619 строк USDA.",
            "Если два кандидата слишком близки — например, творог 1% и 2% — система не угадывает. Позиция остается несвязанной и показывает это пользователю.",
            "Это важнее красивой цифры: лучше честно сказать «не знаю», чем посчитать чужой продукт.",
          ],
        },
        {
          kind: "solution",
          title: "Разбор приезжает по частям, и это состояние интерфейса",
          body: [
            "Разбор идет постепенно: сначала появляется список позиций, затем для каждой находится продукт. Поэтому интерфейс показывает результат по мере готовности, а не прячет все за одним спиннером.",
            "Превью приходит по SSE. Фронт собирает кадры из произвольных чанков и отдельно обрабатывает оборванный хвост — сеть может пропасть в любой момент.",
            "Ошибки разделены на транспортные и смысловые: первые можно повторить, вторые — нет.",
          ],
          code: {
            lang: "ts",
            caption: "stream-preview.ts — разбор SSE и два вида «не получилось»",
            source: streamSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Сессия, которой нет ни в одном хранилище",
          body: [
            "Токенов в JavaScript нет: сессия живет в `httpOnly`-куках. Истекший access-токен обновляется через refresh, после чего исходный запрос повторяется один раз.",
            "Для SSE используется отдельный `fetch`: обычный axios-интерсептор не может безопасно переиграть уже начатый `ReadableStream`.",
          ],
          code: {
            lang: "ts",
            caption: "app-interceptor.ts — два места, где обновление сессии ломает само себя",
            source: interceptorSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Дашборд, который пользователь собирает сам",
          body: [
            "На двух дашбордах — 16 виджетов: их можно добавлять, удалять и менять местами. Раскладка хранится на сервере и должна переживать вкладки, устройства и старые версии клиента.",
            "При drag порядок меняется локально каждый кадр, а на сервер уходит только итог после debounce. Для старой сборки, которая встретила более новую раскладку, есть отдельная проверка версии — она не перезаписывает данные, которых еще не умеет понимать.",
            "Превью виджетов использует те же компоненты и query keys, что и реальный дашборд, но с отдельным QueryClient и `enabled: false`, поэтому демо не делает сетевых запросов.",
          ],
          code: {
            lang: "ts",
            caption: "use-sync-widget-layout.ts — раскладка из будущего не мигрируется",
            source: layoutSyncSnippet.ru,
          },
        },
        {
          kind: "result",
          title: "Меньше JavaScript на входе",
          body: [
            "Входной бандл уменьшен с 2,1 МБ до 1049 КБ за счет разделения API-клиента и ленивой загрузки тяжелых модулей.",
            "Тяжелые части приложения теперь не влияют на первую загрузку, пока действительно не нужны.",
          ],
        },
      ],
    },
  },
};
