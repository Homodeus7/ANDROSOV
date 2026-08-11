"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSampler } from "@/entities/frame";
import { applyUpdates, createLedger, nextUpdate, type Transaction } from "@/entities/ledger";
import { createRandom } from "@/shared/lib";
import { useVirtualRows } from "@/shared/virtual";
import { toolClass } from "../../model/tool-class";
import type { TxTableStrings } from "../model/strings";
import { TxMeters, type Meters } from "./tx-meters";
import { ROW_HEIGHT, TX_GRID, TX_WIDE, TxRow, TxRowMemo } from "./tx-row";

const ROWS = 500;
const SEED = 20250401;
const RATE = 25;
const HOT_MS = 450;
const DECAY_MS = 100;

export function TxTable({ strings, locale }: { strings: TxTableStrings; locale: string }) {
  const [rows, setRows] = useState<Transaction[]>(() => createLedger(ROWS, SEED));
  const [virtual, setVirtual] = useState(true);
  const [memoised, setMemoised] = useState(true);
  const [running, setRunning] = useState(true);

  const sampler = useMemo(() => createSampler(), []);
  // Счётчики живут в ref, а не в состоянии: они растут десятки раз в секунду,
  // и перерисовывать ими таблицу значило бы мерить сам измеритель
  const meters = useRef<Meters>({ renders: 0, messages: 0, stats: () => sampler.stats() });
  const rowsRef = useRef(rows);

  const { ref, slice, onScroll } = useVirtualRows({
    total: rows.length,
    rowHeight: ROW_HEIGHT,
    enabled: virtual,
  });

  useEffect(() => {
    rowsRef.current = rows;
  });

  useEffect(() => {
    if (!running) return;

    const random = createRandom(SEED);
    let handle = 0;
    let last = 0;
    let carry = 0;

    const tick = (now: number) => {
      handle = requestAnimationFrame(tick);

      const delta = last === 0 ? 0 : now - last;
      last = now;
      if (delta > 0) sampler.push(delta);

      // Сообщения копятся и применяются раз в кадр. Иначе демо показывало бы
      // отсутствие батчинга, а речь про стратегию рендера
      carry += (RATE * delta) / 1000;
      const count = Math.floor(carry);
      if (count === 0) return;
      carry -= count;

      const updates = Array.from({ length: count }, () => nextUpdate(rowsRef.current, random));
      meters.current.messages += count;
      setRows((current) => applyUpdates(current, updates) as Transaction[]);
    };

    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [running, sampler]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const timer = setInterval(() => {
      const now = performance.now();
      for (const node of container.querySelectorAll<HTMLElement>("[data-hot]")) {
        if (now - Number(node.dataset.hot) < HOT_MS) continue;
        delete node.dataset.hot;
        node.style.background = "";
      }
    }, DECAY_MS);

    return () => clearInterval(timer);
  }, [ref]);

  // Ссылка обязана быть стабильной, иначе `memo` на строке не сработает ни разу
  const onCommit = useCallback(() => {
    meters.current.renders += 1;
  }, []);

  const money = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale],
  );

  function reset() {
    setRows(createLedger(ROWS, SEED));
    meters.current.renders = 0;
    meters.current.messages = 0;
    sampler.reset();
  }

  const Row = memoised ? TxRowMemo : TxRow;
  const visible = rows.slice(slice.start, slice.end);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={virtual}
          className={toolClass(virtual)}
          onClick={() => setVirtual((on) => !on)}
        >
          {strings.virtual}
        </button>
        <button
          type="button"
          aria-pressed={memoised}
          className={toolClass(memoised)}
          onClick={() => setMemoised((on) => !on)}
        >
          {strings.memo}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className={toolClass()} onClick={() => setRunning((on) => !on)}>
            {running ? strings.pause : strings.resume}
          </button>
          <button type="button" className={toolClass()} onClick={reset}>
            {strings.reset}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="border-border bg-bg min-w-0 border-2">
          <div className={`${TX_GRID} border-border spec text-muted border-b-2 py-2`}>
            <span>{strings.columns.id}</span>
            <span className={TX_WIDE}>{strings.columns.merchant}</span>
            <span className={TX_WIDE}>{strings.columns.method}</span>
            <span className="text-right">{strings.columns.amount}</span>
            <span>{strings.columns.status}</span>
          </div>

          {/* Не `role="grid"`: полноценная ARIA-сетка требует ролей на каждой
              строке и ячейке, а строки здесь виртуальные. Область с именем и
              с клавиатурной прокруткой честнее полусетки */}
          <div
            ref={ref}
            onScroll={onScroll}
            role="region"
            tabIndex={0}
            aria-label={strings.table}
            className="h-[clamp(16rem,34vw,22rem)] overflow-y-auto"
          >
            <div style={{ height: slice.totalHeight, paddingTop: slice.padTop }}>
              {visible.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  status={strings.statuses[row.status]}
                  amount={`${money.format(row.amount)} ${row.currency}`}
                  onCommit={onCommit}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <TxMeters
            meters={meters}
            rowsInDom={visible.length}
            rowsTotal={rows.length}
            strings={strings}
          />
          <p className="text-muted text-xs">{strings.note}</p>
        </div>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
    </div>
  );
}
