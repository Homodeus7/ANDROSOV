"use client";

import { useTranslations } from "next-intl";
import { VueIsland } from "@/shared/vue-island";
import type { FpsDemoStrings } from "../model/strings";

export function CanvasFpsDemo() {
  const t = useTranslations("demos.canvasFps");
  const tDemos = useTranslations("demos");

  const strings: FpsDemoStrings = {
    canvas: t("canvas"),
    naive: t("naive"),
    budget: t("budget"),
    blocks: t("blocks"),
    pause: t("pause"),
    resume: t("resume"),
    reset: t("reset"),
    fps: t("fps"),
    p95: t("p95"),
    dropped: t("dropped"),
    reads: t("reads"),
    loop: t("loop"),
    awake: t("awake"),
    asleep: t("asleep"),
    wasted: t("wasted"),
    measured: t("measured"),
    waiting: t("waiting"),
    ms: t("ms"),
    hint: t("hint"),
    naiveNote: t("naiveNote"),
    budgetNote: t("budgetNote"),
  };

  return (
    <VueIsland
      className="min-h-[38rem] lg:min-h-[28rem]"
      load={() =>
        import("../vue/mount").then(
          ({ mountFpsDemo }) =>
            (host: HTMLElement) =>
              mountFpsDemo(host, strings),
        )
      }
      fallback={
        <p className="spec text-muted absolute inset-0 flex items-center justify-center">
          {tDemos("loading")}
        </p>
      }
    />
  );
}
