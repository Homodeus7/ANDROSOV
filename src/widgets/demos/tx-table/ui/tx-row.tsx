"use client";

import { memo, useEffect, useRef } from "react";
import type { Transaction } from "@/entities/ledger";

export const ROW_HEIGHT = 36;

/** Узкому экрану достаются идентификатор, сумма и статус — остальное не влезает. */
export const TX_GRID =
  "grid grid-cols-[4.75rem_1fr_7.5rem] sm:grid-cols-[5.5rem_5.5rem_4rem_1fr_8.5rem] items-center gap-3 px-3";

export const TX_WIDE = "hidden sm:block";

const HOT = "color-mix(in oklab, var(--accent-ink) 22%, transparent)";

export type TxRowProps = {
  row: Transaction;
  status: string;
  amount: string;
  onCommit: () => void;
};

/**
 * Подсветка ставится в эффекте, то есть ровно на коммите строки — это и есть
 * «строка перерисовалась», а не её имитация. Гаснет она снаружи, одним
 * проходом по таблице: пятьсот таймеров на пятьсот строк стоили бы дороже,
 * чем то, что мы измеряем.
 */
function TxRowView({ row, status, amount, onCommit }: TxRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCommit();
    const node = ref.current;
    if (!node) return;
    node.dataset.hot = String(performance.now());
    node.style.background = HOT;
  });

  return (
    <div
      ref={ref}
      data-tx-row={row.id}
      className={`${TX_GRID} border-border/60 text-fg border-b font-mono text-xs transition-colors duration-500`}
      style={{ height: ROW_HEIGHT }}
    >
      <span className="text-muted truncate">{row.id}</span>
      <span className={`${TX_WIDE} truncate`}>{row.merchant}</span>
      <span className={`${TX_WIDE} text-muted truncate`}>{row.method}</span>
      <span className="truncate text-right tabular-nums">{amount}</span>
      <span data-tx-status className="spec text-accent-ink truncate">
        {status}
      </span>
    </div>
  );
}

export const TxRow = TxRowView;

/**
 * `memo` работает только потому, что обновление оставляет нетронутые строки
 * теми же объектами. Без этого свойства он не спас бы ни одного рендера.
 */
export const TxRowMemo = memo(TxRowView);
