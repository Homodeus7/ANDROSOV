import type { CaseRecord } from "@/entities/case";

export const tenderStat: CaseRecord = {
  slug: "tender-stat",
  order: 6,
  nda: false,
  stack: [
    "Nuxt 4",
    "Vue 3",
    "TypeScript",
    "Sanity v5",
    "GROQ",
    "Tailwind CSS 4",
    "Reka UI",
    "Chart.js",
    "Vercel ISR",
  ],
  links: [{ label: "tenderstatt.ru", href: "https://tenderstatt.ru" }],
  content: {
    en: {
      title: "TenderStat",
      tagline: "A procurement analytics landing page the client edits without a developer",
      role: "Frontend engineer — Nuxt, Vue, Sanity",
      period: "2026",
      metrics: [
        {
          value: "98",
          label: "Lighthouse performance, desktop",
          detail: "best practices and SEO at 100",
        },
        {
          value: "100",
          label: "Lighthouse accessibility",
          detail: "mobile profile",
        },
        {
          value: "0",
          label: "layout shifts on load",
          detail: "CLS 0, main thread blocked for 0 ms",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "The client edits every block, and a block can go missing",
          body: [
            "Services, process steps, news, sample reports with charts and a contact form — all of it lives in Sanity and changes without a deploy. Any field can be left empty or deleted, and markup that counts on the data breaks at exactly that moment.",
          ],
        },
        {
          kind: "constraint",
          title: "One person, from the first call to deploy",
          body: [
            "I ran the project on my own: talked to the client throughout, agreed on what goes on the page and how it is edited, built it and shipped it to production.",
          ],
        },
        {
          kind: "solution",
          title: "A page builder with defaults",
          body: [
            "The page is an array of Sanity blocks. The frontend switches on _type and hands each block to its widget; every widget takes data?: Block | null and falls back to static copy, so a missing block never becomes an empty screen.",
            "The Studio is embedded at /studio. The report charts on Chart.js load as a separate chunk and cost nothing on the first screen.",
          ],
        },
        {
          kind: "result",
          title: "Measured on the live site",
          body: [
            "The HTML took 3.3 s: the server render called Sanity on every request. The page moved to ISR — served from cache, revalidated in the background.",
            "Accessibility to 100: text contrast, list roles in the header, accessible names matching visible labels.",
            "The animated 800×800 blurred blobs of the first screen are gone on phones and stay on desktop only under prefers-reduced-motion: no-preference.",
            "Self-hosting the fonts instead of fontshare made first paint 0.6 s slower: a local woff2 lands in the critical path, the external stylesheet does not. Reverted.",
          ],
        },
      ],
    },
    ru: {
      title: "ТендерСтат",
      tagline: "Лендинг сервиса аналитики закупок, который заказчик правит без разработчика",
      role: "Фронтенд-разработчик — Nuxt, Vue, Sanity",
      period: "2026",
      metrics: [
        {
          value: "98",
          label: "Lighthouse, производительность на десктопе",
          detail: "лучшие практики и SEO — 100",
        },
        {
          value: "100",
          label: "Lighthouse, доступность",
          detail: "мобильный профиль",
        },
        {
          value: "0",
          label: "сдвигов макета за загрузку",
          detail: "CLS 0, главный поток заблокирован 0 мс",
        },
      ],
      sections: [
        {
          kind: "problem",
          title: "Заказчик правит каждый блок, и блок может пропасть",
          body: [
            "Услуги, шаги работы, новости, примеры отчетов с графиками и форма — все лежит в Sanity и меняется без деплоя. Любое поле могут не заполнить или удалить, и верстка, которая рассчитывает на данные, ломается ровно в этот момент.",
          ],
        },
        {
          kind: "constraint",
          title: "Один человек — от первого созвона до деплоя",
          body: [
            "Вел проект сам: плотно общался с заказчиком, вместе решали, что будет на странице и как ее править, сделал и выложил в прод.",
          ],
        },
        {
          kind: "solution",
          title: "Конструктор страницы с дефолтами",
          body: [
            "Страница — массив блоков Sanity. Фронт разбирает _type и отдает блок своему виджету; каждый виджет принимает data?: Block | null и падает на статический текст, так что пропавший блок не превращается в пустой экран.",
            "Studio встроена в /studio. Графики отчетов на Chart.js вынесены в отдельный чанк и первому экрану ничего не стоят.",
          ],
        },
        {
          kind: "result",
          title: "Померено на живом сайте",
          body: [
            "HTML отдавался 3,3 секунды: серверный рендер ходил в Sanity на каждый запрос. Страница переведена на ISR — отдается из кеша и обновляется в фоне.",
            "Доступность до 100: контраст текста, роли списков в шапке, доступные имена совпадают с видимыми подписями.",
            "Анимация двух размытых пятен 800×800 на первом экране убрана с телефонов и осталась только на десктопе при prefers-reduced-motion: no-preference.",
            "Шрифты на своем хосте вместо fontshare замедлили первую отрисовку на 0,6 секунды: локальный woff2 попадает в критический путь, внешний стиль — нет. Откачено.",
          ],
        },
      ],
    },
  },
};
