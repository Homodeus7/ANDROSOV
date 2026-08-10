import type { PayoutMethod } from "@/entities/payout";

export type DynamicFormStrings = {
  form: string;
  methods: Record<PayoutMethod, string>;
  labels: Record<string, string>;
  placeholders: Record<string, string>;
  errors: Record<string, string>;
  fallbackError: string;
  schema: string;
  fields: string;
  rules: string;
  valid: string;
  invalid: string;
  payload: string;
  submit: string;
  reset: string;
  hint: string;
  note: string;
};
