"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DemoFrame } from "../../ui/demo-frame";
import type { AccessMatrixStrings } from "../model/strings";

const AccessMatrix = dynamic(
  () => import("./access-matrix").then((module) => module.AccessMatrix),
  { ssr: false },
);

export function AccessMatrixDemo() {
  const t = useTranslations("demos.accessMatrix");

  // Ключи перечислены руками, а не собраны из `roles` и `ruleKeys`: значение из
  // сущности утянуло бы правила и CASL в начальную загрузку страницы
  const strings: AccessMatrixStrings = {
    roles: {
      operator: t("roles.operator"),
      dispatcher: t("roles.dispatcher"),
      accountant: t("roles.accountant"),
      resident: t("roles.resident"),
    },
    actions: {
      read: t("actions.read"),
      assign: t("actions.assign"),
      close: t("actions.close"),
      invoice: t("actions.invoice"),
    },
    kinds: {
      leak: t("kinds.leak"),
      heating: t("kinds.heating"),
      lift: t("kinds.lift"),
      noise: t("kinds.noise"),
    },
    statuses: {
      new: t("statuses.new"),
      assigned: t("statuses.assigned"),
      done: t("statuses.done"),
    },
    rules: {
      "operator.read": t("rules.operatorRead"),
      "operator.assign": t("rules.operatorAssign"),
      "dispatcher.read": t("rules.dispatcherRead"),
      "dispatcher.assign": t("rules.dispatcherAssign"),
      "dispatcher.close": t("rules.dispatcherClose"),
      "accountant.read": t("rules.accountantRead"),
      "accountant.invoice": t("rules.accountantInvoice"),
      "resident.read": t("rules.residentRead"),
      "resident.close": t("rules.residentClose"),
    },
    naive: t("naive"),
    columns: {
      id: t("columns.id"),
      flat: t("columns.flat"),
      kind: t("columns.kind"),
      status: t("columns.status"),
      assignee: t("columns.assignee"),
    },
    unassigned: t("unassigned"),
    redacted: t("redacted"),
    ask: t("ask"),
    allowed: t("allowed"),
    denied: t("denied"),
    noRule: t("noRule"),
    byRole: t("byRole"),
    visible: t("visible"),
    diverges: t("diverges"),
    hint: t("hint"),
    note: t("note"),
  };

  return (
    <DemoFrame className="lg:min-h-[30rem]">
      <AccessMatrix strings={strings} />
    </DemoFrame>
  );
}
