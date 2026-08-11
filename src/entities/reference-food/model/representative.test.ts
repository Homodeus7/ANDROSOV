import { describe, expect, it } from "vitest";
import { foodConcepts, rowsOf } from "../api/rows";
import { rankNaively } from "./naive";
import { divergingRule, ladder, pickRepresentative, type Ranking } from "./representative";
import { declaresUncooked, isRaw } from "./segments";
import type { ReferenceRow } from "./types";

const COOKED: Ranking = { eatenCooked: true, reading: "segments" };
const RAW_FOOD: Ranking = { eatenCooked: false, reading: "segments" };

const row = (over: Partial<ReferenceRow> = {}): ReferenceRow => ({
  concept: "milk",
  dataset: "usda-sr",
  externalId: "100",
  name: "Milk, whole",
  group: "Dairy and Egg Products",
  kcal: 61,
  measuredCount: 30,
  ...over,
});

const named = (rows: ReferenceRow[]) => rows.map((item) => item.name);

describe("pickRepresentative", () => {
  // Весь смысл слоя концептов: «молоко» обязано попасть на молоко, а не на тот
  // его вид, до которого первым добрался обход корпуса
  it("takes the row USDA marked as the unqualified form", () => {
    const chosen = pickRepresentative(
      [
        row({ externalId: "whole", name: "Milk, whole, 3.25% milkfat" }),
        row({ externalId: "nfs", name: "Milk, NFS" }),
      ],
      RAW_FOOD,
    );

    expect(chosen?.externalId).toBe("nfs");
  });

  it("reads the other abbreviation USDA uses for it", () => {
    const chosen = pickRepresentative(
      [
        row({ externalId: "cut", name: "Beef, chuck, roasted" }),
        row({ externalId: "ns", name: "Beef, NS as to cut, cooked" }),
      ],
      COOKED,
    );

    expect(chosen?.externalId).toBe("ns");
  });

  // `NS as to <аспект>` снимает определённость с аспекта, а не со строки
  it("does not let an unspecified aspect stand in for an unqualified food", () => {
    const chosen = pickRepresentative(
      [
        row({
          externalId: "cooked",
          name: "Cabbage, green, cooked, fat added, NS as to fat type",
        }),
        row({ externalId: "raw", name: "Cabbage, green, raw" }),
      ],
      RAW_FOOD,
    );

    expect(chosen?.externalId).toBe("raw");
  });

  it("takes the food over a form derived from it", () => {
    const chosen = pickRepresentative(
      [
        row({ externalId: "dried", name: "Apple, dried", measuredCount: 34 }),
        row({ externalId: "raw", name: "Apple, raw", measuredCount: 30 }),
      ],
      RAW_FOOD,
    );

    expect(chosen?.externalId).toBe("raw");
  });
});

describe("reading a name", () => {
  // Жареная курица, а не сырая: маркер — целый сегмент, а не слово в нём
  it("does not call fried chicken raw when the marker is part of a segment", () => {
    const name = "Chicken breast, fried, coated, skin eaten, from raw";

    expect(isRaw(name)).toBe(false);
    expect(isRaw(name, "substring")).toBe(true);
  });

  it("does not call grated parmesan dry", () => {
    const name = "Cheese, Parmesan, dry grated";

    expect(declaresUncooked(name)).toBe(false);
    expect(declaresUncooked(name, "substring")).toBe(true);
  });

  // Скобочный хвост — не часть утверждения, и без его среза слово `raw`
  // не видно тому единственному правилу, которое обязано его увидеть
  it("still sees the marker behind a bracketed rider", () => {
    expect(isRaw("Fish, pollock, Alaska, raw (may contain additives to retain moisture)")).toBe(
      true,
    );
  });
});

describe("the corpus", () => {
  it("answers for every concept it carries", () => {
    for (const concept of foodConcepts) {
      const ranking: Ranking = { eatenCooked: concept.eatenCooked, reading: "segments" };
      expect(pickRepresentative(rowsOf(concept.slug), ranking), concept.slug).toBeDefined();
    }
  });

  // Гречка: к обоим именам не придраться, и очевидное правило берёт то, что
  // втрое тяжелее съеденного
  it("moves buckwheat off the row the obvious rule takes", () => {
    const rows = rowsOf("buckwheat");
    const obvious = rankNaively(rows)[0];
    const ranked = pickRepresentative(rows, COOKED);

    expect(obvious?.name).toBe("Buckwheat");
    expect(obvious?.kcal).toBe(343);
    expect(ranked?.kcal).toBeLessThan(obvious!.kcal / 2);
  });

  // Про сухие спагетти знает только группа продукта: имя строки об этом
  // сказать не может
  it("moves spaghetti off the dry row once the food is declared eaten cooked", () => {
    const rows = rowsOf("spaghetti");
    const dry = pickRepresentative(rows, RAW_FOOD);
    const cooked = pickRepresentative(rows, COOKED);

    expect(dry?.name).toBe("Spaghetti, spinach, dry");
    expect(cooked?.name).toBe("Spaghetti, spinach, cooked");
    expect(cooked!.kcal).toBeLessThan(dry!.kcal / 2);
  });

  it("disagrees with the obvious ranking on oats", () => {
    const rows = rowsOf("oats");
    const obvious = rankNaively(rows)[0];
    const ranked = pickRepresentative(rows, COOKED);

    expect(obvious?.name).toBe("Oats, raw");
    expect(ranked?.name).toBe("Oatmeal, NFS");
    expect(obvious!.kcal).toBeGreaterThan(ranked!.kcal * 4);
  });

  // Та же строка, прочитанная по-другому: `dry grated` — это тёртый пармезан
  it("demotes grated parmesan only when the name is read as a substring", () => {
    const rows = rowsOf("parmesan");
    const whole = pickRepresentative(rows, { eatenCooked: true, reading: "segments" });
    const loose = pickRepresentative(rows, { eatenCooked: true, reading: "substring" });

    expect(whole?.name).toBe("Cheese, Parmesan, dry grated");
    expect(loose?.name).not.toBe(whole?.name);
  });
});

describe("the ladder", () => {
  it("ends on the row the ranking picks", () => {
    const rows = rowsOf("milk");
    const steps = ladder(rows, RAW_FOOD);

    expect(steps.at(-1)?.survivors).toHaveLength(1);
    expect(steps.at(-1)?.survivors[0]).toEqual(pickRepresentative(rows, RAW_FOOD));
  });

  it("keeps every row it started with", () => {
    const rows = rowsOf("apple");
    const steps = ladder(rows, RAW_FOOD);
    const seen = steps.flatMap((step) => step.dropped).concat(steps.at(-1)!.survivors);

    expect(named(seen).sort()).toEqual(named([...rows]).sort());
  });

  it("names the rule two rows part on", () => {
    const nfs = row({ externalId: "nfs", name: "Milk, NFS" });
    const whole = row({ externalId: "whole", name: "Milk, whole" });

    expect(divergingRule(nfs, whole, RAW_FOOD)).toBe("unqualified");
    expect(
      divergingRule(whole, row({ externalId: "other", name: "Milk, sheep" }), RAW_FOOD),
    ).toBe("id");
  });
});
