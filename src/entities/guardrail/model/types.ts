/**
 * Чем правило держится. `build` — детерминированная проверка, падает всегда и
 * одинаково. `threshold` — измерение: даёт число, но останавливает, только если
 * у числа есть потолок. `chain` — суждение, и стоит вызовов модели.
 */
export const tierIds = ["build", "threshold", "chain"] as const;

export type TierId = (typeof tierIds)[number];

export const gateIds = ["boundary", "contract", "lint"] as const;

export type GateId = (typeof gateIds)[number];

export const meterIds = ["specs", "size"] as const;

export type MeterId = (typeof meterIds)[number];

/** Порядок несёт смысл: звено видит только то, что пережило предыдущее. */
export const linkIds = ["responsibility", "repeat", "simplicity", "cost"] as const;

export type LinkId = (typeof linkIds)[number];

export type ProjectFile = {
  path: string;
  source: string;
  /** Файл — производная: его собирают из этой схемы, а не пишут руками. */
  generatedFrom?: string;
  /** Строк в файле. Меряет ярус порогов, ворота его не читают. */
  lines?: number;
};

export type Project = ProjectFile[];

export type Gate = {
  id: GateId;
  /** Сообщение — это провал. `undefined` — ворота пропустили. */
  check: (project: Project) => string | undefined;
};

/**
 * Измерение. `ceiling` — потолок, если он в проекте есть; у обоих здешних его
 * нет, и это не недоделка демо, а состояние репозитория.
 */
export type Meter = {
  id: MeterId;
  unit: string;
  ceiling?: number;
  measure: (project: Project) => number;
};

/**
 * Что сказало звено. Одобрять звено не умеет: `silent` — это отсутствие
 * возражения, а не согласие.
 */
export type Objection = {
  link: LinkId;
  /** Записан из настоящего прогона; пусто — звено промолчало. */
  body?: string;
  /** Возражение, которое звено само называет спорным. */
  soft?: true;
};

export const diffIds = [
  "import-up",
  "hand-edit-generated",
  "ratchet-grows",
  "card-fetches",
  "own-default",
  "double-suspense",
  "type-three-ways",
  "slot-from-above",
] as const;

export type DiffId = (typeof diffIds)[number];

export type Diff = {
  id: DiffId;
  /** Ворота, которые обязаны сработать. Пусто — правка доезжает до ярусов выше. */
  caught: GateId[];
  /** Что сказала цепочка, если правка до неё дошла. */
  objections: Objection[];
  files: ProjectFile[];
};

export type Verdict =
  | { tier: "build"; gate: GateId; passed: boolean; message?: string }
  | { tier: "threshold"; meter: MeterId; value: number; unit: string; ceiling?: number }
  | { tier: "chain"; link: LinkId; body?: string; soft?: true };
