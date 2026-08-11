import { useTranslations } from "next-intl";
import type { DemoId } from "@/entities/case";
import { cn } from "@/shared/lib";
import { AccessMatrixDemo } from "../access-matrix";
import { CanvasFpsDemo } from "../canvas-fps";
import { DynamicFormDemo } from "../dynamic-form";
import { FoodMatchDemo } from "../food-match";
import { LiveRollupDemo } from "../live-rollup";
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
  "access-matrix": {
    component: AccessMatrixDemo,
    messages: "accessMatrix",
    note: "reactNote",
  },
  "wallet-state": { component: WalletStateDemo, messages: "walletState", note: "portNote" },
};

export function DemoSlot({ demo, className }: { demo: DemoId; className?: string }) {
  const t = useTranslations("demos");
  const entry = DEMOS[demo];
  const Demo = entry.component;

  return (
    <div className={cn("grid-page gap-y-0", className)}>
      <h2 className="display text-h2 col-span-full text-balance lg:col-span-8">
        {t(`${entry.messages}.title`)}
      </h2>
      <p className="text-muted col-span-full mt-6 lg:col-span-6">
        {t(`${entry.messages}.lead`)}
      </p>
      <div className="col-span-full mt-10">
        <Demo />
      </div>
      <p className="spec text-muted col-span-full mt-6 normal-case lg:col-span-6">
        {t(entry.note)}
      </p>
    </div>
  );
}
