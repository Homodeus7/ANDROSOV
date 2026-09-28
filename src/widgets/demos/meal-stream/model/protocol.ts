export type ParsedItem = { name: string; quantity: string };

export type LinkedItem = {
  /** Имя строки справочника USDA, а не то, что написал человек. */
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type StreamEvent =
  | { type: "status"; step: "parsing" }
  | { type: "parsed"; confidence: number; dishName: string; items: ParsedItem[] }
  | { type: "item"; index: number; item: LinkedItem }
  | { type: "item-failed"; index: number }
  | { type: "done"; confidence: number; dishName: string }
  | { type: "error"; code: number; message: string };
