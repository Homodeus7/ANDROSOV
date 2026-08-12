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
    // доменным кодом, что лежит в HTTP-ошибках, и повтор упадёт так же
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
      // оставляем поток незавершённым — а это \`streamPreview\` уже умеет
      // сообщить как транспортный сбой, которым он и является
    }
  }
  buffer = "";
}`,
};

const interceptorSnippet = {
  ru: `/**
 * Эндпоинты, до которых доходят без сессии: 401 там — отклонённые данные
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
 * Эффекты выполняются снизу вверх, поэтому всё, что дерево запрашивает на
 * маунте — \`/auth/me\` в первую очередь, — уходит раньше, чем родительский
 * эффект успел бы поставить перехватчик, ссылки на него не держит, и
 * протухший access-токен закончил бы сессию вместо того, чтобы обновить её
 */
installAuthInterceptor();`,
};

const layoutSyncSnippet = {
  ru: `// Раскладку писал клиент новее: принять её нечем, но и затирать своим
// дефолтом нельзя. Вкладка старой сборки живёт с \`staleTime: Infinity\` и про
// новую версию не узнает никогда — не пометив текущее состояние синхронным,
// она через 800 мс отправила бы поверх неё свой начальный снимок. Уедет
// только то, что пользователь поменяет руками
if (!accepted) {
  lastSynced.current = JSON.stringify(latest.current);
  return;
}

