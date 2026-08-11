import { useTranslations } from "next-intl";
import type { DemoId } from "@/entities/case";
import { AccessMatrixDemo } from "../access-matrix";
import { CanvasFpsDemo } from "../canvas-fps";
import { DynamicFormDemo } from "../dynamic-form";
import { FoodMatchDemo } from "../food-match";
import { GuardrailsDemo } from "../guardrails";
import { LiveRollupDemo } from "../live-rollup";
import { ReferralSplitDemo } from "../referral-split";
import { TxTableDemo } from "../tx-table";
import { UndoRedoDemo } from "../undo-redo";
import { WalletStateDemo } from "../wallet-state";

type DemoEntry = { component: () => React.ReactNode; messages: string; note: string };

/** Полная таблица: демо, обещанного кейсом и не собранного, не бывает — сборка не даст. */
const DEMOS: Record<DemoId, DemoEntry> = {
  "undo-redo": { component: UndoRedoDemo, messages: "undoRedo", note: "vueNote" },
  "canvas-fps": { component: CanvasFpsDemo, messages: "canvasFps", note: "vueNote" },
  "tx-table": { component: TxTableDemo, messages: "txTable", note: "reactNote" },
  "dynamic-form": { component: DynamicFormDemo, messages: "dynamicForm", note: "reactNote" },
  "live-rollup": { component: LiveRollupDemo, messages: "liveRollup", note: "reactNote" },
  "food-match": { component: FoodMatchDemo, messages: "foodMatch", note: "reactNote" },
  guardrails: { component: GuardrailsDemo, messages: "guardrails", note: "reactNote" },
  "access-matrix": {
    component: AccessMatrixDemo,
    messages: "accessMatrix",
    note: "reactNote",
  },
  "wallet-state": { component: WalletStateDemo, messages: "walletState", note: "portNote" },
  "referral-split": {
    component: ReferralSplitDemo,
    messages: "referralSplit",
    note: "portNote",
  },
};

export function DemoSlot({ demo }: { demo: DemoId }) {
  const t = useTranslations("demos");
  const entry = DEMOS[demo];
  const Demo = entry.component;

  return (
    <div>
      <h2 className="display text-h2 max-w-3xl text-balance">{t(`${entry.messages}.title`)}</h2>
      <p className="text-muted mt-6 max-w-prose">{t(`${entry.messages}.lead`)}</p>
      <div className="mt-10">
        <Demo />
      </div>
      <p className="spec text-muted mt-6 max-w-prose normal-case">{t(entry.note)}</p>
    </div>
  );
}
