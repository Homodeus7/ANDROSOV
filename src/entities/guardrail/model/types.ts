export const gateIds = ["layers", "content", "i18n", "boundary", "budget"] as const;

export type GateId = (typeof gateIds)[number];

/**
 * Чем ворота держатся. `advice` модель может забыть, `hook` срабатывает на
 * этой машине всегда, `build` физически не пропускает нарушение дальше.
 */
export type Level = "advice" | "hook" | "build";

export type ProjectFile = {
  path: string;
  source: string;
  /** Объект кейса, который экспортирует файл контента. */
  record?: unknown;
  /** Килобайт в начальной загрузке. Отдельный чанк не считается. */
  initialKb?: number;
};

export type Project = ProjectFile[];

export type Gate = {
  id: GateId;
  level: Level;
  /** Сообщение — это провал. `undefined` — ворота пропустили. */
  check: (project: Project) => string | undefined;
};

export const diffIds = [
  "helper-upwards",
  "english-only",
  "missing-ru-string",
  "model-in-resolver",
  "heavy-dependency",
  "narrating-comment",
  "honest",
] as const;

export type DiffId = (typeof diffIds)[number];

export type Diff = {
  id: DiffId;
  /** Ворота, которые обязаны на ней сработать. Пусто — правка доезжает. */
  caught: GateId[];
  /** Нарушает только уровень совета — и потому проходит. */
  advice?: true;
  files: ProjectFile[];
};

export type Verdict = { gate: GateId; level: Level; passed: boolean; message?: string };
