import { describe, expect, it } from "vitest";
import { groupDigits, parseMetric } from "./parse-metric";
import { rawCases } from "@/content/cases";
import { locales } from "@/shared/config";

describe("parseMetric", () => {
  it("counts from zero and keeps the suffix", () => {
    expect(parseMetric("500+")).toMatchObject({ prefix: "", from: 0, to: 500, suffix: "+" });
    expect(parseMetric("1049 KB")).toMatchObject({ from: 0, to: 1049, suffix: " KB" });
  });

  it("keeps everything before the number as a prefix", () => {
    expect(parseMetric("−30")).toMatchObject({ prefix: "−", from: 0, to: 30 });
  });

  it("starts a range from its first number", () => {
    expect(parseMetric("25 → 60")).toMatchObject({ prefix: "25 → ", from: 25, to: 60 });
  });

  it("reads a grouped number as one value and remembers the separator", () => {
    expect(parseMetric("13 619")).toMatchObject({ from: 0, to: 13619, separator: " " });
  });

  it("gives up on a string without digits", () => {
    expect(parseMetric("n/a")).toBeNull();
  });

  it("survives every metric shipped with the cases", () => {
    for (const item of rawCases) {
      for (const locale of locales) {
        for (const metric of item.content[locale].metrics) {
          const parsed = parseMetric(metric.value);
          if (!parsed) continue;

          const rendered = `${parsed.prefix}${groupDigits(parsed.to, parsed.separator)}${parsed.suffix}`;
          expect(rendered).toBe(metric.value);
        }
      }
    }
  });
});

describe("groupDigits", () => {
  it("splits by three from the right", () => {
    expect(groupDigits(13619, " ")).toBe("13 619");
    expect(groupDigits(619, " ")).toBe("619");
    expect(groupDigits(1234567, " ")).toBe("1 234 567");
  });

  it("leaves the number alone without a separator", () => {
    expect(groupDigits(13619, "")).toBe("13619");
  });
});
