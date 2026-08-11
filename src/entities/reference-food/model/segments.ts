/**
 * Как читается имя строки. `segments` — правило продукта: маркер обязан быть
 * целым сегментом между запятыми. `substring` оставлено переключателем, потому
 * что именно так это пишут с первого раза, и демо показывает, чем кончается.
 */
export type Reading = "segments" | "substring";

/**
 * Хвостовая скобка срезается: `Fish, pollock, Alaska, raw (may contain additives
 * to retain moisture)` говорит про сырое, и ридер, читающий сегмент целиком,
 * без этого слова не увидит.
 */
export function segments(name: string): string[] {
  return name.split(",").map((segment) => segment.trim().replace(/\s*\([^()]*\)$/, ""));
}

type Marker = { segment: RegExp; loose: RegExp };

const marker = (source: string): Marker => ({
  segment: new RegExp(`^(?:${source})$`, "i"),
  loose: new RegExp(`\\b(?:${source})\\b`, "i"),
});

/** `Milk, NFS` — это молоко и ничего уже. */
const UNQUALIFIED = marker("NFS");

/**
 * Слова, которыми строка говорит «ещё не готово». `dry` стоит рядом с `raw`,
 * потому что крупу корпус описывает так же, как мясо: `Spaghetti, spinach, dry`
 * втрое тяжелее варёного — та же ошибка, сказанная другим словом.
 */
const UNCOOKED = marker("raw|dry|uncooked|unprepared");
const RAW = marker("raw");

/** Формы, произведённые из еды, а не она сама: сушёное яблоко — не яблоко. */
export const PROCESSED_FORM =
  /\b(?:dried|canned|pickled|candied|baked|frozen|dehydrated|juice)\b/i;

/** Заменители: `Chicken, meatless, NFS` по всем признакам генерик и не курица. */
export const IMITATION = /\b(?:meatless|imitation|substitute|analog|vegetarian|vegan)\b/i;

/** Детское питание — не та еда, в честь которой названо: разбавлено и подслащено. */
export const FOR_INFANTS = /\b(?:babyfood|baby\s+food|baby\s+toddler|toddler)\b/i;

const declares = (name: string, mark: Marker, reading: Reading) =>
  reading === "segments"
    ? segments(name).some((segment) => mark.segment.test(segment))
    : mark.loose.test(name);

export const isUnqualified = (name: string, reading: Reading = "segments") =>
  declares(name, UNQUALIFIED, reading);

export const isRaw = (name: string, reading: Reading = "segments") =>
  declares(name, RAW, reading);

export const declaresUncooked = (name: string, reading: Reading = "segments") =>
  declares(name, UNCOOKED, reading);

/**
 * `NS as to <аспект>` снимает определённость с одного аспекта, а не со строки:
 * `Cabbage, green, cooked, fat added, NS as to fat type` — варёная капуста с
 * жиром, а не капуста.
 */
export function hasUnspecifiedAspect(name: string, reading: Reading = "segments"): boolean {
  return reading === "segments"
    ? segments(name).some((segment) => segment.startsWith("NS as to"))
    : /NS as to/i.test(name);
}

export const qualifierCount = (name: string) => (name.match(/,/g) ?? []).length;
