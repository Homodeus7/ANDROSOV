import { useTranslations } from "next-intl";
import type { DemoId } from "@/entities/case";
import { UndoRedoDemo } from "../undo-redo";

type DemoEntry = { component: () => React.ReactNode; messages: string };

const DEMOS: Partial<Record<DemoId, DemoEntry>> = {
  "undo-redo": { component: UndoRedoDemo, messages: "undoRedo" },
};

export function DemoSlot({ demo }: { demo: DemoId }) {
  const t = useTranslations("demos");
  const entry = DEMOS[demo];

  if (!entry) {
    return (
      <p className="border-border spec text-muted border-2 border-dashed p-8 normal-case">
        {t("pending")} — <span className="font-mono">{demo}</span>
      </p>
    );
  }

  const Demo = entry.component;

  return (
    <div>
      <h2 className="display text-h2 max-w-3xl text-balance">{t(`${entry.messages}.title`)}</h2>
      <p className="text-muted mt-6 max-w-prose">{t(`${entry.messages}.lead`)}</p>
      <div className="mt-10">
        <Demo />
      </div>
      <p className="spec text-muted mt-6 max-w-prose normal-case">{t("vueNote")}</p>
    </div>
  );
}
