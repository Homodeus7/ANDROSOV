"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useInView } from "@/shared/in-view";
import type { DynamicFormStrings } from "../model/strings";

const PayoutForm = dynamic(() => import("./payout-form").then((module) => module.PayoutForm), {
  ssr: false,
});

export function DynamicFormDemo() {
  const t = useTranslations("demos.dynamicForm");
  const tDemos = useTranslations("demos");
  const { ref, inView } = useInView<HTMLDivElement>();

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
    <div ref={ref} className="relative min-h-[34rem] lg:min-h-[26rem]">
      {inView ? (
        <PayoutForm strings={strings} />
      ) : (
        <p className="spec text-muted absolute inset-0 flex items-center justify-center">
          {tDemos("loading")}
        </p>
      )}
    </div>
  );
}
