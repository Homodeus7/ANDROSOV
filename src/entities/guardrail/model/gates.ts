import { caseSchema } from "@/entities/case";
import { keyPaths } from "@/shared/lib";
import type { Gate, Project, ProjectFile } from "./types";

/** Те же слои и в том же порядке, что в `eslint.config.mjs`. Сверено тестом. */
export const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

/** Потолок начального JS из `e2e/budget.spec.ts`. */
export const INITIAL_JS_KB = 260;

/** Регулярки из `reference-foods.boundaries.spec.ts`, дословно. */
const FORBIDDEN = [/from\s+'openai'/, /from\s+'@anthropic-ai\//, /from\s+'[^']*\/ai\//];

const SLICE_LAYERS = LAYERS.filter((layer) => layer !== "app").join("|");
const DEEP_IMPORT = new RegExp(`^@/(?:${SLICE_LAYERS})/[^/]+/.+`);
const STYLES = /^@\/shared\/styles\//;

const imports = (file: ProjectFile): string[] =>
  [...file.source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]!);

const layerOf = (path: string): string | undefined =>
  LAYERS.find((layer) => path.startsWith(`src/${layer}/`));

function checkLayers(project: Project): string | undefined {
  for (const file of project) {
    const layer = layerOf(file.path);
    if (!layer) continue;

    const above = LAYERS.slice(0, LAYERS.indexOf(layer));

    for (const target of imports(file)) {
      if (DEEP_IMPORT.test(target) && !STYLES.test(target)) {
        return "FSD: import a slice through its public API (index.ts) only.";
      }

      const upper = above.find(
        (name) => target === `@/${name}` || target.startsWith(`@/${name}/`),
      );

      if (upper) {
        return `FSD: "${layer}" may not import from "${above.join('", "')}" — imports go downwards only.`;
      }
    }
  }

  return undefined;
}

function checkContent(project: Project): string | undefined {
  for (const file of project) {
    if (file.record === undefined) continue;

    const result = caseSchema.safeParse(file.record);
    if (!result.success) {
      const issue = result.error.issues[0];
      return `Invalid case: ${issue?.path.join(".")} — ${issue?.message}`;
    }
  }

  return undefined;
}

function isBlank(value: unknown): boolean {
  if (typeof value === "string") return value.trim() === "";
  if (value === null || typeof value !== "object") return false;
  return Object.values(value).some(isBlank);
}

function checkI18n(project: Project): string | undefined {
  const read = (name: string) => {
    const file = project.find((item) => item.path === `messages/${name}.json`);
    return file ? (JSON.parse(file.source) as unknown) : undefined;
  };

  const locales = { en: read("en"), ru: read("ru") };
  if (locales.en === undefined || locales.ru === undefined) return "A locale file is missing.";

  const en = keyPaths(locales.en);
  const ru = keyPaths(locales.ru);

  const missing = en.filter((path) => !ru.includes(path));
  if (missing.length > 0) return `Locale "ru" is missing ${missing.join(", ")}.`;

  const extra = ru.filter((path) => !en.includes(path));
  if (extra.length > 0) return `Locale "en" is missing ${extra.join(", ")}.`;

  for (const [locale, messages] of Object.entries(locales)) {
    if (isBlank(messages)) return `Locale "${locale}" has an empty string.`;
  }

  return undefined;
}

function checkBoundary(project: Project): string | undefined {
  for (const file of project) {
    if (!file.path.startsWith("modules/reference-foods/")) continue;

    if (FORBIDDEN.some((pattern) => pattern.test(file.source))) {
      return `${file.path} reaches a language model from the request path.`;
    }

    const sibling = imports(file).find(
      (target) => target.startsWith("../../") && !target.includes("reference-foods"),
    );

    if (sibling) return `${file.path} imports a sibling module (${sibling}).`;
  }

  return undefined;
}

function checkBudget(project: Project): string | undefined {
  const kilobytes = project.reduce((total, file) => total + (file.initialKb ?? 0), 0);
  return kilobytes < INITIAL_JS_KB
    ? undefined
    : `${kilobytes} KB of javascript before load, over the ${INITIAL_JS_KB} KB budget.`;
}

/**
 * Уровень — не украшение: он говорит, что случится с нарушением. Все пять
 * ворот здесь `build`, потому что всё, что дороже опечатки, живёт там.
 */
export const gates: Gate[] = [
  { id: "layers", level: "build", check: checkLayers },
  { id: "content", level: "build", check: checkContent },
  { id: "i18n", level: "build", check: checkI18n },
  { id: "boundary", level: "build", check: checkBoundary },
  { id: "budget", level: "build", check: checkBudget },
];
