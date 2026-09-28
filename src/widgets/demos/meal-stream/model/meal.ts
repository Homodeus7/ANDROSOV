import type { LinkedItem, ParsedItem, StreamEvent } from "./protocol";

export type LineStatus = "pending" | "linked" | "failed";
export type Line = ParsedItem & { status: LineStatus; item?: LinkedItem };
export type Phase = "idle" | "parsing" | "matching" | "done" | "rejected";

export type Meal = {
  phase: Phase;
  dishName?: string;
  confidence?: number;
  lines: Line[];
};

export const idle: Meal = { phase: "idle", lines: [] };

export function apply(meal: Meal, event: StreamEvent): Meal {
  switch (event.type) {
    case "status":
      return { phase: "parsing", lines: [] };
    case "parsed":
      return {
        phase: "matching",
        dishName: event.dishName,
        confidence: event.confidence,
        lines: event.items.map((item) => ({ ...item, status: "pending" })),
      };
    case "item":
    case "item-failed":
      return {
        ...meal,
        lines: meal.lines.map((line, index) =>
          index !== event.index
            ? line
            : event.type === "item"
              ? { ...line, status: "linked", item: event.item }
              : { ...line, status: "failed" },
        ),
      };
    case "done":
      return { ...meal, phase: "done", dishName: event.dishName, confidence: event.confidence };
    case "error":
      return { ...meal, phase: "rejected" };
  }
}

export function totals(lines: Line[]) {
  const sum = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  for (const { item } of lines) {
    if (!item) continue;
    sum.kcal += item.kcal;
    sum.protein += item.protein;
    sum.fat += item.fat;
    sum.carbs += item.carbs;
  }

  return sum;
}
