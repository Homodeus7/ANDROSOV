"use client";

import { useMemo, useState } from "react";
import {
  PAYOUT_METHODS,
  payoutFields,
  printSchema,
  pruneValues,
  ruleCount,
  validatePayout,
  type PayoutField,
  type PayoutMethod,
  type PayoutValues,
} from "@/entities/payout";
import { toolClass } from "../../model/tool-class";
import type { DynamicFormStrings } from "../model/strings";

const FIELD_CLASS =
  "border-border bg-surface text-fg placeholder:text-muted min-h-11 w-full border-2 px-3 text-sm";

export function PayoutForm({ strings }: { strings: DynamicFormStrings }) {
  const [method, setMethod] = useState<PayoutMethod>("card");
  const [values, setValues] = useState<PayoutValues>({ currency: "EUR" });
  const [touched, setTouched] = useState(false);

  const fields = useMemo(() => payoutFields(method, values), [method, values]);
  const result = useMemo(() => validatePayout(fields, values), [fields, values]);
  const source = useMemo(() => printSchema(fields), [fields]);

  function switchMethod(next: PayoutMethod) {
    setMethod(next);
    setValues((current) => pruneValues(payoutFields(next, current), current));
  }

  function reset() {
    setMethod("card");
    setValues({ currency: "EUR" });
    setTouched(false);
  }

  const error = (field: PayoutField) =>
    touched && result.errors[field.name]
      ? (strings.errors[result.errors[field.name]!] ?? strings.fallbackError)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {PAYOUT_METHODS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={method === option}
            className={toolClass(method === option)}
            onClick={() => switchMethod(option)}
          >
            {strings.methods[option]}
          </button>
        ))}
        <button type="button" className={`${toolClass()} ml-auto`} onClick={reset}>
          {strings.reset}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          aria-label={strings.form}
          className="border-border bg-surface flex flex-col gap-3 border-2 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
          }}
        >
          {fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1">
              <span className="spec text-muted">
                {strings.labels[field.name] ?? field.name}
              </span>

              {field.options ? (
                <select
                  data-field={field.name}
                  className={FIELD_CLASS}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                >
                  <option value="">—</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  data-field={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  inputMode={field.type === "number" ? "decimal" : "text"}
                  placeholder={strings.placeholders[field.name] ?? ""}
                  className={FIELD_CLASS}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              )}

              {error(field) ? (
                <span data-error={field.name} className="spec text-accent-ink">
                  {error(field)}
                </span>
              ) : null}
            </label>
          ))}

          <button type="submit" className={`${toolClass()} mt-1 self-start`}>
            {strings.submit}
          </button>
        </form>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="border-border bg-surface border-2">
            <div className="border-border flex items-baseline justify-between gap-4 border-b-2 px-4 py-3">
              <span className="spec text-muted">{strings.schema}</span>
              {/* Метка перед числом: «5 поля» по-русски не согласуется ни с чем */}
              <span className="spec text-muted tabular-nums">
                {strings.fields} <span data-count="fields">{fields.length}</span> ·{" "}
                {strings.rules} <span data-count="rules">{ruleCount(fields)}</span>
              </span>
            </div>
            <pre
              data-schema
              className="overflow-x-auto px-4 py-3 font-mono text-[0.6875rem] leading-relaxed"
            >
              {source}
            </pre>
            <div className="border-border spec border-t-2 px-4 py-3">
              <span
                data-valid={result.ok}
                className={result.ok ? "text-accent-ink" : "text-muted"}
              >
                {result.ok ? strings.valid : strings.invalid}
              </span>
            </div>
          </div>

          {touched && result.ok ? (
            <div className="border-border bg-surface border-2 px-4 py-3">
              <p className="spec text-muted">{strings.payload}</p>
              <pre
                data-payload
                className="mt-2 overflow-x-auto font-mono text-[0.6875rem] leading-relaxed"
              >
                {JSON.stringify(pruneValues(fields, values), null, 2)}
              </pre>
            </div>
          ) : null}

          <p className="text-muted text-xs">{strings.note}</p>
        </div>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
    </div>
  );
}
