import { z } from "zod";

export const datasets = ["usda-fndds", "usda-sr"] as const;

export const conceptSchema = z.object({
  slug: z.string().min(1),
  en: z.string().min(1),
  ru: z.string().min(1),
  /** Свойство еды, а не строки: `Oats, raw` и `Apple, raw` названы одинаково. */
  eatenCooked: z.boolean(),
});

export const rowSchema = z.object({
  concept: z.string().min(1),
  dataset: z.enum(datasets),
  externalId: z.string().min(1),
  name: z.string().min(1),
  group: z.string(),
  kcal: z.number().int().nonnegative(),
  measuredCount: z.number().int().positive(),
});

export type RawFoodConcept = z.input<typeof conceptSchema>;
export type RawReferenceRow = z.input<typeof rowSchema>;
export type FoodConcept = z.infer<typeof conceptSchema>;
export type ReferenceRow = z.infer<typeof rowSchema>;
