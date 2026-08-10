import type { BlockKind, Scene } from "./types";

/**
 * Координаты сцены нормированы в 0…1000 и не зависят от размера вьюпорта:
 * иначе смена ширины экрана меняла бы смысл уже записанных MoveNode.
 */
export const CANVAS_SPAN = 1000;

const LAYOUT: { id: string; kind: BlockKind; x: number; y: number }[] = [
  { id: "n1", kind: "start", x: 0, y: 0 },
  { id: "n2", kind: "task", x: 500, y: 0 },
  { id: "n3", kind: "gateway", x: 1000, y: 0 },
  { id: "n4", kind: "task", x: 500, y: 1000 },
  { id: "n5", kind: "end", x: 0, y: 1000 },
];

const EDGES = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n3", to: "n4" },
  { from: "n4", to: "n5" },
];

export function seedScene(names: readonly string[]): Scene {
  return {
    blocks: LAYOUT.map((block, index) => ({ ...block, name: names[index] ?? block.id })),
    edges: EDGES,
  };
}
