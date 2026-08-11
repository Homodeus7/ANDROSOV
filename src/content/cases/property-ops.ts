import type { CaseRecord } from "@/entities/case";

export const propertyOps: CaseRecord = {
  slug: "property-ops",
  order: 3,
  nda: false,
  stack: [
    "React",
    "React Native (Expo)",
    "TypeScript",
    "Zustand",
    "TanStack Query",
    "React Hook Form",
    "CASL",
    "OpenAPI / Orval",
    "NativeWind",
    "MSW",
    "Vite",
  ],
  demos: ["access-matrix"],
  links: [],
  content: {
    en: {
      title: "Property Ops",
      tagline: "A web dashboard for management companies and a mobile app for residents",
      role: "Frontend engineer — React, React Native",
      period: "Mar 2024 — Apr 2025",
      metrics: [
        { value: "2", label: "products", detail: "web dashboard and a resident app" },
        { value: "1", label: "file per new role", detail: "access rules live in one place" },
        { value: "0", label: "manual API types", detail: "client generated from OpenAPI" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Two audiences who never open the same screen",
          body: [
            "Management companies need buildings, flats, meter readings, tickets, enquiries, a resident registry and a summary dashboard. Residents need tickets, payments, documents and push notifications on a phone.",
            "The web side was a legacy codebase where a new developer took weeks to get a first task to release.",
          ],
        },
        {
          kind: "constraint",
          title: "Nothing could stop while it was rebuilt",
          body: [
            "The migration had to happen inside a shipping product — no freeze, no parallel rewrite.",
            "Roles multiply in this domain: an operator, a dispatcher, an accountant and a resident all see different halves of the same screen. Encoding that in components is how permission bugs are born.",
          ],
        },
        {
          kind: "solution",
          title: "Generate the contract, centralise the rules, mock the backend",
          body: [
            "The mobile app was built from scratch on React Native: tickets, payments, documents, push notifications.",
            "The legacy web moved to FSD without pausing development, and onboarding went from weeks to days for a first shipped task.",
            "The typed API client is generated from OpenAPI, so types stopped drifting and manual syncing disappeared. Access rules are declared once with CASL — components ask “is this action allowed”, and a new role is a single file change.",
            "API mocks let the frontend stop waiting on the backend, and the same mocks were reused in tests. The bundle was split by route, queries cached, redundant re-renders removed.",
          ],
        },
        {
          kind: "result",
          title: "Two shipped products and a codebase people can join",
          body: [
            "The resident app went to production, the dashboard got faster, and the architecture change is visible in how quickly a new developer becomes useful.",
          ],
        },
      ],
    },
    ru: {
      title: "Управление ЖК",
      tagline: "Веб-дашборд для управляющих компаний и мобильное приложение для жильцов",
      role: "Фронтенд-разработчик — React, React Native",
      period: "мар 2024 — апр 2025",
      metrics: [
        { value: "2", label: "продукта", detail: "веб-дашборд и приложение жильца" },
        { value: "1", label: "файл на новую роль", detail: "правила доступа в одном месте" },
        { value: "0", label: "ручных типов API", detail: "клиент генерируется из OpenAPI" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Две аудитории, которые никогда не открывают один экран",
          body: [
            "Управляющим компаниям нужны дома и квартиры, показания счётчиков, заявки, обращения, реестр жильцов и сводный дашборд. Жильцу — заявки, оплаты, документы и пуши в телефоне.",
            "Веб был legacy-кодовой базой, где новый разработчик доводил первую задачу до релиза неделями.",
          ],
        },
        {
          kind: "constraint",
          title: "Перестраивать пришлось, ничего не останавливая",
          body: [
            "Миграция шла внутри работающего продукта — без заморозки и без параллельного переписывания.",
            "Ролей в этом домене много: оператор, диспетчер, бухгалтер и жилец видят разные половины одного экрана. Зашивать это в компоненты — верный способ получить баги прав.",
          ],
        },
        {
          kind: "solution",
          title: "Сгенерировать контракт, собрать правила в одном месте, замокать бэкенд",
          body: [
            "Мобильное приложение сделано с нуля на React Native: заявки, оплаты, документы, push-уведомления.",
            "Legacy-веб переведён на FSD без остановки разработки — путь новичка до первой релизной задачи сократился с недель до дней.",
            "Типизированный клиент генерируется из OpenAPI: типы перестали расходиться, ручная синхронизация ушла совсем. Права описаны один раз на CASL — компоненты спрашивают «можно ли это действие», а новая роль это правка одного файла.",
            "Моки API избавили фронт от ожидания бэкенда, и те же моки переиспользуются в тестах. Бандл разбит по маршрутам, запросы закешированы, лишние ре-рендеры убраны.",
          ],
        },
        {
          kind: "result",
          title: "Два продукта в проде и база, в которую можно войти",
          body: [
            "Приложение жильца доехало до продакшена, дашборд ускорился, а результат смены архитектуры видно по тому, как быстро новый разработчик становится полезен.",
          ],
        },
      ],
    },
  },
};
