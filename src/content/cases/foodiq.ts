import type { CaseRecord } from "@/entities/case";

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
  ru: `// Насколько второй кандидат должен отставать от лидера, чтобы лидеру
// можно было верить. ~2000 пар разных строк перекрывают порог друг друга —
// творог 1% и 2%, говядина сырая и жареная, — и из двух правдоподобных
// ответов честный — ни один.
const AMBIGUITY_MARGIN = 0.05;

// Сравнение внутри одного правила, не между правилами: два кандидата,
// найденные разными правилами, — не два прочтения одних и тех же данных.
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
  en: `export class PreviewStreamError extends Error {
  constructor(
    message: string,
    readonly code: number | null,
    // The stream broke — network, non-200, a cut-off body: a retry makes sense,
    // and there is somewhere to retry, the plain endpoint. Otherwise the backend
    // sent \`error\` with the same domain code as the HTTP errors carry, and a
    // retry fails the same way
    readonly transport: boolean,
  ) {
    super(message);
  }
}

flush() {
  // Either a whole frame the server closed without a blank line — usually
  // \`done\` — or half a frame because the connection dropped. Only a failed
  // parse tells them apart, and the routine case is the second: phones lose
  // the network. Letting it throw would leak a SyntaxError out of
  // \`streamPreview\`, where it is neither a transport nor a domain error
  if (buffer.trim()) {
    try {
      emitFrame(buffer);
    } catch {
      // A tail that did not parse was never a frame. Dropping it leaves the
      // stream unfinished — which \`streamPreview\` already reports as the
      // transport failure it is
    }
  }
  buffer = "";
}`,
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
  en: `/**
 * Endpoints reached without a session: a 401 there is rejected credentials,
 * not an expired token.
 *
 * \`/auth/logout\` is not here for tidiness. Refreshing the session on its 401
 * would call \`clearSession\` from inside a \`clearSession\` already in flight,
 * and single-flight would hand it the very promise it is a link of. That
 * await never resolves: the tab stays stuck logged in, every request
 * failing, until a reload
 */
const ANONYMOUS_PATHS = ["/auth/refresh", "/auth/logout", "/auth/login", /* … */];

/**
 * Registered on module import, not from an effect: axios freezes the
 * interceptor chain at send time, copying the handlers into the request's
 * promise. Effects run bottom-up, so whatever the tree requests on mount —
 * \`/auth/me\` first of all — leaves before a parent effect could install the
 * interceptor, holds no reference to it, and an expired access token would
 * end the session instead of refreshing it
 */
installAuthInterceptor();`,
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
  en: `// A newer client wrote this layout: there is nothing to accept it with, and
// overwriting it with our default is not allowed either. A tab of the old
// build lives with \`staleTime: Infinity\` and never learns of the new version —
// without marking the current state as synced, it would send its initial
// snapshot over the top 800 ms later. Only what the user changes by hand leaves
if (!accepted) {
  lastSynced.current = JSON.stringify(latest.current);
  return;
}

/**
 * The list from the server response that suits the current version, or \`null\`.
 * A version from the future is not migrated: a client that knows more wrote
 * the layout, and its shape cannot be guessed backwards
 */
