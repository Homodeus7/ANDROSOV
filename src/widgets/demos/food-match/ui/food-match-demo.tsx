"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/shared/i18n";
import { DemoFrame } from "../../ui/demo-frame";
import type { FoodMatchStrings } from "../model/strings";

const FoodMatch = dynamic(() => import("./food-match").then((module) => module.FoodMatch), {
  ssr: false,
});

export function FoodMatchDemo() {
  const t = useTranslations("demos.foodMatch");
  const locale = useLocale() as Locale;

  const strings: FoodMatchStrings = {
    search: t("search"),
    placeholder: t("placeholder"),
    naive: t("naive"),
    ranked: t("ranked"),
    why: t("why"),
    substring: t("substring"),
    eatenCooked: t("eatenCooked"),
    filteredOut: t("filteredOut"),
    divergeHere: t("divergeHere"),
    agree: t("agree"),
    kcal: t("kcal"),
    rows: t("rows"),
    nothing: t("nothing"),
    // Ключи перечислены руками, а не собраны из `ruleIds`: значение из сущности
    // притащило бы весь корпус в начальную загрузку. Полноту держит тип
    rules: {
      standIn: t("rules.standIn"),
      unqualified: t("rules.unqualified"),
      dataset: t("rules.dataset"),
      processing: t("rules.processing"),
      aspect: t("rules.aspect"),
      qualifiers: t("rules.qualifiers"),
      measured: t("rules.measured"),
      id: t("rules.id"),
    },
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame>
      <FoodMatch strings={strings} locale={locale} />
    </DemoFrame>
  );
}
