import type { CaseRecord } from "@/entities/case";

export const blocksEditor: CaseRecord = {
  slug: "blocks-editor",
  order: 1,
  nda: true,
  demos: ["undo-redo", "canvas-fps"],
  stack: [
    "Vue 3",
    "TypeScript",
    "Pinia",
    "Vite",
    "SVG / DOM engine",
    "WebSocket",
    "Keycloak",
    "Tailwind CSS",
    "Zod",
    "Vitest",
  ],
  links: [],
  content: {
    en: {
      title: "Process Editor",
      tagline: "A low-code canvas where analysts draw an executable business process",
      role: "Frontend engineer — editor core",
      period: "Feb 2026 — present",
      metrics: [
        { value: "40+", label: "operation types", detail: "all reversible through one buffer" },
        { value: "25 → 60", label: "FPS", detail: "canvas with 100+ blocks" },
        { value: "1", label: "request per action", detail: "instead of one per mouse move" },
      ],
      sections: [
        {
          kind: "problem",
          title: "An editor that forgets nothing has to be able to forget on command",
          body: [
            "Analysts assemble a business process out of blocks and the platform turns the diagram into something executable. Every misplaced block is a change to a live artefact.",
            "Undo has to cover the whole editor, not the easy half: moving blocks between diagrams, between pools, in and out of nested subprocesses — over forty operation types, each of which can be composed with the others.",
          ],
        },
        {
          kind: "constraint",
          title: "The canvas is the product, so it cannot stutter",
          body: [
            "A hundred-block diagram is a normal working size, not an edge case. On that canvas the editor sat at roughly 25 FPS: dragging one block repainted the world.",
            "The backend is the source of truth for the process, which means every intermediate state of a drag would otherwise become a write.",
          ],
        },
        {
          kind: "solution",
          title: "One action buffer, one frame budget",
          body: [
            "Actions accumulate in a buffer and collapse before they are sent: the backend receives the result of an interaction, not the trace of it. The same buffer backs manual edits and the AI assistant, so anything the assistant proposes is undone exactly like anything a human did.",
            "For the canvas, the idle repaint loop went away, scene geometry moved out from under framework reactivity, and the frame was restructured so measurement and painting stop interleaving — no layout thrash mid-drag.",
            "Block contents are components mounted over the canvas, built from a description the backend sends. A new block type ships without any hand-written markup on the frontend.",
          ],
        },
        {
          kind: "result",
          title: "60 FPS, and a demo of the mechanism on this site",
          body: [
            "Stable 60 FPS on the sizes that used to crawl, and an undo history that covers the editor rather than a subset of it.",
            "The interesting part is not the client's diagram — it is the mechanism. Both the buffer and the frame budget are rebuilt in the Lab, running in a real Vue island on this page.",
          ],
        },
      ],
    },
    ru: {
      title: "Редактор процессов",
      tagline: "Low-code холст, на котором аналитик рисует исполняемый бизнес-процесс",
      role: "Фронтенд-разработчик — ядро редактора",
      period: "фев 2026 — настоящее время",
      metrics: [
        { value: "40+", label: "типов операций", detail: "все отменяются одним буфером" },
        { value: "25 → 60", label: "FPS", detail: "холст на 100+ блоках" },
        { value: "1", label: "запрос на действие", detail: "вместо одного на движение мыши" },
      ],
      sections: [
        {
          kind: "problem",
          title: "Редактор, который ничего не забывает, обязан забывать по команде",
          body: [
            "Аналитик собирает бизнес-процесс из блоков, платформа превращает схему в исполняемый процесс. Каждый промах мышью — правка живого артефакта.",
            "Отмена должна покрывать весь редактор, а не удобную половину: перенос блоков между схемами, между пулами, внутрь вложенных подпроцессов и обратно — сорок с лишним типов операций, и все они комбинируются друг с другом.",
          ],
        },
        {
          kind: "constraint",
          title: "Холст и есть продукт, поэтому он не имеет права дёргаться",
          body: [
            "Схема на сотню блоков — рабочий размер, а не крайний случай. На ней редактор жил на ~25 FPS: перетаскивание одного блока перерисовывало всё.",
            "Источник правды о процессе — бэкенд, а значит каждое промежуточное состояние перетаскивания иначе превращалось бы в запись.",
          ],
        },
        {
          kind: "solution",
          title: "Один буфер действий, один бюджет кадра",
          body: [
            "Действия копятся в буфере и схлопываются перед отправкой: на бэкенд уезжает результат взаимодействия, а не его след. На этом же буфере работают и ручные правки, и AI-ассистент — всё, что предложил ассистент, отменяется ровно так же, как сделанное руками.",
            "На холсте убран холостой цикл перерисовки, геометрия сцены выведена из-под реактивности фреймворка, а кадр перестроен так, чтобы замеры и отрисовка не чередовались — никакого layout thrash посреди драга.",
            "Содержимое блоков — компоненты поверх холста, собранные по описанию с бэкенда. Новый тип блока выкатывается без ручной вёрстки на фронте.",
          ],
        },
        {
          kind: "result",
          title: "60 FPS и демо самого механизма на этом сайте",
          body: [
            "Стабильные 60 FPS на размерах, где раньше всё ползло, и история отмены, покрывающая редактор целиком, а не его часть.",
            "Интересна не схема клиента, а механизм. И буфер, и бюджет кадра пересобраны в Лаборатории — работают настоящим Vue-островом прямо на этой странице.",
          ],
        },
      ],
    },
  },
};
