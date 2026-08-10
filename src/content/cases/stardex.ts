import type { CaseRecord } from "@/entities/case";

export const stardex: CaseRecord = {
  slug: "stardex",
  order: 4,
  nda: false,
  stack: [
    "Vue 3",
    "TypeScript",
    "Pinia",
    "TanStack Query",
    "ethers.js",
    "MetaMask",
    "WalletConnect",
    "ApexCharts",
    "GSAP",
    "three.js",
    "Vite",
  ],
  links: [],
  content: {
    en: {
      title: "Stardex",
      tagline: "Wallet auth, live trading data and 3D promo work for Web3 startups",
      role: "Frontend engineer — outsourcing studio",
      period: "Jun 2022 — Feb 2024",
      metrics: [
        { value: "2", label: "wallet providers", detail: "MetaMask and WalletConnect" },
        { value: "0", label: "page reloads", detail: "trading data arrives over the socket" },
        { value: "20", label: "months", detail: "across DeFi and GameFi products" },
      ],
      sections: [
        {
          kind: "problem",
          title: "The wallet is the login screen, and it fails in its own language",
          body: [
            "A DeFi product with trading, investment programmes, airdrops and a referral team structure. Sign-in is a crypto wallet: MetaMask or WalletConnect, transaction signing, network switching.",
            "Wallets fail loudly and unhelpfully — rejected signatures, wrong chain, a pending request the user forgot about. Passing those errors through raw makes the product look broken.",
          ],
        },
        {
          kind: "constraint",
          title: "Vue, in 2022, without the libraries that exist now",
          body: [
            "wagmi did not exist for Vue at the time. The wallet layer was written on ethers.js through our own composables — connection state, chain, signer and error mapping had to be modelled by hand.",
            "The studio ran several Web3 and GameFi products in parallel, so whatever was built had to be lifted into the next project.",
          ],
        },
        {
          kind: "solution",
          title: "Model the wallet as state, not as a series of prompts",
          body: [
            "Connection, chain and signer became explicit state with typed transitions, and every wallet error was mapped to something a person can act on instead of a raw provider message.",
            "The trading section carries price charts, deal tables and realtime updates without a page reload; the referral section renders the team tree and revenue distribution.",
            "Promo landing pages used three.js and GSAP — the same scroll choreography discipline this site runs on.",
            "UX was worked out together with the product owner and designer: loading states, error handling, and onboarding for users whose first ever transaction happens here.",
          ],
        },
        {
          kind: "result",
          title: "Where the motion craft comes from",
          body: [
            "Two years of shipping interfaces where a mistake costs a signed transaction. The 3D and scroll work on those landing pages is the direct ancestor of the choreography on this site.",
          ],
        },
      ],
    },
    ru: {
      title: "Stardex",
      tagline: "Вход по кошельку, живые торговые данные и 3D-промо для Web3-стартапов",
      role: "Фронтенд-разработчик — аутсорс-студия",
      period: "июн 2022 — фев 2024",
      metrics: [
        { value: "2", label: "провайдера кошелька", detail: "MetaMask и WalletConnect" },
        { value: "0", label: "перезагрузок страницы", detail: "торговые данные идут сокетом" },
        { value: "20", label: "месяцев", detail: "на DeFi- и GameFi-продуктах" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Кошелёк — это экран входа, и ломается он на своём языке",
          body: [
            "DeFi-продукт: трейдинг, инвестиционные программы, эрдропы и реферальная структура команды. Вход — крипто-кошелёк: MetaMask или WalletConnect, подпись транзакций, переключение сети.",
            "Кошельки падают громко и бесполезно: отклонённая подпись, не та сеть, забытый пользователем pending-запрос. Пробрасывать эти ошибки как есть — значит выглядеть сломанным продуктом.",
          ],
        },
        {
          kind: "constraint",
          title: "Vue, 2022 год, без библиотек, которые есть сейчас",
          body: [
            "wagmi под Vue тогда не существовало. Слой кошелька написан на ethers.js через свои composables — состояние подключения, сеть, signer и разбор ошибок пришлось моделировать руками.",
            "Студия вела несколько Web3- и GameFi-продуктов параллельно, поэтому сделанное должно было переноситься в следующий проект.",
          ],
        },
        {
          kind: "solution",
          title: "Описать кошелёк состоянием, а не чередой всплывающих окон",
          body: [
            "Подключение, сеть и signer стали явным состоянием с типизированными переходами, а каждая ошибка кошелька отображается в то, с чем человек может что-то сделать, вместо сырого сообщения провайдера.",
            "Торговый раздел — графики котировок, таблицы сделок и обновление в реальном времени без перезагрузки; реферальный — дерево команды и распределение дохода.",
            "Промо-лендинги на three.js и GSAP — та же дисциплина скролл-хореографии, на которой собран этот сайт.",
            "UX прорабатывался вместе с продактом и дизайнером: состояния загрузки, обработка ошибок, онбординг тех, у кого это первая транзакция в жизни.",
          ],
        },
        {
          kind: "result",
          title: "Откуда взялось ремесло по анимации",
          body: [
            "Два года интерфейсов, где ошибка стоит подписанной транзакции. 3D и скролл на тех лендингах — прямой предок хореографии этого сайта.",
          ],
        },
      ],
    },
  },
};
