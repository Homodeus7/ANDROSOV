import type { Locale } from "@/shared/i18n";
import type { LinkedItem, ParsedItem, StreamEvent } from "./protocol";

type Localized = Record<Locale, string>;

/** Калорийность и БЖУ на 100 г, как их публикует USDA SR Legacy. */
type Row = [name: string, kcal: number, protein: number, fat: number, carbs: number];

type Food = {
  stems: Record<Locale, string[]>;
  name: Localized;
  portion: Localized & { grams: number };
  /** Нет строки — значит, кандидатов несколько и они слишком близки: продукт не угадывает. */
  row?: Row;
};

const serving = (grams: number) => ({ grams, ru: "порция", en: "a serving" });
const piece = (grams: number) => ({ grams, ru: "1 шт", en: "1 piece" });
const cup = { grams: 200, ru: "чашка", en: "a cup" };

// Порядок значим: «cottage cheese» должен найтись раньше, чем «cheese»
const PANTRY: Food[] = [
  {
    stems: { ru: ["овсян", "геркулес"], en: ["oat", "porridge"] },
    name: { ru: "овсянка", en: "oatmeal" },
    portion: serving(50),
    row: ["Cereals, oats, regular and quick, not fortified, dry", 379, 13.15, 6.52, 67.7],
  },
  {
    stems: { ru: ["молок", "молоч"], en: ["milk"] },
    name: { ru: "молоко", en: "milk" },
    portion: serving(150),
    row: ["Milk, whole, 3.25% milkfat", 61, 3.15, 3.25, 4.8],
  },
  {
    stems: { ru: ["банан"], en: ["banana"] },
    name: { ru: "банан", en: "banana" },
    portion: piece(118),
    row: ["Bananas, raw", 89, 1.09, 0.33, 22.84],
  },
  {
    stems: { ru: ["коф"], en: ["coffee"] },
    name: { ru: "кофе", en: "coffee" },
    portion: cup,
    row: ["Beverages, coffee, brewed, prepared with tap water", 1, 0.12, 0.02, 0],
  },
  {
    stems: { ru: ["сахар"], en: ["sugar"] },
    name: { ru: "сахар", en: "sugar" },
    portion: { grams: 5, ru: "1 ч. л.", en: "1 tsp" },
    row: ["Sugars, granulated", 387, 0, 0, 99.98],
  },
  {
    stems: { ru: ["греч"], en: ["buckwheat"] },
    name: { ru: "гречка", en: "buckwheat" },
    portion: serving(200),
    row: ["Buckwheat groats, roasted, cooked", 92, 3.38, 0.62, 19.94],
  },
  {
    stems: { ru: ["котлет"], en: ["patty", "cutlet"] },
    name: { ru: "котлета", en: "beef patty" },
    portion: piece(100),
    row: [
      "Beef, ground, 80% lean meat / 20% fat, patty, cooked, pan-broiled",
      270,
      26.11,
      17.73,
      0,
    ],
  },
  {
    // Творог 1% и 2% стоят в справочнике вплотную
    stems: { ru: ["творог", "творож"], en: ["cottage cheese"] },
    name: { ru: "творог", en: "cottage cheese" },
    portion: serving(150),
  },
  {
    stems: { ru: ["мед", "мёд"], en: ["honey"] },
    name: { ru: "мед", en: "honey" },
    portion: { grams: 21, ru: "1 ст. л.", en: "1 tbsp" },
    row: ["Honey", 304, 0.3, 0, 82.4],
  },
  {
    stems: { ru: ["чай", "чая", "чаем", "чаю"], en: ["tea"] },
    name: { ru: "чай", en: "tea" },
    portion: cup,
    row: ["Beverages, tea, black, brewed, prepared with tap water", 1, 0, 0, 0.3],
  },
  {
    stems: { ru: ["куриц", "курин", "грудк"], en: ["chicken"] },
    name: { ru: "куриная грудка", en: "chicken breast" },
    portion: serving(150),
    row: [
      "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
      165,
      31.02,
      3.57,
      0,
    ],
  },
  {
    stems: { ru: ["рис"], en: ["rice"] },
    name: { ru: "рис", en: "rice" },
    portion: serving(180),
    row: ["Rice, white, long-grain, regular, cooked", 130, 2.69, 0.28, 28.17],
  },
  {
    stems: { ru: ["огур"], en: ["cucumber"] },
    name: { ru: "огурец", en: "cucumber" },
    portion: piece(120),
    row: ["Cucumber, with peel, raw", 15, 0.65, 0.11, 3.63],
  },
  {
    stems: { ru: ["помидор", "томат"], en: ["tomato"] },
    name: { ru: "помидор", en: "tomato" },
    portion: piece(120),
    row: ["Tomatoes, red, ripe, raw, year round average", 18, 0.88, 0.2, 3.89],
  },
  {
    stems: { ru: ["яблок"], en: ["apple"] },
    name: { ru: "яблоко", en: "apple" },
    portion: piece(180),
    row: ["Apples, raw, with skin", 52, 0.26, 0.17, 13.81],
  },
  {
    stems: { ru: ["яйц", "яйк", "яиц"], en: ["egg"] },
    name: { ru: "яйцо", en: "egg" },
    portion: piece(50),
    row: ["Egg, whole, cooked, hard-boiled", 155, 12.58, 10.61, 1.12],
  },
  {
    stems: { ru: ["картоф", "картош", "пюре"], en: ["potato", "mash"] },
    name: { ru: "картофель", en: "potatoes" },
    portion: serving(200),
    row: ["Potatoes, boiled, cooked without skin, flesh, without salt", 86, 1.71, 0.1, 20.01],
  },
  {
    // Сырая и жареная говядина — разные калории при одном имени
    stems: { ru: ["говядин", "говяж"], en: ["beef", "steak"] },
    name: { ru: "говядина", en: "beef" },
    portion: serving(150),
  },
  {
    stems: { ru: ["хлеб"], en: ["bread", "toast"] },
    name: { ru: "хлеб", en: "bread" },
    portion: { grams: 30, ru: "1 ломтик", en: "1 slice" },
  },
  {
    stems: { ru: ["сыр"], en: ["cheese"] },
    name: { ru: "сыр", en: "cheese" },
    portion: { grams: 30, ru: "кусочек", en: "a slice" },
  },
];

