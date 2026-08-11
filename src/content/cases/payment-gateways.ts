import type { CaseRecord } from "@/entities/case";

export const paymentGateways: CaseRecord = {
  slug: "payment-gateways",
  order: 2,
  nda: true,
  demos: ["tx-table", "dynamic-form", "live-rollup"],
  stack: [
    "React",
    "TypeScript",
    "Redux Toolkit",
    "TanStack Query",
    "TanStack Table",
    "React Hook Form",
    "shadcn/ui",
    "Tailwind CSS",
    "Sentry",
    "Vite",
    "FSD",
  ],
  links: [],
  content: {
    en: {
      title: "Payment Gateways",
      tagline: "Three B2B fintech apps sharing one codebase without colliding",
      role: "Frontend engineer",
      period: "Apr 2025 — Jan 2026",
      metrics: [
        { value: "−30", label: "% load on billing", detail: "measured on server metrics" },
        {
          value: "500+",
          label: "transactions per view",
          detail: "scrolled without dropped frames",
        },
        { value: "50+", label: "modules", detail: "three apps, one FSD codebase" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Three products, three audiences, one repository",
          body: [
            "A merchant cabinet (deals, orders, devices, payout details, balances, referrals, API integrations and webhooks), an operator admin panel (users, transactions, disputes, withdrawals, financial reporting) and an embeddable payment form for the end payer.",
            "Different teams, different release rhythms, one codebase. Without hard boundaries, a change in one app becomes an incident in another.",
          ],
        },
        {
          kind: "constraint",
          title: "Money data is live data",
          body: [
            "Transaction statuses change under the user. A table of five hundred rows that repaints on every websocket message is unusable, and the numbers on screen have to stay correct while it happens.",
            "Every widget polling for its own data hit the billing service hard enough to show up on server metrics.",
          ],
        },
        {
          kind: "solution",
          title: "Boundaries in the code, one cache under the widgets",
          body: [
            "The FSD architecture grew to 50+ modules with each team owning its own boundaries — apps share primitives, not internals.",
            "Instead of every widget fetching for itself, one shared query cache serves them. Load on the billing service dropped by 30%.",
            "Tables filter client-side without a round trip, and a status update repaints one row rather than the grid. Financial forms validate dynamically: the field set follows the payout method and currency, which removed a whole class of input errors and support tickets.",
            "Sentry with source maps wired to the release, so an error in production points at a line rather than a bundle.",
          ],
        },
        {
          kind: "result",
          title: "The table is rebuilt here, with the repaints visible",
          body: [
            "The client's data is closed, the render strategy is not. In the Lab, a mock websocket streams status updates into a virtualised table and a heatmap overlay shows exactly which rows repainted — which is the entire point of the work.",
          ],
        },
      ],
    },
    ru: {
      title: "Платёжные шлюзы",
      tagline: "Три B2B-финтех-приложения в одной кодовой базе, не мешая друг другу",
      role: "Фронтенд-разработчик",
      period: "апр 2025 — янв 2026",
      metrics: [
        { value: "−30", label: "% нагрузки на биллинг", detail: "замер по серверным метрикам" },
        {
          value: "500+",
          label: "транзакций на экране",
          detail: "листаются без просадки кадра",
        },
        { value: "50+", label: "модулей", detail: "три приложения, одна база на FSD" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Три продукта, три аудитории, один репозиторий",
          body: [
            "Кабинет мерчанта (сделки, ордера, устройства, реквизиты, выплаты, балансы, рефералка, API-интеграции и вебхуки), админ-панель оператора (пользователи, транзакции, споры, выводы, финансовая отчётность) и встраиваемая платёжная форма для конечного плательщика.",
            "Разные команды, разные ритмы релизов, одна кодовая база. Без жёстких границ правка в одном приложении становится инцидентом в другом.",
          ],
        },
        {
          kind: "constraint",
          title: "Данные о деньгах — живые данные",
          body: [
            "Статусы транзакций меняются под пользователем. Таблица на пятьсот строк, которая перерисовывается на каждое сообщение из веб-сокета, непригодна к работе, а цифры на экране обязаны оставаться верными.",
            "Каждый виджет, опрашивающий данные сам, нагружал биллинг заметно — вплоть до серверных метрик.",
          ],
        },
        {
          kind: "solution",
          title: "Границы в коде, один кеш под виджетами",
          body: [
            "Архитектура по FSD выросла до 50+ модулей, у каждой команды свои границы — приложения делят примитивы, а не внутренности.",
            "Вместо самостоятельного опроса в каждом виджете — общий кеш запросов. Нагрузка на биллинг снизилась на 30%.",
            "Фильтры в таблицах срабатывают без похода на сервер, а обновление статуса перерисовывает одну строку, а не сетку. Финансовые формы валидируются динамически: набор полей следует за способом вывода и валютой — это убрало целый класс ошибок ввода и обращений в поддержку.",
            "Sentry с привязкой сорсмапов к релизу: ошибка в проде указывает на строку, а не на бандл.",
          ],
        },
        {
          kind: "result",
          title: "Таблица пересобрана здесь, и перерисовки видно",
          body: [
            "Данные клиента закрыты, стратегия рендера — нет. В Лаборатории мок-веб-сокет сыпет обновления статусов в виртуализированную таблицу, а оверлей-хитмап показывает, какие строки реально перерисовались. В этом и была вся работа.",
          ],
        },
      ],
    },
  },
};
