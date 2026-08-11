import type { RuleId } from "@/entities/reference-food";

export type FoodMatchStrings = {
  search: string;
  placeholder: string;
  naive: string;
  ranked: string;
  why: string;
  substring: string;
  eatenCooked: string;
  filteredOut: string;
  divergeHere: string;
  agree: string;
  kcal: string;
  rows: string;
  nothing: string;
  rules: Record<RuleId, string>;
  hint: string;
  note: string;
};