export const chipIds = ["oatmeal", "buckwheat", "ambiguous", "drop", "notFood"] as const;
export type ChipId = (typeof chipIds)[number];

/** Сценарий с обрывом — та же фраза, но связь пропадает посреди кадра. */
export const cutsConnection = (chip: ChipId) => chip === "drop";

const SEPARATOR = /\s*(?:[,;:+]|\s(?:и|с|со|на|with|and|on|plus|&)\s)\s*/iu;
const QUANTITY = /(\d+(?:[.,]\d+)?)\s*(г|гр|грамм\p{L}*|g|grams?|мл|ml|шт|pcs?)?/iu;
const MEAL_WORDS = /^(?:завтрак|обед|ужин|перекус|breakfast|lunch|dinner|snack)$/iu;
const ARTICLE = /^(?:a|an|the|some)\s+/iu;
const MAX_ITEMS = 8;

const stemPattern = (stems: string[]) =>
  new RegExp(`(?:^|[^\\p{L}])(?:${stems.join("|")})`, "iu");

const round1 = (value: number) => Math.round(value * 10) / 10;

type Resolved = { parsed: ParsedItem; linked?: LinkedItem; known: boolean };

function resolve(fragment: string, locale: Locale): Resolved {
  const food = PANTRY.find((entry) =>
    stemPattern([...entry.stems.ru, ...entry.stems.en]).test(fragment),
  );
  const amount = QUANTITY.exec(fragment);

  if (!food) {
    const name = fragment.replace(QUANTITY, "").replace(ARTICLE, "").trim().slice(0, 40);
    return { parsed: { name, quantity: amount?.[0].trim() ?? "—" }, known: false };
  }

  const count = amount ? Number(amount[1].replace(",", ".")) : 1;
  const unit = amount?.[2]?.toLowerCase() ?? "";
  const grams = Math.round(/^(?:г|g|мл|ml)/u.test(unit) ? count : count * food.portion.grams);
  const parsed = {
    name: food.name[locale],
    quantity: amount?.[0].trim() || food.portion[locale],
  };

  if (!food.row) return { parsed, known: true };

  const [name, kcal, protein, fat, carbs] = food.row;
  const share = grams / 100;

  return {
    parsed,
    known: true,
    linked: {
      name,
      grams,
      kcal: Math.round(kcal * share),
      protein: round1(protein * share),
      fat: round1(fat * share),
      carbs: round1(carbs * share),
    },
  };
}

