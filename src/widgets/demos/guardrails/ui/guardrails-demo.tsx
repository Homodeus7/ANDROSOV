"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { GuardrailsStrings } from "../model/strings";

const Guardrails = dynamic(() => import("./guardrails").then((module) => module.Guardrails), {
  ssr: false,
});

export function GuardrailsDemo() {
  const t = useTranslations("demos.guardrails");

  const diff = (id: string) => ({ title: t(`diffs.${id}.title`), body: t(`diffs.${id}.body`) });

  // Ключи перечислены руками, а не собраны из `diffIds` и `gateIds`: значение
  // из сущности утянуло бы ворота и весь фикстурный проект в начальную загрузку
  const strings: GuardrailsStrings = {
    proposes: t("proposes"),
    files: t("files"),
    tiers: { build: t("tiers.build"), threshold: t("tiers.threshold"), chain: t("tiers.chain") },
    calls: t("calls"),
    gateNames: {
      boundary: t("gateNames.boundary"),
      contract: t("gateNames.contract"),
      lint: t("gateNames.lint"),
    },
    meterNames: { specs: t("meterNames.specs"), size: t("meterNames.size") },
    linkNames: {
      responsibility: t("linkNames.responsibility"),
      repeat: t("linkNames.repeat"),
      simplicity: t("linkNames.simplicity"),
      cost: t("linkNames.cost"),
    },
    noCeiling: t("noCeiling"),
    ceiling: t("ceiling"),
    silent: t("silent"),
    notReached: t("notReached"),
    outcomes: {
      build: t("outcomes.build"),
      threshold: t("outcomes.threshold"),
      chain: t("outcomes.chain"),
    },
    passed: t("passed"),
    diffs: {
      "import-up": diff("import-up"),
      "hand-edit-generated": diff("hand-edit-generated"),
      "ratchet-grows": diff("ratchet-grows"),
      "card-fetches": diff("card-fetches"),
      "own-default": diff("own-default"),
      "double-suspense": diff("double-suspense"),
      "type-three-ways": diff("type-three-ways"),
      "slot-from-above": diff("slot-from-above"),
    },
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame>
      <Guardrails strings={strings} />
    </DemoFrame>
  );
}
