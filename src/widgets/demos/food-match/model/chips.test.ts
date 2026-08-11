import { describe, expect, it } from "vitest";
import { foodConcepts, rowsOf } from "@/entities/reference-food";
import { chipSlugs, startSlug } from "./chips";

describe("food match chips", () => {
  it("names concepts the corpus actually has", () => {
    const known = new Set(foodConcepts.map((concept) => concept.slug));
    expect(chipSlugs.filter((slug) => !known.has(slug))).toEqual([]);
  });

  it("opens on a concept with something to compare", () => {
    expect(rowsOf(startSlug).length).toBeGreaterThan(1);
  });
});
