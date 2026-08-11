import type { Project } from "./types";

/**
 * Игрушечное дерево, на котором работают ворота. Файлы сокращены до того, что
 * ворота читают: импорты, ключи локалей, объект кейса и вес чанка.
 */
export const project: Project = [
  {
    path: "src/entities/case/index.ts",
    source: `export { caseSchema, demoIds } from "./model/schema";\nexport { CaseCard } from "./ui/case-card";`,
    initialKb: 4,
  },
  {
    path: "src/entities/case/ui/case-card.tsx",
    source: `import { Link } from "@/shared/i18n";\nimport { cn } from "@/shared/lib";`,
    initialKb: 3,
  },
  {
    path: "src/views/lab/ui/lab-page.tsx",
    source: `import { demoIds } from "@/entities/case";\nimport { Container } from "@/shared/ui";\nimport { DemoSlot } from "@/widgets/demos";`,
    initialKb: 5,
  },
  {
    path: "src/shared/ui/index.ts",
    source: `export { Container } from "./container";\nexport { Marquee } from "./marquee";`,
    initialKb: 6,
  },
  {
    path: "src/widgets/demos/index.ts",
    source: `export { DemoSlot } from "./ui/demo-slot";`,
    initialKb: 8,
  },
  {
    path: "src/app/[locale]/layout.tsx",
    source: `import { routing } from "@/shared/i18n";\nimport { SiteHeader } from "@/widgets/site-header";`,
    initialKb: 202,
  },
  {
    path: "messages/en.json",
    source: JSON.stringify({ lab: { title: "Lab", lead: "Every demo runs." } }, null, 2),
  },
  {
    path: "messages/ru.json",
    source: JSON.stringify(
      { lab: { title: "Лаборатория", lead: "Каждое демо работает." } },
      null,
      2,
    ),
  },
  {
    path: "src/content/cases/foodiq.ts",
    source: `import type { CaseRecord } from "@/entities/case";\n\nexport const foodiq: CaseRecord = { /* … */ };`,
    record: {
      slug: "foodiq",
      order: 0,
      nda: false,
      stack: ["Next.js"],
      links: [],
      content: {
        en: {
          title: "FoodIQ",
          tagline: "A food tracker that refuses to guess",
          role: "Frontend engineer",
          period: "2025",
          metrics: [],
          sections: [{ kind: "problem", title: "Problem", body: ["A model must not count."] }],
        },
        ru: {
          title: "FoodIQ",
          tagline: "Трекер еды, который отказывается угадывать",
          role: "Фронтенд-разработчик",
          period: "2025",
          metrics: [],
          sections: [{ kind: "problem", title: "Задача", body: ["Модель не считает."] }],
        },
      },
    },
  },
  {
    path: "modules/reference-foods/application/resolve-reference.service.ts",
    source: `import { Injectable } from '@nestjs/common';\nimport { pickRepresentative } from '../domain/concept-representative';`,
  },
  {
    path: "modules/reference-foods/domain/concept-representative.ts",
    source: `import { CONCEPT_GENERICNESS_RANK } from './reference-dataset';\n\nexport function pickRepresentative(candidates, eatenCooked = false) { /* … */ }`,
  },
];
