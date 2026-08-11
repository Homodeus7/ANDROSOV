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
          title: "It was never one product, and never one kind of user",
          body: [
            "The studio ran several Web3 and GameFi products in parallel on outsourcing deadlines, so anything built for one of them had to survive being lifted into the next.",
            "And for a large share of these users it is the first crypto transaction of their life. An interface that forwards a provider's error verbatim has told them nothing.",
          ],
        },
        {
          kind: "solution",
          title: "State, not a run of popups",
          body: [
            "Connection, chain and signer became explicit state with typed transitions. A rejected signature, the wrong network, a pending request the user forgot about — each one arrives as something a person can act on rather than as a raw provider message.",
            "Trading carries price charts, deal tables and realtime updates without a reload; the referral section renders the team tree and how revenue is distributed through it.",
            "Loading states, empty states and error copy were worked out with the product owner and designer, because in this product they are the onboarding.",
          ],
        },
        {
          kind: "result",
          title: "Where the motion craft comes from",
          body: [
            "Two years of interfaces where a mistake costs a signed transaction — and of promo landings built on three.js and GSAP, where scroll is a script rather than a side effect. The choreography on this site is a direct descendant.",
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
          title: "Цифры на экране — деньги, и они меняются сами",
          body: [
            "Кабинет DeFi-продукта: трейдинг, инвестиционные программы, эрдропы и реферальная структура команды. Всё это живое одновременно — котировки идут потоком, сделки меняют статус, доход по рефералам пересчитывается прямо под тем, кто на него смотрит.",
            "Человек принимает решение по тому, что видит. Устаревшая цифра здесь — не косметика.",
          ],
        },
        {
          kind: "constraint",
          title: "Продукт был не один, и пользователь не один",
          body: [
            "Студия вела несколько Web3- и GameFi-продуктов параллельно, на аутсорс-сроках. Сделанное для одного обязано было переезжать в следующий, а не переписываться заново.",
            "А для заметной части этих людей происходящее — первая транзакция в жизни. Интерфейс, который дословно пробрасывает ошибку провайдера, не сказал им ничего.",
          ],
        },
        {
          kind: "solution",
          title: "Состояние вместо череды всплывающих окон",
          body: [
            "Подключение, сеть и подписант стали явным состоянием с типизированными переходами. Отклонённая подпись, не та сеть, забытый pending-запрос — каждое приходит на экран как то, с чем можно что-то сделать, а не как сырое сообщение провайдера.",
            "В трейдинге — графики котировок, таблицы сделок и обновление в реальном времени без перезагрузки. В реферальном разделе — дерево команды и распределение дохода по нему.",
            "Состояния загрузки, пустые состояния и тексты ошибок прорабатывались с продактом и дизайнером: в этом продукте они и есть онбординг.",
          ],
        },
        {
          kind: "result",
          title: "Откуда взялось ремесло по анимации",
          body: [
            "Два года интерфейсов, где ошибка стоит подписанной транзакции, — и промо-лендингов на three.js и GSAP, где скролл это сценарий, а не побочный эффект. Хореография этого сайта — их прямой потомок.",
          ],
        },
      ],
    },
  },
};
