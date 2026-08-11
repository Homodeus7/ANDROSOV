"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { LiveRollupStrings } from "../model/strings";

const LiveRollup = dynamic(() => import("./live-rollup").then((module) => module.LiveRollup), {
  ssr: false,
});

export function LiveRollupDemo() {
  const t = useTranslations("demos.liveRollup");
  const locale = useLocale();

  const strings: LiveRollupStrings = {
    chart: t("chart"),
    clock: t("clock"),
    decomposable: t("decomposable"),
    notDecomposable: t("notDecomposable"),
    fromRaw: t("fromRaw"),
    fromBuckets: t("fromBuckets"),
    plotted: t("plotted"),
    identical: t("identical"),
    offBy: t("offBy"),
    bucket: t("bucket"),
    events: t("events"),
    drift: t("drift"),
    worstDrift: t("worstDrift"),
    late: t("late"),
    gap: t("gap"),
    pause: t("pause"),
    resume: t("resume"),
    reset: t("reset"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame className="lg:min-h-[28rem]">
      <LiveRollup strings={strings} locale={locale} />
    </DemoFrame>
  );
}
