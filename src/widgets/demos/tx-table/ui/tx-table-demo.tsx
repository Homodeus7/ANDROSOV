"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { TxTableStrings } from "../model/strings";

const TxTable = dynamic(() => import("./tx-table").then((module) => module.TxTable), {
  ssr: false,
});

export function TxTableDemo() {
  const t = useTranslations("demos.txTable");
  const locale = useLocale();

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
    <DemoFrame className="lg:min-h-[28rem]">
      <TxTable strings={strings} locale={locale} />
    </DemoFrame>
  );
}
