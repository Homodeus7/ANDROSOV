import { rawConcepts, rawReferenceRows } from "@/content/reference-foods";
import { conceptSchema, rowSchema, type FoodConcept, type ReferenceRow } from "../model/types";

function validate() {
  const concepts = rawConcepts.map((record) => {
    const result = conceptSchema.safeParse(record);
    if (!result.success) {
      throw new Error(`Invalid concept: ${JSON.stringify(result.error.issues, null, 2)}`);
    }
    return result.data;
  });

  const slugs = new Set(concepts.map((concept) => concept.slug));
  const rows = rawReferenceRows.map((record) => {
    const result = rowSchema.safeParse(record);
    if (!result.success) {
      throw new Error(`Invalid reference row: ${JSON.stringify(result.error.issues, null, 2)}`);
    }
    if (!slugs.has(result.data.concept)) {
      throw new Error(`Row "${result.data.name}" belongs to no concept`);
    }
    return result.data;
  });

  for (const concept of concepts) {
    const family = rows.filter((row) => row.concept === concept.slug);
    // Одна строка — не выбор, и демо на такой семье нечего показывать
    if (family.length < 2)
      throw new Error(`Concept "${concept.slug}" has ${family.length} rows`);
  }

  return { concepts, rows };
}

const corpus = validate();

export const foodConcepts: FoodConcept[] = corpus.concepts;
export const referenceRows: ReferenceRow[] = corpus.rows;

export const rowsOf = (slug: string): ReferenceRow[] =>
  referenceRows.filter((row) => row.concept === slug);

/** Поиск концепта по имени на любой из локалей: подсказки — не автодополнение. */
export function findConcept(query: string): FoodConcept | undefined {
  const needle = query.trim().toLowerCase();
  if (needle === "") return undefined;

  return (
    foodConcepts.find((concept) => concept.en === needle || concept.ru === needle) ??
    foodConcepts.find(
      (concept) => concept.en.startsWith(needle) || concept.ru.startsWith(needle),
    ) ??
    foodConcepts.find((concept) => concept.en.includes(needle) || concept.ru.includes(needle))
  );
}
