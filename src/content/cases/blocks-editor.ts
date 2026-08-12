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
          title: "Undo Should Work Everywhere",
          body: [
            "An analyst builds a business process from blocks, and the platform turns the diagram into an executable workflow. Every action changes the live document.",
            "That means undo has to work across the entire editor: moving blocks between diagrams and pools, nested subprocesses, and moving them back — more than 40 operation types that can be combined in any way.",
          ],
        },
        {
          kind: "constraint",
          title: "The Canvas Is the Product",
          body: [
            "A hundred-block diagram is a normal working scenario, not an edge case. At that scale, the editor ran at around 25 FPS: dragging a single block triggered a full canvas re-render.",
            "The backend was the source of truth, so every intermediate drag state could not be persisted as a separate record.",
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
          title: "Отмена должна работать везде",
          body: [
            "Аналитик собирает бизнес-процесс из блоков, а платформа превращает схему в исполняемый процесс. Любое действие меняет живой документ.",
            "Поэтому отмена должна работать для всего редактора: перенос блоков между схемами и пулами, вложенные подпроцессы и обратные перемещения — больше 40 типов операций, которые можно комбинировать между собой.",
          ],
        },
        {
          kind: "constraint",
          title: "Холст — это и есть продукт",
          body: [
            "Схема на сотню блоков — обычный рабочий сценарий, а не крайний случай. При таком размере редактор держал около 25 FPS: перетаскивание одного блока перерисовывало весь холст.",
            "Источник правды — бэкенд, поэтому каждое промежуточное состояние перетаскивания нельзя было сохранять как отдельную запись.",
          ],
        },
        {
          kind: "solution",
          title: "Один буфер действий, один бюджет кадра",
          body: [
            "Действия собираются в буфер и отправляются на бэкенд уже итоговым изменением, а не каждым промежуточным шагом.",
            "На холсте убрали лишние перерисовки и реактивность геометрии. Замеры и отрисовка разделены, поэтому во время drag нет лишних перерасчётов layout.",
            "Содержимое блоков собирается из конфигурации, которую отдает бэкенд. Новый тип блока можно добавить без ручной верстки на фронтенде.",
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
