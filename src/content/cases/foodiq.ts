import type { CaseRecord } from "@/entities/case";

export const foodiq: CaseRecord = {
  slug: "foodiq",
  order: 0,
  nda: false,
  demos: ["meal-stream"],
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
          title: "Calories do not come from the neural network",
          body: [
            "The neural network only reads the sentence and splits it into foods and amounts: “oatmeal, 50 g”, “banana, 1 piece”. It never writes a single number of calories.",
            "Calories, protein, fat and carbs come from the USDA food reference, where every food has measured values per 100 grams. So the numbers are the same every time and cannot be invented.",
            "When the reference offers two similar options — cottage cheese 1% or 2%, beef raw or fried — the app does not guess. The item is marked as “needs clarifying”, and the user can see it.",
          ],
        },
        {
          kind: "solution",
          title: "The parse arrives in pieces, and that is interface state",
          body: [
            "Parsing is gradual: first the list of items appears, then a food is found for each. So the interface shows the result as it becomes ready instead of hiding everything behind one spinner.",
            "The preview comes over SSE. The frontend assembles frames from arbitrary chunks and handles a cut-off tail separately — the network can drop at any moment.",
            "Errors are split into transport and domain ones: the first can be retried, the second cannot.",
          ],
        },
        {
          kind: "solution",
          title: "A dashboard the user builds",
          body: [
            "Two dashboards hold 16 widgets that can be added, removed and reordered. The layout is stored on the server and has to survive tabs, devices and older client versions.",
            "While dragging, the order changes locally every frame and only the settled result goes to the server after a debounce. An old build that meets a newer layout has its own version check — it does not overwrite data it cannot read yet.",
          ],
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
          title: "Калории считает не нейросеть",
          body: [
            "Нейросеть только читает фразу и раскладывает ее на продукты и количества: «овсянка, 50 г», «банан, 1 шт». Ни одной цифры калорий она не пишет.",
            "Калории и БЖУ берутся из справочника продуктов USDA, где у каждого продукта измеренные значения на 100 грамм. Поэтому цифры всегда одни и те же, и выдумать их негде.",
            "Если в справочнике есть два похожих варианта — творог 1% или 2%, говядина сырая или жареная, — приложение не угадывает. Позиция помечается как «нужно уточнить», и пользователь это видит.",
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
        },
        {
          kind: "solution",
          title: "Дашборд, который пользователь собирает сам",
          body: [
            "На двух дашбордах — 16 виджетов: их можно добавлять, удалять и менять местами. Раскладка хранится на сервере и должна переживать вкладки, устройства и старые версии клиента.",
            "При drag порядок меняется локально каждый кадр, а на сервер уходит только итог после debounce. Для старой сборки, которая встретила более новую раскладку, есть отдельная проверка версии — она не перезаписывает данные, которых еще не умеет понимать.",
          ],
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
