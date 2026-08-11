"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { ReferralSplitStrings } from "../model/strings";

const ReferralSplit = dynamic(
  () => import("./referral-split").then((module) => module.ReferralSplit),
  { ssr: false },
);

export function ReferralSplitDemo() {
  const t = useTranslations("demos.referralSplit");
  const locale = useLocale();

  const strings: ReferralSplitStrings = {
    pool: t("pool"),
    team: t("team"),
    share: t("share"),
    payout: t("payout"),
    subtotal: t("subtotal"),
    paid: t("paid"),
    drift: t("drift"),
    exact: t("exact"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame className="lg:min-h-[26rem]">
      <ReferralSplit strings={strings} locale={locale} />
    </DemoFrame>
  );
}
