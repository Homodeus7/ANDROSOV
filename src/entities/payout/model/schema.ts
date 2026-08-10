import { z } from "zod";
import type { Check, PayoutField, PayoutValues } from "./types";

/**
 * Схема и её исходник собираются из одного и того же списка правил. Панель
 * рядом с формой поэтому не картинка схемы, а её печать: разойтись им негде.
 */
function fieldSchema(field: PayoutField): z.ZodType {
  if (field.type === "enum") return z.enum(field.options as [string, ...string[]]);

  if (field.type === "number") {
    let schema = z.number();
    for (const check of field.checks) {
      if (check.kind === "min") schema = schema.min(check.value);
      if (check.kind === "max") schema = schema.max(check.value);
    }
    return schema;
  }

  let schema = z.string();
  for (const check of field.checks) {
    if (check.kind === "min") schema = schema.min(check.value);
    if (check.kind === "max") schema = schema.max(check.value);
    if (check.kind === "pattern") schema = schema.regex(new RegExp(check.source));
  }
  return schema;
}

export const payoutSchema = (fields: readonly PayoutField[]) =>
  z.object(Object.fromEntries(fields.map((field) => [field.name, fieldSchema(field)])));

const printCheck = (check: Check) =>
  check.kind === "pattern" ? `.regex(/${check.source}/)` : `.${check.kind}(${check.value})`;

const printField = (field: PayoutField) => {
  const base =
    field.type === "enum"
      ? `z.enum([${field.options!.map((option) => `"${option}"`).join(", ")}])`
      : `z.${field.type}()`;

  return `  ${field.name}: ${base}${field.checks.map(printCheck).join("")},`;
};

export const printSchema = (fields: readonly PayoutField[]) =>
  ["z.object({", ...fields.map(printField), "})"].join("\n");

export const ruleCount = (fields: readonly PayoutField[]) =>
  fields.reduce((total, field) => total + field.checks.length + (field.options ? 1 : 0), 0);

export type ValidationResult = { ok: boolean; errors: Record<string, string> };

/**
 * Числа приезжают из `<input>` строками — приведение живёт здесь, а не в
 * схеме: схема на панели должна читаться как обычный Zod, без обёрток ради
 * формы.
 */
export function validatePayout(
  fields: readonly PayoutField[],
  values: PayoutValues,
): ValidationResult {
  const parsed = Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "number" ? Number(values[field.name] ?? "") : (values[field.name] ?? ""),
    ]),
  );

  const result = payoutSchema(fields).safeParse(parsed);
  if (result.success) return { ok: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const name = String(issue.path[0] ?? "");
    if (name && !errors[name]) errors[name] = issue.code;
  }

  return { ok: false, errors };
}
