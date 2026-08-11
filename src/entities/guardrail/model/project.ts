import type { Project } from "./types";

/**
 * Срез фронтенда FoodIQ. Файлы сокращены до того, что читают ворота: импорты,
 * происхождение сгенерированного клиента, шаги CI и число строк. Числа строк —
 * настоящие, слои — те же, что в `eslint.config.mjs` репозитория.
 */
export const project: Project = [
  {
    // Два оставшихся нарушения слоёв живут не здесь, а строкой в
    // `lint-baseline.json`: храповик держит долг названным и не даёт ему расти
    path: "src/features/day-data/create-meal/ui/create-meal-dialog.tsx",
    source: `import { ResponsiveSheet } from "@/shared/ui";\nimport { CreateMealTabs } from "./create-meal-tabs";`,
    lines: 153,
  },
  {
    path: "src/features/day-data/create-meal/ui/create-meal-tabs.tsx",
    source: `import { AiChatView } from "@/features/ai-parse";\nimport { useAiInput } from "../model/ai-input.store";\nimport { CreateMealErrorBoundary } from "./create-meal-error-boundary";`,
    lines: 144,
  },
  {
    path: "src/features/day-data/create-meal/model/use-create-meal-dialog.ts",
    source: `import { useAiMealFlow } from "@/features/ai-parse";\nimport { useCreateMeal } from "./use-create-meal";`,
    lines: 176,
  },
  { path: "src/features/day-data/create-meal/model/use-create-meal.test.tsx", source: `` },
  {
    // Склеивает три сущности и не знает ни одной фичи: он между ярусами, и это
    // единственное именованное исключение в конфиге границ
    path: "src/features/ai-parse/model/use-ai-draft.ts",
    source: `import { useAuth } from "@/entities/auth";\nimport { useBodyWeightUnit } from "@/entities/preferences";\nimport { useProductSearch } from "@/entities/product";`,
    lines: 336,
  },
  {
    path: "src/entities/goals/model/use-goals.ts",
    source: `import { useGetUserGoals } from "@/shared/api";\n\nexport function useGoals() { /* … */ }`,
    lines: 9,
  },
  {
    path: "src/features/goals/update-goals/ui/body-card.tsx",
    source: `import { useGoals } from "@/entities/goals";\nimport { useLatestWeight } from "@/entities/body-weight";`,
    lines: 205,
  },
  {
    path: "src/views/settings/ui/goals-section.tsx",
    source: `import { UpdateGoalsForm } from "@/features/goals";\nimport { LogWeightSheet } from "@/features/body-weight";`,
    lines: 80,
  },
  {
    path: "src/entities/body-weight/model/use-latest-weight.ts",
    source: `import { useGetBodyWeight } from "@/shared/api";\n\nexport function useLatestWeight() { /* … */ }`,
    lines: 14,
  },
  {
    path: "src/shared/lib/body-weight.ts",
    source: `export function kgToUnit(kg: number, unit: Unit): number { /* … */ }\n\nexport function unitToKg(value: number, unit: Unit): number { /* … */ }`,
    lines: 59,
  },
  { path: "src/shared/lib/body-weight.test.ts", source: `` },
  {
    // Теста рядом нет — так в репозитории и есть у шестнадцати модулей `lib`,
    // и ярус порогов это называет, не останавливая
    path: "src/shared/lib/date.ts",
    source: `export function getTodayDate(): string { /* … */ }`,
    lines: 64,
  },
  {
    path: "src/shared/api/schema.yml",
    source: JSON.stringify({ operations: ["getUserGoals", "getBodyWeight"] }, null, 2),
  },
  {
    // Производная от schema.yml: orval стирает каталог и пересобирает целиком
    path: "src/shared/api/generated/nutriAIAPI.ts",
    source: `export const useGetUserGoals = () => { /* generated */ };\nexport const useGetBodyWeight = () => { /* generated */ };`,
    generatedFrom: "src/shared/api/schema.yml",
  },
  {
    path: "lint-baseline.json",
    source: JSON.stringify({ "boundaries/element-types": 2, "boundaries/entry-point": 30 }),
  },
  {
    path: ".github/workflows/ci.yml",
    // Не `npm run lint`: тот скрипт несёт --fix и тихо переписал бы файлы
    source: `      - name: Границы слоёв и храповик\n        run: npm run lint:ratchet\n\n      - name: Типы\n        run: npm run typecheck\n\n      - name: Клиент API соответствует schema.yml\n        run: npx orval && git diff --exit-code -- src/shared/api/generated`,
  },
];
