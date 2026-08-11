/**
 * Собирает срез корпуса USDA FoodData Central в `src/content/reference-foods.ts`.
 *
 * Запускается руками и редко: дампы весят сотни мегабайт и в репозитории им
 * не место, а результат — 180 строк, которые демо показывает целиком.
 *
 *   USDA_DUMP_DIR=~/Documents/pet/usda-fdc node scripts/reference-foods.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = process.env.USDA_DUMP_DIR ?? join(homedir(), "Documents/pet/usda-fdc");
const OUT = "src/content/reference-foods.ts";
const PER_CONCEPT = 10;

const DATASETS = [
  {
    id: "usda-fndds",
    dir: "FoodData_Central_survey_food_csv_2024-10-31",
    membership: "survey_fndds_food.csv",
    categories: {
      file: "wweia_food_category.csv",
      id: "wweia_food_category",
      description: "wweia_food_category_description",
    },
  },
  {
    id: "usda-sr",
    dir: "FoodData_Central_sr_legacy_food_csv_2018-04",
    membership: "sr_legacy_food.csv",
    categories: { file: "food_category.csv", id: "id", description: "description" },
  },
];

/**
 * Концепты, которые демо умеет искать. Семья строки определяется по головным
 * сегментам имени, а не по вхождению слова: «Strudel, apple» — выпечка, и в
 * кандидаты яблока не попадает. В проде эту работу делает слой концептов.
 *
 * `cooked` — свойство еды, а не строки: имя `Oats, raw` и `Apple, raw`
 * сформулированы одинаково, и отличить их может только группа продукта.
 */
const CONCEPTS = [
  { slug: "buckwheat", en: "buckwheat", ru: "гречка", cooked: true, paths: [[/^buckwheat/i]] },
  { slug: "rice", en: "rice", ru: "рис", cooked: true, paths: [[/^rice$/i]] },
  { slug: "oats", en: "oats", ru: "овсянка", cooked: true, paths: [[/^oats?$|^oatmeal$/i]] },
  { slug: "spaghetti", en: "spaghetti", ru: "спагетти", cooked: true, paths: [[/^spaghetti$/i]] },
  { slug: "lentils", en: "lentils", ru: "чечевица", cooked: true, paths: [[/^lentils$/i]] },
  {
    slug: "ground-beef",
    en: "ground beef",
    ru: "фарш",
    cooked: true,
    paths: [[/^ground beef$/i], [/^beef$/i, /^ground$/i]],
  },
  {
    slug: "chicken-breast",
    en: "chicken breast",
    ru: "куриная грудка",
    cooked: true,
    paths: [[/^chicken breast$/i], [/^chicken$/i, /^breast$/i]],
  },
  { slug: "pollock", en: "pollock", ru: "минтай", cooked: true, paths: [[/^fish$/i, /^pollock$/i]] },
  { slug: "egg", en: "egg", ru: "яйцо", cooked: true, paths: [[/^eggs?$/i]] },
  { slug: "potato", en: "potato", ru: "картофель", cooked: true, paths: [[/^potatoe?s?$/i]] },
  { slug: "milk", en: "milk", ru: "молоко", cooked: false, paths: [[/^milk$/i]] },
  { slug: "apple", en: "apple", ru: "яблоко", cooked: false, paths: [[/^apples?$/i]] },
  { slug: "cabbage", en: "cabbage", ru: "капуста", cooked: false, paths: [[/^cabbage$/i]] },
  { slug: "cucumber", en: "cucumber", ru: "огурец", cooked: false, paths: [[/^cucumbers?$/i]] },
  { slug: "tomato", en: "tomato", ru: "помидор", cooked: false, paths: [[/^tomatoe?s?$/i]] },
  { slug: "carrot", en: "carrot", ru: "морковь", cooked: false, paths: [[/^carrots?$/i]] },
  { slug: "banana", en: "banana", ru: "банан", cooked: false, paths: [[/^bananas?$/i]] },
  {
    slug: "parmesan",
    en: "parmesan",
    ru: "пармезан",
    cooked: false,
    paths: [[/^cheese$/i, /^parmesan$/i]],
  },
];

function readCsv(path) {
  const text = readFileSync(path, "utf8");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char !== '"') {
        field += char;
      } else if (text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = false;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift().map((name) => name.trim());
  return rows
    .filter((cells) => cells.length >= header.length)
    .map((cells) => Object.fromEntries(header.map((name, at) => [name, cells[at]])));
}

