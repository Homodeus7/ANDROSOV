"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { DynamicFormStrings } from "../model/strings";

const PayoutForm = dynamic(() => import("./payout-form").then((module) => module.PayoutForm), {
  ssr: false,
});

export function DynamicFormDemo() {
  const t = useTranslations("demos.dynamicForm");

  const strings: DynamicFormStrings = {
    form: t("form"),
    methods: {
      card: t("methods.card"),
      sepa: t("methods.sepa"),
      swift: t("methods.swift"),
      crypto: t("methods.crypto"),
    },
    labels: t.raw("labels") as Record<string, string>,
    placeholders: t.raw("placeholders") as Record<string, string>,
    errors: t.raw("errors") as Record<string, string>,
    fallbackError: t("fallbackError"),
    schema: t("schema"),
    fields: t("fields"),
    rules: t("rules"),
    valid: t("valid"),
    invalid: t("invalid"),
    payload: t("payload"),
    submit: t("submit"),
    reset: t("reset"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame className="lg:min-h-[26rem]">
      <PayoutForm strings={strings} />
    </DemoFrame>
  );
}
