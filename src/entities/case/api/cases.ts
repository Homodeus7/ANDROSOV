import { rawCases } from "@/content/cases";
import type { Locale } from "@/shared/i18n";
import { caseSchema, type CaseRecord, type ResolvedCase } from "../model/schema";

function validate(): CaseRecord[] {
  const parsed = rawCases.map((record) => {
    const result = caseSchema.safeParse(record);
    if (!result.success) {
      const slug = (record as { slug?: string }).slug ?? "<unknown>";
      throw new Error(
        `Invalid case "${slug}": ${JSON.stringify(result.error.issues, null, 2)}`,
      );
    }
    return result.data;
  });

  const slugs = new Set<string>();
  for (const record of parsed) {
    if (slugs.has(record.slug)) throw new Error(`Duplicate case slug "${record.slug}"`);
    slugs.add(record.slug);
  }

  return parsed.sort((a, b) => a.order - b.order);
}

const cases = validate();

function resolve(record: CaseRecord, locale: Locale): ResolvedCase {
  const { content, ...rest } = record;
  return { ...rest, ...content[locale] };
}

export function getCases(locale: Locale): ResolvedCase[] {
  return cases.map((record) => resolve(record, locale));
}

export function getCase(slug: string, locale: Locale): ResolvedCase | undefined {
  const record = cases.find((item) => item.slug === slug);
  return record ? resolve(record, locale) : undefined;
}

export function getCaseSlugs(): string[] {
  return cases.map((record) => record.slug);
}
