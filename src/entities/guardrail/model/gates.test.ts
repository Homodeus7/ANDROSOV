import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { diffs } from "./diffs";
import { gates, INITIAL_JS_KB, LAYERS } from "./gates";
import { project } from "./project";
import { blocked, review } from "./review";
import type { Diff } from "./types";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

const failed = (diff: Diff) =>
  review(diff)
    .filter((verdict) => !verdict.passed)
    .map((verdict) => verdict.gate);

describe("the project as it stands", () => {
  it("passes every gate", () => {
    for (const gate of gates) expect(gate.check(project), gate.id).toBeUndefined();
  });
});

describe("every prepared diff", () => {
  // Ограждение, срабатывания которого никто не видел, ограждением не является
  for (const diff of diffs) {
    it(`is stopped by exactly the gates "${diff.id}" claims`, () => {
      expect(failed(diff)).toEqual(diff.caught);
    });
  }

  it("leaves one diff that passes everything", () => {
    const honest = diffs.filter((diff) => !blocked(review(diff)) && !diff.advice);
    expect(honest).toHaveLength(1);
  });

  // Правка, которую ловит только совет, — та, ради которой ворота и нужны:
  // она доезжает
  it("leaves one diff that no gate has an opinion about", () => {
    const advised = diffs.filter((diff) => diff.advice);
    expect(advised).toHaveLength(1);
    expect(blocked(review(advised[0]!))).toBe(false);
  });
});

describe("the gates say what the build says", () => {
  it("holds the same layer order as the lint config", () => {
    const source = read("eslint.config.mjs");
    const literal = /const LAYERS = \[([^\]]+)\]/.exec(source)?.[1] ?? "";
    const layers = literal
      .split(",")
      .map((name) => name.trim().replace(/"/g, ""))
      .filter(Boolean);

    expect(layers).toEqual(LAYERS);
  });

  it("holds the same payload ceiling as the budget spec", () => {
    const source = read("e2e/budget.spec.ts");
    const ceiling = /const INITIAL_JS_KB = (\d+)/.exec(source)?.[1];

    expect(Number(ceiling)).toBe(INITIAL_JS_KB);
  });
});

describe("rules the demo does not put on screen", () => {
  it("catches an import that goes around a slice's public API", () => {
    const deep: Diff = {
      id: "honest",
      caught: ["layers"],
      files: [
        {
          path: "src/views/lab/ui/lab-page.tsx",
          source: `import { Marquee } from "@/shared/ui/marquee";`,
        },
      ],
    };

    expect(failed(deep)).toEqual(["layers"]);
    expect(review(deep)[0]?.message).toContain("public API");
  });

  it("catches a module reaching into its sibling", () => {
    const cycle: Diff = {
      id: "honest",
      caught: ["boundary"],
      files: [
        {
          path: "modules/reference-foods/application/resolve-reference.service.ts",
          source: `import { ProductsService } from '../../products/products.service';`,
        },
      ],
    };

    expect(failed(cycle)).toEqual(["boundary"]);
  });
});
