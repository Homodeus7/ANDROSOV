import type { CaseRecord } from "@/entities/case";

export const web3Terminal: CaseRecord = {
  slug: "web3-terminal",
  order: 4,
  nda: true,
  stack: [
    "Vue 3",
    "TypeScript",
    "Pinia",
    "TanStack Query",
    "ethers.js",
    "WebSocket",
    "ApexCharts",
    "GSAP",
    "three.js",
    "Vite",
  ],
  demos: ["wallet-state"],
  links: [],
  content: {
    en: {
      title: "DeFi Terminal",
      tagline: "Quotes, deals and referral income, all moving under the user at once",
      role: "Frontend engineer — outsourcing studio",
      period: "Jun 2022 — Feb 2024",
      metrics: [
        {
          value: "4",
          label: "sections, one cabinet",
          detail: "trading, programmes, drops, team",
        },
        {
          value: "0",
          label: "page reloads",
          detail: "quotes and deals arrive over the socket",
        },
        {
          value: "20",
          label: "months",
          detail: "across the studio's DeFi and GameFi products",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "The numbers are money, and they move on their own",
          body: [
            "A DeFi cabinet: trading, investment programmes, airdrops and a referral team structure. All of it alive at the same time — quotes stream, deals change status, referral income recalculates under whoever is reading it.",
            "People act on what they see. A stale number here is not a cosmetic defect.",
          ],
        },
        {
          kind: "constraint",
          title: "One Codebase — Multiple Products",
          body: [
            "The studio ran several Web3 and GameFi products in parallel on outsourcing deadlines, so anything built for one of them had to survive being lifted into the next.",
            "And for a large share of these users it is the first crypto transaction of their life. An interface that forwards a provider's error verbatim has told them nothing.",
          ],
        },
        {
          kind: "solution",
          title: "State, not a run of popups",
          body: [
            "Connection, network, and signing became explicit, typed states. Wrong network, rejected signature, or a stuck request — each scenario has a clear next action instead of exposing raw provider errors.",
            "In trading — charts, trade tables, and real-time updates without reloads. In the referral section — team hierarchy and revenue distribution.",
            "Loading, empty, and error states were designed together with the product manager and designer: for a new user, they are part of the onboarding experience.",
          ],
        },
        {
          kind: "result",
          title: "Foundation for Further Work",
          body: [
            "It was not just about building interfaces, but understanding what stands behind them: application state, API interactions, errors, constraints, and user scenarios. This is where the foundation was built for working with modern frontend frameworks.",
          ],
        },
      ],
    },
    ru: {
      title: "DeFi-терминал",
      tagline: "Котировки, сделки и реферальный доход — всё меняется под пользователем разом",
      role: "Фронтенд-разработчик — аутсорс-студия",
      period: "июн 2022 — фев 2024",
      metrics: [
        {
          value: "4",
          label: "раздела в одном кабинете",
          detail: "трейдинг, программы, эрдропы, команда",
        },
        {
          value: "0",
          label: "перезагрузок страницы",
          detail: "котировки и сделки идут сокетом",
        },
        { value: "20", label: "месяцев", detail: "на DeFi- и GameFi-продуктах студии" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Цифры на экране — это деньги",
          body: [
            "Кабинет DeFi-продукта: трейдинг, инвестиционные программы, эйрдропы и реферальная система. Всё обновляется в реальном времени: меняются котировки и статусы сделок, пересчитывается реферальный доход.",
            "Пользователь принимает решения по этим данным. Устаревшая цифра здесь — уже не просто ошибка интерфейса.",
          ],
        },
        {
          kind: "constraint",
          title: "Один код — несколько продуктов",
          body: [
            "Студия параллельно вела несколько Web3- и GameFi-продуктов. Решения, сделанные для одного проекта, должны были легко переноситься в следующий — без переписывания с нуля.",
            "Для многих пользователей это была первая криптотранзакция. Поэтому сырая ошибка провайдера не помогала понять, что произошло и что делать дальше.",
          ],
        },
        {
          kind: "solution",
          title: "Состояние вместо череды всплывающих окон",
          body: [
            "Подключение, сеть и подпись стали явными типизированными состояниями. Неверная сеть, отклонённая подпись или зависший запрос — это понятные сценарии с конкретным следующим действием, а не сырые ошибки провайдера.",
            "В трейдинге — графики, таблицы сделок и обновления в реальном времени без перезагрузки. В реферальном разделе — дерево команды и распределение дохода.",
            "Загрузки, пустые состояния и ошибки прорабатывались вместе с продактом и дизайнером: для нового пользователя это часть онбординга.",
          ],
        },
        {
          kind: "result",
          title: "Основа для дальнейшей работы",
          body: [
            "Не просто собирать интерфейсы, а понимать, что стоит за ними: состояние приложения, взаимодействие с API, ошибки, ограничения и сценарии пользователя. Именно здесь появилась база, на которой дальше строилась вся работа с современными фронтенд-фреймворками.",
          ],
        },
      ],
    },
  },
};
