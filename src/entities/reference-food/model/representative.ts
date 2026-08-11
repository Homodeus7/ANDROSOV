import {
  declaresUncooked,
  FOR_INFANTS,
  hasUnspecifiedAspect,
  IMITATION,
  isRaw,
  isUnqualified,
  PROCESSED_FORM,
  qualifierCount,
  type Reading,
} from "./segments";
import type { ReferenceRow } from "./types";

export type Ranking = { eatenCooked: boolean; reading: Reading };

export const ruleIds = [
  "standIn",
  "unqualified",
  "dataset",
  "processing",
  "aspect",
  "qualifiers",
  "measured",
  "id",
] as const;

export type RuleId = (typeof ruleIds)[number];

/**
 * Какой датасет лучше отвечает на «просто молоко» — намеренно обратный порядок
 * к тому, каким свежее лабораторное измерение: FNDDS собран из того, как люди
 * сообщают о еде, и только у него есть строки `NFS`.
 */
const GENERICNESS: Record<ReferenceRow["dataset"], number> = { "usda-fndds": 0, "usda-sr": 1 };

type Rule = { id: RuleId; rank: (row: ReferenceRow, ranking: Ranking) => number | string };

/**
 * Лестница целиком, одним списком: по нему и сортируется, и объясняется. Два
 * описания одного порядка разошлись бы — и панель печатала бы не то правило,
 * которым выбрана строка.
 */
export const rules: Rule[] = [
  // Выше всего: заменитель никогда не является едой, как бы генерично ни читался
  {
    id: "standIn",
    rank: (row) => (IMITATION.test(row.name) || FOR_INFANTS.test(row.name) ? 1 : 0),
  },
  { id: "unqualified", rank: (row, { reading }) => (isUnqualified(row.name, reading) ? 0 : 1) },
  { id: "dataset", rank: (row) => GENERICNESS[row.dataset] },
  {
    // Выше числа уточнений, а не ниже: `Cabbage, green, raw` несёт два уточнения
    // и всё равно ближе к капусте, чем однословная `Cabbage, pickled`
    id: "processing",
    rank: (row, { eatenCooked, reading }) => {
      if (eatenCooked) {
        if (declaresUncooked(row.name, reading)) return 3;
        return PROCESSED_FORM.test(row.name) ? 2 : 1;
      }
      if (isRaw(row.name, reading)) return 0;
      return PROCESSED_FORM.test(row.name) ? 2 : 1;
    },
  },
  {
    // Неопределённый аспект расписан словами и стоит запятых: `Chicken, NS as to
    // part and cooking method, NS as to skin eaten` — это курица, а не её часть
    id: "aspect",
    rank: (row, { reading }) => (hasUnspecifiedAspect(row.name, reading) ? 0 : 1),
  },
  // Имена USDA сужаются слева направо запятыми: меньше шагов — ближе к еде
  { id: "qualifiers", rank: (row) => qualifierCount(row.name) },
  { id: "measured", rank: (row) => -row.measuredCount },
  // Порядок кодовых единиц: `localeCompare` отвечает по версии ICU, а не по данным
  { id: "id", rank: (row) => row.externalId },
];

const compareBy = (rule: Rule, a: ReferenceRow, b: ReferenceRow, ranking: Ranking): number => {
  const left = rule.rank(a, ranking);
  const right = rule.rank(b, ranking);
  if (left === right) return 0;
  return left < right ? -1 : 1;
};

export const compareRows = (a: ReferenceRow, b: ReferenceRow, ranking: Ranking): number => {
  for (const rule of rules) {
    const result = compareBy(rule, a, b, ranking);
    if (result !== 0) return result;
  }
  return 0;
};

export function rankRows(rows: readonly ReferenceRow[], ranking: Ranking): ReferenceRow[] {
  return [...rows].sort((a, b) => compareRows(a, b, ranking));
}

export function pickRepresentative(
  rows: readonly ReferenceRow[],
  ranking: Ranking,
): ReferenceRow | undefined {
  return rankRows(rows, ranking)[0];
}

/** Правило, на котором две строки разошлись. Ниже него сравнение не доходит. */
export function divergingRule(
  a: ReferenceRow,
  b: ReferenceRow,
  ranking: Ranking,
): RuleId | undefined {
  return rules.find((rule) => compareBy(rule, a, b, ranking) !== 0)?.id;
}

export type LadderStep = { id: RuleId; survivors: ReferenceRow[]; dropped: ReferenceRow[] };

/**
 * Как отбор доходит до ответа: на каждой ступени остаются строки, лучшие по
 * ней среди доживших. Видно не ответ, а решение.
 */
export function ladder(rows: readonly ReferenceRow[], ranking: Ranking): LadderStep[] {
  let survivors = [...rows];

  return rules.map((rule) => {
    const kept = survivors.filter(
      (row) => !survivors.some((other) => compareBy(rule, other, row, ranking) < 0),
    );
    const dropped = survivors.filter((row) => !kept.includes(row));
    survivors = kept;
    return { id: rule.id, survivors: kept, dropped };
  });
}
