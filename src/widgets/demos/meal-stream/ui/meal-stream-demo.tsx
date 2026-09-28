"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/shared/i18n";
import { DemoFrame } from "../../ui/demo-frame";
import type { MealStreamStrings } from "../model/strings";

const MealStream = dynamic(() => import("./meal-stream").then((module) => module.MealStream), {
  ssr: false,
});

export function MealStreamDemo() {
  const t = useTranslations("demos.mealStream");
  const locale = useLocale() as Locale;

  const strings: MealStreamStrings = {
    input: t("input"),
    placeholder: t("placeholder"),
    submit: t("submit"),
    examples: t("examples"),
    // Ключи перечислены руками, а не собраны из `chipIds`: значение из модели
    // притащило бы словарь продуктов в начальную загрузку
    chips: {
      oatmeal: t("chips.oatmeal"),
      buckwheat: t("chips.buckwheat"),
      ambiguous: t("chips.ambiguous"),
      drop: t("chips.drop"),
      notFood: t("chips.notFood"),
    },
    slow: t("slow"),
    idle: t("idle"),
    steps: {
      parsing: t("steps.parsing"),
      matching: t("steps.matching"),
      done: t("steps.done"),
    },
    confidence: t("confidence"),
    pending: t("pending"),
    failed: t("failed"),
    failedHint: t("failedHint"),
    stalled: t("stalled"),
    total: t("total"),
    kcal: t("kcal"),
    grams: t("grams"),
    protein: t("protein"),
    fat: t("fat"),
    carbs: t("carbs"),
    transport: t("transport"),
    retry: t("retry"),
    domain: t("domain"),
    log: t("log"),
    bytes: t("bytes"),
    chunks: t("chunks"),
    frames: t("frames"),
    buffer: t("buffer"),
    live: t("live"),
    closed: t("closed"),
    cut: t("cut"),
    dropped: t("dropped"),
    waiting: t("waiting"),
    hint: t("hint"),
  };

  return (
    <DemoFrame>
      <MealStream strings={strings} locale={locale} />
    </DemoFrame>
  );
}