const segments = (name) =>
  name.split(",").map((segment) => segment.trim().replace(/\s*\([^()]*\)$/, ""));

function collect(dataset) {
  const path = join(ROOT, dataset.dir);
  if (!existsSync(path)) throw new Error(`No dump at ${path}`);

  const published = new Set(readCsv(join(path, dataset.membership)).map((row) => row.fdc_id));
  const categories = new Map(
    readCsv(join(path, dataset.categories.file)).map((row) => [
      row[dataset.categories.id],
      row[dataset.categories.description].trim(),
    ]),
  );

  // `nutrient_id` — это `nutrient.id` в SR и `nutrient_nbr` в FNDDS: датасеты
  // ссылаются на нутриенты по-разному, и чтение по одному ключу молча даёт ноль
  const byId = new Map();
  const byNumber = new Map();
  for (const row of readCsv(join(path, "nutrient.csv"))) {
    if (row.nutrient_nbr === "") continue;
    byId.set(row.id, row.nutrient_nbr);
    byNumber.set(row.nutrient_nbr, row.nutrient_nbr);
  }

  const energy = new Map();
  const measured = new Map();

  for (const row of readCsv(join(path, "food_nutrient.csv"))) {
    if (row.amount === "" || !published.has(row.fdc_id)) continue;

    const number = byId.get(row.nutrient_id) ?? byNumber.get(row.nutrient_id);
    if (!number) continue;

    const amount = Number(row.amount);
    if (!Number.isFinite(amount)) continue;

    const seen = measured.get(row.fdc_id) ?? new Set();
    seen.add(number);
    measured.set(row.fdc_id, seen);

    if (number === "208") energy.set(row.fdc_id, amount);
  }

  return readCsv(join(path, "food.csv"))
    .filter((food) => published.has(food.fdc_id) && energy.has(food.fdc_id))
    .map((food) => ({
      dataset: dataset.id,
      externalId: food.fdc_id,
      name: food.description.trim(),
      group: categories.get(food.food_category_id) ?? "",
      kcal: Math.round(energy.get(food.fdc_id)),
      measuredCount: measured.get(food.fdc_id).size,
    }));
}

const foods = DATASETS.flatMap(collect);
const rows = [];

for (const concept of CONCEPTS) {
  const family = foods
    .filter((food) => {
      const parts = segments(food.name);
      return concept.paths.some((path) =>
        path.every((pattern, at) => pattern.test(parts[at] ?? "")),
      );
    })
    .sort(
      (a, b) =>
        (a.name.match(/,/g) ?? []).length - (b.name.match(/,/g) ?? []).length ||
        b.measuredCount - a.measuredCount ||
        (a.externalId < b.externalId ? -1 : 1),
    )
    .slice(0, PER_CONCEPT);

  if (family.length < 2) throw new Error(`Concept "${concept.slug}" found ${family.length} rows`);
  for (const food of family) rows.push({ concept: concept.slug, ...food });
}

const source = `// Сгенерировано \`scripts/reference-foods.mjs\` из дампов USDA FoodData Central
// (SR Legacy 2018-04, FNDDS 2024-10-31). Правится генератором, не руками.
//
// Имя, датасет, группа и калорийность — как их публикует USDA. \`measuredCount\`
// считает опубликованные нутриенты строки, а не то подмножество, которое
// оставляет импортёр в проде: тай-брейк по нему седьмой из восьми.
import type { RawReferenceRow, RawFoodConcept } from "@/entities/reference-food";

export const rawConcepts: RawFoodConcept[] = ${JSON.stringify(
  CONCEPTS.map(({ slug, en, ru, cooked }) => ({ slug, en, ru, eatenCooked: cooked })),
  null,
  2,
)};

export const rawReferenceRows: RawReferenceRow[] = ${JSON.stringify(rows, null, 2)};
`;

writeFileSync(OUT, source);

const per = CONCEPTS.map((concept) => {
  const family = rows.filter((row) => row.concept === concept.slug);
  return `${concept.slug}: ${family.length} (${Math.min(...family.map((r) => r.kcal))}–${Math.max(...family.map((r) => r.kcal))} kcal)`;
});

console.log(`${rows.length} rows -> ${OUT}\n${per.join("\n")}`);
