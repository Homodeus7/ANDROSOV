import type { Diff } from "./types";

/**
 * Правки, которые может выдать агент. Ни одна не выдумана до неузнаваемости:
 * это ровно те четыре класса ошибок, ради которых ворота и ставились, плюс
 * одна, на которую ворот нет, и одна честная.
 */
export const diffs: Diff[] = [
  {
    id: "helper-upwards",
    caught: ["layers"],
    files: [
      {
        path: "src/entities/case/lib/format.ts",
        source: `import { DemoSlot } from "@/widgets/demos";\n\nexport const withDemo = (slug: string) => DemoSlot;`,
        initialKb: 1,
      },
    ],
  },
  {
    id: "english-only",
    caught: ["content"],
    files: [
      {
        path: "src/content/cases/agent-harness.ts",
        source: `import type { CaseRecord } from "@/entities/case";\n\nexport const agentHarness: CaseRecord = { /* ru: перевести позже */ };`,
        record: {
          slug: "agent-harness",
          order: 5,
          nda: false,
          stack: ["Claude Code"],
          links: [],
          content: {
            en: {
              title: "The harness around the agent",
              tagline: "An agent is given a build that fails",
              role: "Frontend engineer",
              period: "2025",
              metrics: [],
              sections: [{ kind: "problem", title: "Problem", body: ["Plausible code."] }],
            },
          },
        },
      },
    ],
  },
  {
    id: "missing-ru-string",
    caught: ["i18n"],
    files: [
      {
        path: "messages/en.json",
        source: JSON.stringify(
          { lab: { title: "Lab", lead: "Every demo runs.", empty: "Nothing here yet." } },
          null,
          2,
        ),
      },
    ],
  },
  {
    id: "model-in-resolver",
    caught: ["boundary"],
    files: [
      {
        path: "modules/reference-foods/application/resolve-reference.service.ts",
        source: `import { Injectable } from '@nestjs/common';\nimport OpenAI from 'openai';\nimport { pickRepresentative } from '../domain/concept-representative';`,
      },
    ],
  },
  {
    id: "heavy-dependency",
    caught: ["budget"],
    files: [
      {
        path: "src/app/[locale]/layout.tsx",
        source: `import { format } from "date-fns";\nimport { routing } from "@/shared/i18n";\nimport { SiteHeader } from "@/widgets/site-header";`,
        initialKb: 276,
      },
    ],
  },
  {
    id: "narrating-comment",
    caught: [],
    advice: true,
    files: [
      {
        path: "src/entities/case/ui/case-card.tsx",
        source: `import { Link } from "@/shared/i18n";\nimport { cn } from "@/shared/lib";\n\n// Компонент карточки кейса. Принимает кейс и рендерит ссылку на него.\n// Здесь добавил объединение классов через cn.`,
        initialKb: 3,
      },
    ],
  },
  {
    id: "honest",
    caught: [],
    files: [
      {
        path: "src/shared/ui/section-label.tsx",
        source: `import { cn } from "@/shared/lib";\n\nexport function SectionLabel({ index, total, children }) { /* … */ }`,
        initialKb: 2,
      },
      {
        path: "src/shared/ui/index.ts",
        source: `export { Container } from "./container";\nexport { Marquee } from "./marquee";\nexport { SectionLabel } from "./section-label";`,
        initialKb: 6,
      },
    ],
  },
];
