import { describe, expect, it } from "vitest";
import { createField } from "../model/field";
import { renderField } from "./field-view";
import { BLOCK_COUNTS } from "./use-fps-demo";

const roles = (count: number) =>
  renderField(createField(count), null).map((node) => ({
    key: node.key,
    role:
      (node.props as Record<string, unknown>)["data-fps-wire"] === undefined ? "block" : "wire",
  }));

describe("field markup", () => {
  // Ключи разъезжаются не внутри рендера, а между ними: Vue переиспользует узел
  // с тем же ключом, а инлайновые стили на нём пишет кадр — и роль, сменившаяся
  // под тем же ключом, достаётся элементу вместе с чужими размерами
  it("keeps a key on one role at every block count", () => {
    const seen = new Map<unknown, string>();

    for (const count of BLOCK_COUNTS) {
      for (const { key, role } of roles(count)) {
        expect(seen.get(key) ?? role).toBe(role);
        seen.set(key, role);
      }
    }
  });

  it("gives every node in a frame its own key", () => {
    for (const count of BLOCK_COUNTS) {
      const keys = roles(count).map((node) => node.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
