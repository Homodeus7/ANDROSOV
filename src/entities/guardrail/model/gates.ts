import type { Gate, Meter, Project, ProjectFile } from "./types";

/** Ярусы FSD сверху вниз, как в `boundaries/elements` конфига репозитория. */
const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"] as const;

type Layer = (typeof LAYERS)[number];

/**
 * `ai-parse` склеивает три сущности и не знает ни одной фичи: он между
 * ярусами, а такого яруса в FSD нет. Единственное именованное исключение.
 */
const EXCEPTION = "ai-parse";

const LAYER_OF = /^src\/(app|views|widgets|features|entities|shared)\//;

const rank = (layer: Layer): number => LAYERS.indexOf(layer);

const layerOf = (path: string): Layer | undefined =>
  LAYER_OF.exec(path)?.[1] as Layer | undefined;

const sliceOf = (path: string): string | undefined => path.split("/")[2];

const imports = (file: ProjectFile): string[] =>
  [...file.source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]!);

const read = (project: Project, path: string): ProjectFile | undefined =>
  project.find((file) => file.path === path);

function checkBoundary(project: Project): string | undefined {
  for (const file of project) {
    const from = layerOf(file.path);
    if (!from) continue;

    for (const target of imports(file)) {
      const alias = /^@\/(app|views|widgets|features|entities|shared)\/([^/"]+)/.exec(target);
      if (!alias) continue;

      const to = alias[1] as Layer;
      const slice = alias[2]!;

      if (rank(to) < rank(from)) {
        return `${file.path} imports upwards: ${from} → ${to}.`;
      }

      // У `shared` публичного API нет и сегменты зовут друг друга напрямую:
      // правило соседства действует от `entities` и выше
      if (from === "shared") continue;

      if (to === from && slice !== sliceOf(file.path) && slice !== EXCEPTION) {
        return `${file.path} imports a sibling ${from.slice(0, -1)} (${slice}).`;
      }
    }
  }

  return undefined;
}

/**
 * Клиент API — производная от схемы, а не источник правды. Ворота ловят ровно
 * то, что в CI ловит `npx orval && git diff --exit-code`: правку руками.
 */
function checkContract(project: Project): string | undefined {
  for (const file of project) {
    if (!file.generatedFrom) continue;

    const schema = read(project, file.generatedFrom);
    if (!schema) return `${file.generatedFrom} is missing.`;

    const declared = (JSON.parse(schema.source) as { operations: string[] }).operations;
    const exported = [...file.source.matchAll(/export const (\w+)/g)].map((match) => match[1]!);

    const stray = exported.find(
      (name) => !declared.some((operation) => name.toLowerCase().includes(operation.toLowerCase())),
    );

    if (stray) {
      return `${file.path} is generated, but ${stray} is not in ${file.generatedFrom}.`;
    }
  }

  return undefined;
}

/** Долг, записанный в базу на текущем HEAD. Правка сравнивается с ним. */
const BASELINE_AT_HEAD: Record<string, number> = {
  "boundaries/element-types": 2,
  "boundaries/entry-point": 30,
};

/** Храповик: долг по линту не обязан быть нулём, но не имеет права расти. */
function checkLint(project: Project): string | undefined {
  const ci = read(project, ".github/workflows/ci.yml");
  if (!ci) return "The workflow is missing.";

  // Не `\b`: после `lint` в `lint:ratchet` стоит двоеточие, и граница слова там есть
  if (/run:\s*npm run lint(?![:\w-])/.test(ci.source)) {
    return "CI runs `npm run lint`, which carries --fix and rewrites files instead of failing.";
  }

  if (!/npm run lint:ratchet/.test(ci.source)) return "CI does not run the ratchet.";

  const baseline = read(project, "lint-baseline.json");
  if (!baseline) return "lint-baseline.json is missing: the ratchet has nothing to hold.";

  const allowed = JSON.parse(baseline.source) as Record<string, number>;

  for (const [rule, count] of Object.entries(allowed)) {
    if (count > (BASELINE_AT_HEAD[rule] ?? 0)) {
      return `${rule}: debt grew from ${BASELINE_AT_HEAD[rule] ?? 0} to ${count}.`;
    }
  }

  return undefined;
}

export const gates: Gate[] = [
  { id: "boundary", check: checkBoundary },
  { id: "contract", check: checkContract },
  { id: "lint", check: checkLint },
];

const TESTED_DIRS = [/^src\/shared\/lib\//, /^src\/[^/]+\/[^/]+\/model\//];

const carriesLogic = (file: ProjectFile): boolean =>
  !/\.test\.tsx?$/.test(file.path) &&
  TESTED_DIRS.some((dir) => dir.test(file.path)) &&
  /export (function|const)/.test(file.source);

function countUntested(project: Project): number {
  return project.filter((file) => {
    if (!carriesLogic(file)) return false;

    const base = file.path.replace(/\.tsx?$/, "");
    return !read(project, `${base}.test.ts`) && !read(project, `${base}.test.tsx`);
  }).length;
}

/** Строки самого большого слайса: размер меряют там, где он растёт. */
function largestSlice(project: Project): number {
  const totals = new Map<string, number>();

  for (const file of project) {
    const layer = layerOf(file.path);
    if (!layer || layer === "shared") continue;

    const key = `${layer}/${sliceOf(file.path)}`;
    totals.set(key, (totals.get(key) ?? 0) + (file.lines ?? 0));
  }

  return Math.max(0, ...totals.values());
}

/**
 * Оба измерения без потолка — так в репозитории и есть. Названная цифра без
 * порога честнее, чем порог, взятый с потолка, но и остановить она не может.
 */
export const meters: Meter[] = [
  { id: "specs", unit: "files", measure: countUntested },
  { id: "size", unit: "lines", measure: largestSlice },
];
