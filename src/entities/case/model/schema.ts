import { z } from "zod";
import { locales } from "@/shared/config";

export const demoIds = [
  "undo-redo",
  "canvas-fps",
  "tx-table",
  "dynamic-form",
  "live-rollup",
  "food-match",
  "guardrails",
  "access-matrix",
  "wallet-state",
  "referral-split",
] as const;

const metricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().optional(),
});

const codeSchema = z.object({
  lang: z.string().min(1),
  caption: z.string().optional(),
  source: z.string().min(1),
});

const sectionSchema = z.object({
  kind: z.enum(["problem", "constraint", "solution", "result"]),
  title: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  code: codeSchema.optional(),
});

const localizedSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  metrics: z.array(metricSchema),
  sections: z.array(sectionSchema).min(1),
});

export const caseSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  order: z.number().int().nonnegative(),
  nda: z.boolean(),
  stack: z.array(z.string().min(1)).min(1),
  demos: z.array(z.enum(demoIds)).optional(),
  links: z.array(z.object({ label: z.string().min(1), href: z.url() })),
  content: z.object(
    Object.fromEntries(locales.map((locale) => [locale, localizedSchema])) as Record<
      (typeof locales)[number],
      typeof localizedSchema
    >,
  ),
});

export type DemoId = (typeof demoIds)[number];
export type CaseMetric = z.infer<typeof metricSchema>;
export type CaseSection = z.infer<typeof sectionSchema>;
export type CaseLocalized = z.infer<typeof localizedSchema>;
export type CaseRecord = z.infer<typeof caseSchema>;
export type ResolvedCase = Omit<CaseRecord, "content"> & CaseLocalized;