export function readPhrase(phrase: string, locale: Locale) {
  return phrase
    .split(SEPARATOR)
    .map((fragment) => fragment.trim())
    .filter((fragment) => /\p{L}.*\p{L}/u.test(fragment) && !MEAL_WORDS.test(fragment))
    .slice(0, MAX_ITEMS)
    .map((fragment) => resolve(fragment, locale));
}

export type Frame = { delay: number; text: string };
export type Recording = { frames: Frame[]; cutAt?: number };

export function hash(text: string) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.codePointAt(0)!, 16777619);
  return value >>> 0;
}

export function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const data = (event: StreamEvent) => `data: ${JSON.stringify(event)}\n\n`;
const round2 = (value: number) => Math.round(value * 100) / 100;

/** Запись ответа бэкенда на фразу: те же кадры, что пришли бы по сети. */
export function record(
  phrase: string,
  locale: Locale,
  options: { cut?: boolean } = {},
): Recording {
  const random = mulberry32(hash(phrase));
  const resolved = readPhrase(phrase, locale);
  const frames: Frame[] = [
    { delay: 120, text: data({ type: "status", step: "parsing" }) },
    { delay: 520, text: ": keep-alive\n\n" },
  ];

  if (!resolved.some((entry) => entry.known)) {
    frames.push({
      delay: 620,
      text: data({ type: "error", code: 422, message: "No food found in the text" }),
    });
    return { frames };
  }

  const dishName = phrase.trim().charAt(0).toUpperCase() + phrase.trim().slice(1, 60);
  const unknown = resolved.filter((entry) => !entry.known).length;
  const confidence = round2(Math.max(0.4, 0.94 - unknown * 0.12));

  frames.push({
    delay: 680,
    text: data({
      type: "parsed",
      confidence,
      dishName,
      items: resolved.map((entry) => entry.parsed),
    }),
  });

  // Матчер отвечает по мере готовности, а не по порядку во фразе
  const order = resolved
    .map((_, index) => ({ index, key: random() }))
    .sort((left, right) => left.key - right.key)
    .map((entry) => entry.index);

  for (const index of order) {
    const linked = resolved[index].linked;
    frames.push({
      delay: 260 + Math.round(random() * 420),
      text: data(
        linked ? { type: "item", index, item: linked } : { type: "item-failed", index },
      ),
    });
  }

  const linkedCount = resolved.filter((entry) => entry.linked).length;
  // Нулевая задержка — `done` приезжает в одном чанке с хвостом последней позиции
  frames.push({
    delay: 0,
    text: data({
      type: "done",
      confidence: round2(confidence * (linkedCount / resolved.length)),
      dishName,
    }),
  });

  const firstItem = 3;
  const cutAt = options.cut ? Math.min(firstItem + 2, frames.length - 2) : undefined;
  return { frames, cutAt };
}
