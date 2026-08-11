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
  // из сущности утянуло бы ворота и весь контент кейсов в начальную загрузку
  const strings: GuardrailsStrings = {
    proposes: t("proposes"),
    gates: t("gates"),
    files: t("files"),
    stopped: t("stopped"),
    passed: t("passed"),
    advice: t("advice"),
    levels: { advice: t("levels.advice"), hook: t("levels.hook"), build: t("levels.build") },
    gateNames: {
      layers: t("gateNames.layers"),
      content: t("gateNames.content"),
      i18n: t("gateNames.i18n"),
      boundary: t("gateNames.boundary"),
      budget: t("gateNames.budget"),
    },
    diffs: {
      "helper-upwards": diff("helper-upwards"),
      "english-only": diff("english-only"),
      "missing-ru-string": diff("missing-ru-string"),
      "model-in-resolver": diff("model-in-resolver"),
      "heavy-dependency": diff("heavy-dependency"),
      "narrating-comment": diff("narrating-comment"),
      honest: diff("honest"),
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
