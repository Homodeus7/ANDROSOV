"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useInView } from "@/shared/in-view";
import type { TxTableStrings } from "../model/strings";

const TxTable = dynamic(() => import("./tx-table").then((module) => module.TxTable), {
  ssr: false,
});

export function TxTableDemo() {
  const t = useTranslations("demos.txTable");
  const tDemos = useTranslations("demos");
  const locale = useLocale();
  const { ref, inView } = useInView<HTMLDivElement>();

  const strings: TxTableStrings = {
    table: t("table"),
    virtual: t("virtual"),
    memo: t("memo"),
    pause: t("pause"),
    resume: t("resume"),
    reset: t("reset"),
    columns: {
      id: t("columns.id"),
      merchant: t("columns.merchant"),
      method: t("columns.method"),
      amount: t("columns.amount"),
      status: t("columns.status"),
    },
    statuses: {
      pending: t("statuses.pending"),
      authorised: t("statuses.authorised"),
      captured: t("statuses.captured"),
      refunded: t("statuses.refunded"),
      failed: t("statuses.failed"),
    },
    rowsInDom: t("rowsInDom"),
    rowsTotal: t("rowsTotal"),
    renders: t("renders"),
    messages: t("messages"),
    fps: t("fps"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <div ref={ref} className="relative min-h-[34rem] lg:min-h-[28rem]">
      {inView ? (
        <TxTable strings={strings} locale={locale} />
      ) : (
        <p className="spec text-muted absolute inset-0 flex items-center justify-center">
          {tDemos("loading")}
        </p>
      )}
    </div>
  );
}
