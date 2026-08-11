import type { Diff } from "./types";

/**
 * Правки, которые может выдать агент по фронтенду FoodIQ. Ни одна не выдумана:
 * каждая метит в место, которое в этом репозитории действительно так устроено.
 * Возражения цепочки записаны из настоящего прогона четырёх ревьюеров.
 */
export const diffs: Diff[] = [
  {
    id: "import-up",
    caught: ["boundary"],
    objections: [],
    files: [
      {
        path: "src/features/day-data/create-meal/ui/create-meal-dialog.tsx",
        source: `import { ResponsiveSheet } from "@/shared/ui";\nimport { CreateMealTabs } from "@/widgets/create-meal-tabs";\nimport { CreateProductForm } from "@/features/product/create-product";`,
        lines: 156,
      },
    ],
  },
  {
    id: "hand-edit-generated",
    caught: ["contract"],
    objections: [],
    files: [
      {
        path: "src/shared/api/generated/nutriAIAPI.ts",
        source: `export const useGetUserGoals = () => { /* generated */ };\nexport const useGetBodyWeight = () => { /* generated */ };\nexport const useGetWeeklyBreakdown = () => { /* hand-written */ };`,
        generatedFrom: "src/shared/api/schema.yml",
      },
    ],
  },
  {
    id: "ratchet-grows",
    caught: ["lint"],
    objections: [],
    files: [
      {
        path: "lint-baseline.json",
        source: JSON.stringify({
          "boundaries/element-types": 5,
          "boundaries/entry-point": 30,
        }),
      },
    ],
  },
  {
    id: "card-fetches",
    caught: [],
    objections: [
      {
        link: "responsibility",
        body: `src/features/goals/update-goals/ui/body-card.tsx:52
Причин меняться: карточка сама ходит за пользователем (\`useGetAuthMe({ query: { staleTime: Infinity } })\`) и сама держит правило «на сервере год рождения есть, а поле пусто — покажи подсказку» (105). Значения формы при этом приходят из \`useGoalsFormContext\` (49), то есть про то же самое загруженное состояние знают двое.
Чем обойдётся: правило про соотношение серверного и введённого значения живёт в компоненте раскладки, а не там, где форма наполняется. При смене источника или формы дефолтов (например, год рождения начнёт приходить не из \`authMe\`) править придётся и модель формы, и разметку поля; расхождение между ними ничем не проверяется — тест подставляет \`user\` отдельным моком \`@/shared/api\` (\`body-card.test.tsx:25-28\`), независимо от того, что отдаёт контекст.`,
      },
    ],
    files: [
      {
        path: "src/features/goals/update-goals/ui/body-card.tsx",
        source: `import { useGetAuthMe } from "@/shared/api";\nimport { useGoalsFormContext } from "../model/goals-form-context";\nimport { useLatestWeight } from "@/entities/body-weight";`,
        lines: 205,
      },
    ],
  },
  {
    id: "own-default",
    caught: [],
    objections: [
      {
        link: "repeat",
        body: `src/features/goals/update-goals/model/use-goals-form.ts:193
Уже есть: src/views/diary/model/use-calorie-data.ts:26
Разошлись: да. Одно правило «цель по калориям, а если её нет — 2500» написано четырьмя способами: \`|| DEFAULT_DAILY_KCAL\` (:193), \`?? DEFAULT_DAILY_KCAL\` (:163), \`userGoal && userGoal > 0 ? userGoal : DEFAULT_CALORIE_GOAL\` (use-calorie-data.ts:26) и тот же тернарник с \`DEFAULT_DAILY_KCAL\` в src/widgets/daily-impact/model/use-daily-budget.ts:26-30. Дневник при этом держит собственный литерал \`DEFAULT_CALORIE_GOAL = 2500\` (use-calorie-data.ts:6) вместо экспортируемого \`DEFAULT_DAILY_KCAL\` (src/features/goals/update-goals/model/presets.ts:17).
Чем обойдётся: смена дефолта в \`presets.ts\` подвинет форму целей, плитки дневного бюджета и граммы в превью — но не кольцо калорий на дневнике. Новый аккаунт до первого сохранения увидит на двух экранах разную цель, и ничего не упадёт.`,
      },
    ],
    files: [
      {
        path: "src/views/diary/model/use-calorie-data.ts",
        source: `import { useGoals } from "@/entities/goals";\n\nconst DEFAULT_CALORIE_GOAL = 2500;`,
        lines: 71,
      },
    ],
  },
  {
    id: "double-suspense",
    caught: [],
    objections: [
      {
        link: "simplicity",
        body: `src/features/day-data/create-meal/ui/create-meal-tabs.tsx:118,132
Сейчас: \`<FoodProductsTab>\` и \`<RecipesToMealTab>\` обёрнуты в \`<Suspense fallback={<TabSkeleton />}>\`, хотя обе объявлены через \`dynamic(..., { loading: () => <TabSkeleton /> })\`.
Проще: убрать оба \`<Suspense>\` — оставить лениво загружаемый компонент прямо внутри \`CreateMealErrorBoundary\`. Тогда \`Suspense\` в файле не импортируется вовсе.
Поведение не меняется потому что: в App Router \`next/dynamic\` алиасится на \`next/dist/api/app-dynamic\` (\`node_modules/next/dist/build/create-compiler-aliases.js:227\`), а \`lazy-dynamic/loadable.js\` вычисляет \`hasSuspenseBoundary = !opts.ssr || !!opts.loading\` и, когда \`loading\` задан, сам оборачивает компонент в \`React.Suspense\` с этим же \`loading\` в качестве fallback. То есть внутренняя граница уже есть, она вложена во внешнюю и перехватывает всё первой. Первый рендер вкладки: чанк не загружен → срабатывает внутренняя граница, на экране тот же \`<TabSkeleton />\`. Любое приостановление внутри уже загруженной вкладки тоже сидит ниже внутренней границы, до внешней не доходит. Для \`startTabTransition\` ближайшая граница в обоих вариантах одна и та же — внутренняя, так что задержка переключения вкладки не меняется. Ошибка загрузки чанка по-прежнему уходит в \`CreateMealErrorBoundary\`, он снаружи в обоих вариантах.`,
      },
    ],
    files: [
      {
        path: "src/features/day-data/create-meal/ui/create-meal-tabs.tsx",
        source: `import { AiChatView } from "@/features/ai-parse";\nimport { useAiInput } from "../model/ai-input.store";\nimport { CreateMealErrorBoundary } from "./create-meal-error-boundary";`,
        lines: 171,
      },
    ],
  },
  {
    id: "type-three-ways",
    caught: [],
    objections: [
      {
        link: "cost",
        body: `src/shared/lib/meal-item.ts
Цена: +23 строки в \`shared/lib\` ради одного \`Pick<FoodItem, …>\` из 10 полей, плюс две транзитные реэкспорт-точки: \`entities/meal/model/merge-items.ts\` держит \`export type { MealItemPreview }\`, а \`entities/meal/index.ts\` реэкспортирует его третий раз.
За что платим потом: три легальных пути импорта одного типа. Тот, кто добавит поле в превью, найдёт по grep три места и не поймёт, какое каноническое; тот, кто будет удалять \`entities/meal\`, потянет за собой \`create-meal\`, который на самом деле зависит только от \`shared\`.`,
      },
    ],
    files: [
      {
        path: "src/shared/lib/meal-item.ts",
        source: `import type { FoodItem } from "@/shared/api";\n\nexport type MealItemPreview = Pick<FoodItem, "id" | "name" | "kcal">;`,
        lines: 23,
      },
    ],
  },
  {
    id: "slot-from-above",
    caught: [],
    objections: [],
    files: [
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
    ],
  },
];
