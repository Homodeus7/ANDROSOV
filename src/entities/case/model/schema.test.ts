import { describe, expect, it } from "vitest";
import { caseSchema } from "./schema";
import { rawCases } from "@/content/cases";

const localized = {
  title: "T",
  tagline: "Tagline",
  role: "Role",
  period: "2026",
  metrics: [],
  sections: [{ kind: "problem" as const, title: "P", body: ["text"] }],
};

const valid = {
  slug: "demo-case",
  order: 0,
  nda: false,
  stack: ["TypeScript"],
  links: [{ label: "Site", href: "https://example.com" }],
  content: { en: localized, ru: localized },
};

describe("caseSchema", () => {
  it("accepts a well-formed case", () => {
    expect(caseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a non-kebab-case slug", () => {
    expect(caseSchema.safeParse({ ...valid, slug: "Demo Case" }).success).toBe(false);
  });

  it("rejects a case missing a locale", () => {
    expect(caseSchema.safeParse({ ...valid, content: { en: localized } }).success).toBe(false);
  });

  it("rejects a case with no sections", () => {
    const empty = { ...localized, sections: [] };
    expect(caseSchema.safeParse({ ...valid, content: { en: empty, ru: empty } }).success).toBe(
      false,
    );
  });

  it("rejects a demo id that no demo answers to", () => {
    expect(caseSchema.safeParse({ ...valid, demos: ["tx-table", "nope"] }).success).toBe(false);
  });

  it("rejects a non-url link", () => {
    expect(
      caseSchema.safeParse({ ...valid, links: [{ label: "x", href: "not-a-url" }] }).success,
    ).toBe(false);
  });

  it("validates every authored case", () => {
    for (const record of rawCases) {
      expect(caseSchema.safeParse(record).success, `case "${record.slug}"`).toBe(true);
    }
  });
});
