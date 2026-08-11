"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { WalletStateStrings } from "../model/strings";

const WalletState = dynamic(
  () => import("./wallet-state").then((module) => module.WalletState),
  {
    ssr: false,
  },
);

export function WalletStateDemo() {
  const t = useTranslations("demos.walletState");

  // Ключи перечислены руками, а не собраны из `statuses` и `eventNames`:
  // значение из сущности утянуло бы машину состояний в начальную загрузку
  const strings: WalletStateStrings = {
    wallet: t("wallet"),
    app: t("app"),
    chain: t("chain"),
    statuses: {
      disconnected: t("statuses.disconnected"),
      connecting: t("statuses.connecting"),
      wrongChain: t("statuses.wrongChain"),
      switching: t("statuses.switching"),
      ready: t("statuses.ready"),
      signing: t("statuses.signing"),
    },
    advice: {
      idle: t("advice.idle"),
      connecting: t("advice.connecting"),
      wrongChain: t("advice.wrongChain"),
      switching: t("advice.switching"),
      ready: t("advice.ready"),
      signing: t("advice.signing"),
      rejected: t("advice.rejected"),
      pending: t("advice.pending"),
      signed: t("advice.signed"),
    },
    events: {
      connect: t("events.connect"),
      switch: t("events.switch"),
      sign: t("events.sign"),
      approve: t("events.approve"),
      reject: t("events.reject"),
      busy: t("events.busy"),
      chainChanged: t("events.chainChanged"),
      disconnect: t("events.disconnect"),
    },
    raw: t("raw"),
    quiet: t("quiet"),
    signature: t("signature"),
    trail: t("trail"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame className="lg:min-h-[28rem]">
      <WalletState strings={strings} />
    </DemoFrame>
  );
}
