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
  links: [
    { label: "tender-search-chi.vercel.app", href: "https://tender-search-chi.vercel.app/" },
  ],
  content: {
    en: {
      title: "TenderStat",
      tagline: "A landing page for a procurement analytics service, assembled from CMS blocks",
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
          title: "A landing page the developer does not edit",
          body: [
            "The service sells procurement analytics: who wins in your niche, how a buyer negotiates, which prices take the contract. The page has to carry services, process steps, trust, news, sample reports with charts and a contact form — and the client has to be able to change all of it without a deploy.",
            "That makes each section not a piece of copy but a structure: a schema in the CMS, a type on the frontend and a widget that renders it.",
          ],
        },
        {
          kind: "constraint",
          title: "The client edits the content, the page has to open regardless",
          body: [
            "Every heading, card and block lives in Sanity and is edited by the client, not by a developer. A field can be left empty, renamed or deleted — and markup that counts on the data being there breaks at exactly that moment.",
            "The second constraint is the first screen. People arrive on a landing page from an ad link, on a phone: whatever loads before the first paint is paid for in leads that never arrive.",
          ],
        },
        {
          kind: "solution",
          title: "A page builder, not a layout traced from a mockup",
          body: [
            "The page is an array of blocks in Sanity. The frontend switches on _type and hands each one to its widget; every widget takes data?: Block | null and falls back to static defaults, so a missing block degrades to the shipped copy instead of an empty screen.",
            "The Studio is embedded at /studio, so the client edits content on their own domain. The app is split into widgets, entities and shared with path aliases — a landing page today, but the shape survives a second page.",
            "Sample analytics reports are real charts on Chart.js, loaded as a separate chunk so they cost nothing on the first screen.",
          ],
        },
        {
          kind: "result",
          title: "What was measured and what was fixed",
          body: [
            "Everything below comes from Lighthouse runs on the live site, mobile and desktop profiles.",
            "The HTML took 3.3 s to arrive: the server render called Sanity on every request. The page is now on ISR — served from cache and revalidated in the background, with the CMS out of the critical path.",
            "Accessibility was taken to 100: text colours, list roles in the header, and accessible names matching the visible labels.",
            "The first screen no longer animates two 800×800 blurred blobs on phones — that animation is left to desktop, and only under prefers-reduced-motion: no-preference.",
            "Moving the fonts off fontshare onto our own host was tried and measured: first paint got 0.6 s slower, because the external stylesheet loads asynchronously and does not hold up the paint while a local woff2 lands in the critical path. Reverted.",
            "Layout shift stays at 0 and the main thread is blocked for 0 ms — both on the mobile profile.",
          ],
        },
      ],
    },
    ru: {
      title: "ТендерСтат",
      tagline: "Лендинг сервиса аналитики закупок, который собирается из блоков CMS",
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
          title: "Лендинг, который правит не разработчик",
          body: [
            "Сервис продает аналитику закупок: кто побеждает в нише, как торгуется заказчик, какие цены забирают контракт. На странице должны жить услуги, шаги работы, блок доверия, новости, примеры отчетов с графиками и форма — и заказчик должен менять все это без деплоя.",
            "Значит, каждая секция это не текст, а структура: схема в CMS, тип на фронте и виджет, который ее рисует.",
          ],
        },
        {
          kind: "constraint",
          title: "Контент правит заказчик, а страница должна открываться всегда",
          body: [
            "Все заголовки, карточки и блоки лежат в Sanity, и меняет их заказчик, а не разработчик. Поле могут не заполнить, переименовать или удалить — и верстка, которая рассчитывает на данные, ломается ровно в этот момент.",
            "Второе ограничение — первый экран. На лендинг приходят по рекламной ссылке с телефона: все, что грузится до первой отрисовки, оплачивается недошедшими заявками.",
          ],
        },
        {
          kind: "solution",
          title: "Конструктор страницы вместо верстки по макету",
          body: [
            "Страница это массив блоков в Sanity. Фронт разбирает _type и отдает блок своему виджету; каждый виджет принимает data?: Block | null и падает на статические дефолты — отсутствующий блок деградирует до зашитого текста, а не до пустого экрана.",
            "Studio встроена в /studio, поэтому заказчик правит контент на своем домене. Приложение разложено на widgets, entities и shared с алиасами: сегодня это лендинг, но форма переживет вторую страницу.",
            "Примеры отчетов — настоящие графики на Chart.js, вынесенные в отдельный чанк, так что первому экрану они ничего не стоят.",
          ],
        },
        {
          kind: "result",
          title: "Что померено и исправлено",
          body: [
            "Все, что ниже, снято Lighthouse на живом сайте, в мобильном и десктопном профилях.",
            "HTML отдавался 3.3 секунды: серверный рендер ходил в Sanity на каждый запрос. Страница переведена на ISR — отдается из кеша и перепроверяется в фоне, CMS ушла из критического пути.",
            "Доступность доведена до 100: цвета текста, роли списков в шапке, совпадение доступного имени с видимой подписью.",
            "Первый экран больше не крутит на телефоне анимацию двух размытых пятен 800×800 — она осталась только на десктопе и только при prefers-reduced-motion: no-preference.",
            "Перенос шрифтов с fontshare на свой хост попробован и померен: первая отрисовка стала на 0.6 секунды медленнее, потому что внешний стиль грузится асинхронно и отрисовку не задерживает, а локальный woff2 попадает в критический путь. Откачено.",
            "Сдвиг макета остается нулевым, главный поток заблокирован 0 мс — оба замера на мобильном профиле.",
          ],
        },
      ],
    },
  },
};