function acceptStored(stored, version, migrate) {
  if (stored.version === version) return { widgets: stored.widgets, migrated: false };
  if (typeof stored.version !== "number" || stored.version > version) return null;

  const widgets = migrate?.(stored.widgets, stored.version);
  return widgets ? { widgets, migrated: true } : null;
}`,
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
      role: "Lead Frontend — the whole frontend and its architecture, small product team",
      period: "2025 — present",
      metrics: [
        { value: "1049 KB", label: "entry bundle", detail: "down from 2139 KB" },
        {
          value: "16",
          label: "widgets on two dashboards",
          detail: "the user picks and orders them",
        },
        {
          value: "13 619",
          label: "USDA reference rows",
          detail: "calories come from code, not from the model",
        },
        {
          value: "78%",
          label: "of entries matched",
          detail: "the rest are honestly marked unlinked",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "Logging food is too much work to keep doing",
          body: [
            "Most trackers make you search a database, choose a portion and repeat it for every item.",
            "Here you write it the way you would say it: “breakfast: 50g oats with a banana, coffee with milk”. The app parses the rest.",
          ],
        },
        {
          kind: "constraint",
          title: "The whole frontend is mine",
          body: [
            "A Next.js web app and a React Native app heading for RuStore, the App Store and Google Play: diary, statistics, meal plans, recipes, billing, admin, landing page.",
            "I designed the frontend architecture: FSD, with module boundaries held by lint rules rather than by agreement.",
          ],
        },
        {
          kind: "solution",
          title: "The model names the food, the code does the numbers",
          body: [
            "The LLM does not count calories. It turns the sentence into structure — dish, ingredient, quantity — and a deterministic matcher links it to one of 13 619 USDA rows.",
            "When two candidates are too close — cottage cheese 1% and 2%, beef raw and broiled — the system does not guess: the item stays unlinked and the interface shows it. That is where the 78% comes from.",
          ],
          code: {
            lang: "ts",
            caption: "name-score — the bar the winner has to clear over the runner-up",
            source: ambiguitySnippet.en,
          },
        },
        {
          kind: "solution",
          title: "The parse arrives in pieces, and that is interface state",
          body: [
            "Parsing is gradual: first the list of items appears, then a food is found for each. So the interface shows the result as it becomes ready instead of hiding everything behind one spinner.",
            "The preview comes over SSE. The frontend assembles frames from arbitrary chunks and handles a cut-off tail separately — the network can drop at any moment.",
            "Errors are split into transport and domain ones: the first can be retried, the second cannot.",
          ],
          code: {
            lang: "ts",
            caption: "stream-preview.ts — parsing SSE and two kinds of “it didn't work”",
            source: streamSnippet.en,
          },
        },
        {
          kind: "solution",
          title: "A session that lives in no storage",
          body: [
            "There are no tokens in JavaScript: the session lives in `httpOnly` cookies. An expired access token is refreshed, and the original request is retried once.",
            "SSE uses a separate `fetch`: the regular axios interceptor cannot safely replay a `ReadableStream` that has already started.",
          ],
          code: {
            lang: "ts",
            caption: "app-interceptor.ts — two places where a session refresh breaks itself",
            source: interceptorSnippet.en,
          },
        },
        {
          kind: "solution",
          title: "A dashboard the user builds",
          body: [
            "Two dashboards hold 16 widgets that can be added, removed and reordered. The layout is stored on the server and has to survive tabs, devices and older client versions.",
            "While dragging, the order changes locally every frame and only the settled result goes to the server after a debounce. An old build that meets a newer layout has its own version check — it does not overwrite data it cannot read yet.",
          ],
          code: {
            lang: "ts",
            caption: "use-sync-widget-layout.ts — a layout from the future is not migrated",
            source: layoutSyncSnippet.en,
          },
        },
        {
          kind: "result",
          title: "Less JavaScript up front",
          body: [
            "The entry bundle went from 2.1 MB to 1049 KB: the API client is split and heavy modules load lazily.",
          ],
        },
      ],
    },
    ru: {
      title: "FoodIQ",
      tagline: "Трекер калорий, который понимает обычный текст и не выдумывает цифры",
      role: "Lead Frontend — весь фронтенд и архитектура, небольшая продуктовая команда",
      period: "2025 — настоящее время",
      metrics: [
        { value: "1049 КБ", label: "входной бандл", detail: "было 2139 КБ" },
        {
          value: "16",
          label: "виджетов на двух дашбордах",
          detail: "порядок и состав пользователь собирает сам",
        },
        {
          value: "13 619",
          label: "строк справочника USDA",
          detail: "калории считает код, а не модель",
        },
        {
          value: "78%",
          label: "записей связаны со справочником",
          detail: "остальные честно помечены несвязанными",
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
          title: "Весь фронтенд — на мне",
          body: [
            "Веб на Next.js и приложение на React Native, которое готовится к выходу в RuStore, App Store и Google Play: дневник, статистика, планы питания, рецепты, биллинг, админка, лендинг.",
            "Архитектуру фронтенда проектировал я: FSD, границы модулей держат правила линтера, а не договоренности.",
          ],
        },
        {
          kind: "solution",
          title: "Модель называет еду, цифры берет код",
          body: [
            "LLM не считает калории. Она превращает фразу в структуру — блюдо, ингредиент, количество, — а детерминированный матчер связывает ее с одной из 13 619 строк USDA.",
            "Если два кандидата слишком близки — творог 1% и 2%, говядина сырая и жареная, — система не угадывает: позиция остается несвязанной, и интерфейс это показывает. Отсюда и 78%.",
          ],
          code: {
            lang: "ts",
            caption: "name-score — насколько лидер должен опережать второго",
            source: ambiguitySnippet.ru,
          },
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
            "Входной бандл уменьшен с 2,1 МБ до 1049 КБ: API-клиент разделен, тяжелые модули грузятся лениво.",
          ],
        },
      ],
    },
  },
};