/**
 * Список из ответа сервера, годный для текущей версии, или \`null\`.
 * Версия из будущего не мигрируется: раскладку писал клиент, который знает
 * больше, и угадывать её форму назад нельзя
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
      tagline: "Трекер калорий, который скорее промолчит, чем ответит правдоподобно",
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
          value: "1",
          label: "исключение в правилах слоёв",
          detail: "именованное, с условием, при котором вместо него заводится новый ярус",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "Дневник питания бросают через неделю",
          body: [
            "Любой трекер просит найти продукт в базе, выбрать граммовку и повторить это для каждой позиции завтрака.",
            "Вводить нужно так, как человек сказал бы вслух: «завтрак: овсянка 50 г с бананом, кофе с молоком». Всё, что дальше, — работа интерфейса.",
          ],
        },
        {
          kind: "constraint",
          title: "Один разработчик, целый продукт",
          body: [
            "Дневник, статистика, планы питания, БЖУ и микронутриенты, своя база продуктов и рецептов, публичная доска рецептов, биллинг на токенах с оплатой криптой, админка, лендинг — и порт на React Native с того же сгенерированного из OpenAPI контракта.",
            "Без команды всё, что может разъехаться, однажды разъедется. Слои FSD держит линтер, накопленный долг — храповик по файлам, а исключение из правил слоёв ровно одно и оно именованное: `ai-parse` стоит на ярусе, которого в FSD нет, — выше сущностей, ниже четырёх зовущих его фич. Рядом записано условие, при котором вместо второго исключения заводится настоящий ярус.",
          ],
        },
        {
          kind: "solution",
          title: "Модель называет еду, цифры берёт код",
          body: [
            "Спросите у LLM килокалории — она вернёт правдоподобное число. Для дневника это худший ответ: неверный и убедительный. Поэтому у модели одна работа — превратить фразу в структуру, а какой строкой USDA измерена эта еда, решает детерминированный матчер: лестница именованных правил поверх 13 619 импортированных строк.",
            "Когда победитель не оторвался от второго — а около двух тысяч пар строк стоят выше порога сходства друг друга, творог 1% и 2%, — матчер не отвечает вовсе.",
            "Интерфейсу достаётся самая неудобная часть: показать незнание. Позиция получает бейдж «найден», «похожий» или «новый», несвязанная строка живёт без микронутриентов и говорит об этом прямо, а рядом лежит подбор альтернатив — потому что «сыр» это всегда вопрос, а не ответ. Как устроена сама лестница, можно потрогать в демо на этой странице.",
          ],
        },
        {
          kind: "solution",
          title: "Разбор приезжает по частям, и это состояние интерфейса",
          body: [
            "Разбор фразы — не один ответ, а несколько секунд работы: сначала известен список позиций, потом каждая по очереди находит свой продукт. Ждать конца молча значит показывать спиннер ровно там, где происходит самое интересное.",
            "Поэтому превью идёт по SSE, а разбор потока живёт на фронте: кадры приезжают разрезанными по произвольным границам чанков и склеиваются через буфер, а хвост без завершающей пустой строки разбирается отдельно — телефон теряет связь посреди кадра, и это обычный вторник, а не сбой.",
            "Ошибки потока разделены на два вида, потому что от этого зависит кнопка. Транспортная — сеть, не-200, оборванное тело: повторить имеет смысл, и есть куда, на обычный эндпоинт. Смысловая — бэкенд прислал `error` с доменным кодом: повтор упадёт так же, и предлагать его нечестно.",
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
            "Токенов в JS не лежит вообще: сессия ездит httpOnly-куками, 401 на обычном запросе — это штатное старение access-токена, и перехватчик меняет refresh-куку на новую пару и переигрывает запрос один раз. Сессия кончилась, только если не получилось обновить.",
            "Два места, где эта схема ломает сама себя, стоили по вечеру каждое. Обновление на 401 от `/auth/logout` вызывает `clearSession` изнутри уже летящего `clearSession`, и single-flight отдаёт ему тот самый промис, звеном которого он является: вкладка залипает залогиненной до перезагрузки. А перехватчик, поставленный из эффекта, опаздывает — axios замораживает цепочку в момент отправки, эффекты идут снизу вверх, и `/auth/me` уходит без него.",
            "Стриминг живёт рядом с этим и ровно поэтому написан своим `fetch`: половину съеденного ReadableStream перехватчик переиграть не может, а без переигрывания каждый протухший токен стоил бы визитёру падения со стрима на один поздний ответ.",
          ],
          code: {
            lang: "ts",
            caption: "app-interceptor.ts — два места, где обновление сессии ломает само себя",
            source: interceptorSnippet.ru,
          },
        },
        {
          kind: "solution",
          title: "Дашборд, который пользователь пересобирает",
          body: [
            "Дневник и статистика — шестнадцать виджетов, которые перетаскиваются, добавляются и убираются, плюс до восьми приёмов пищи со своими названиями. Раскладка лежит в настройках пользователя, а значит обязана пережить второе устройство и вкладку со старой сборкой.",
            "Простая часть — дебаунс: драг меняет порядок каждый кадр, на сервер уезжает успокоившийся результат, а недождавшийся таймер дописывается при уходе со страницы. Сложная — все способы, которыми экран затирает сам себя: двойной монтаж эффектов в dev, эхо сразу после гидрации, кадр, который старше только что применённой с сервера раскладки.",
            "И отдельно — раскладка, записанная клиентом новее. Разобрать её нечем, но и затирать своим дефолтом нельзя: вкладка старой сборки про новую версию не узнает никогда.",
            "В диалоге выбора виджета крутится не скриншот, а тот же самый компонент с теми же хуками — демо-данные подкладываются в отдельный QueryClient теми же генерёнными ключами, которыми строятся настоящие запросы, а `enabled: false` делает «превью не пойдёт в сеть» гарантией, а не надеждой.",
          ],
          code: {
            lang: "ts",
            caption: "use-sync-widget-layout.ts — раскладка из будущего не мигрируется",
            source: layoutSyncSnippet.ru,
          },
        },
        {
          kind: "result",
          title: "Половина входного бандла была там не нужна",
          body: [
            "Первая прод-сборка отдавала на входе 2,1 МБ JavaScript: слой моков с генератором фикстур попал в бандл, потому что API-клиент генерировался одним файлом, а дневник статически импортировал видеорендер.",
            "Разделение клиента, ленивые тяжёлые импорты и удаление моков целиком довели вход до 1049 КБ. Каждый виджет теперь приезжает своим чанком и до приезда держит место тем же скелетоном, который покажет сам, — иначе грид прыгает на первой отрисовке. Видеорендер остался — он собирает из дня вертикальный ролик прямо в браузере, — но грузится, только когда его попросили.",
            "Это единственный проект здесь, который можно открыть. Живой, публичный, поддерживается — каждое утверждение на этой странице проверяется по работающему приложению и двум его репозиториям.",
          ],
        },
      ],
    },
  },
};
