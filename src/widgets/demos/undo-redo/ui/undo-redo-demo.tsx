"use client";

import { useTranslations } from "next-intl";
import { VueIsland } from "@/shared/vue-island";
import type { FlowDemoStrings } from "../model/strings";

export function UndoRedoDemo() {
  const t = useTranslations("demos.undoRedo");
  const tDemos = useTranslations("demos");

  const strings: FlowDemoStrings = {
    seedNames: t.raw("seedNames") as string[],
    newBlockName: t("newBlockName"),
    add: t("add"),
    connect: t("connect"),
    connecting: t("connecting"),
    remove: t("remove"),
    rename: t("rename"),
    undo: t("undo"),
    redo: t("redo"),
    reset: t("reset"),
    canvas: t("canvas"),
    hint: t("hint"),
    buffer: t("buffer"),
    saved: t("saved"),
    signals: t("signals"),
    empty: t("empty"),
    earlier: t("earlier"),
    timeline: t("timeline"),
    coverage: t("coverage"),
    rules: {
      ephemeral: t("rules.ephemeral"),
      paired: t("rules.paired"),
      lastWrite: t("rules.lastWrite"),
    },
  };

  return (
    <VueIsland
      className="min-h-[34rem] lg:min-h-[30rem]"
      load={() =>
        import("../vue/mount").then(
          ({ mountFlowDemo }) =>
            (host: HTMLElement) =>
              mountFlowDemo(host, strings),
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
