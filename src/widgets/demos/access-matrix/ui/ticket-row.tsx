"use client";

import { actions, type Action, type ReviewedTicket } from "@/entities/access";
import type { AccessMatrixStrings } from "../model/strings";

export const ROW_GRID =
  "grid grid-cols-[5.5rem_1fr] sm:grid-cols-[5.5rem_3rem_1fr_6rem_7rem] items-center gap-3 px-3";

export const ROW_WIDE = "hidden sm:block";

export type Asked = { id: string; action: Action };

export function TicketRow({
  row,
  naiveMode,
  asked,
  onAsk,
  strings,
}: {
  row: ReviewedTicket;
  naiveMode: boolean;
  asked?: Asked;
  onAsk: (asked: Asked) => void;
  strings: AccessMatrixStrings;
}) {
  const { ticket, verdicts } = row;
  const readable = naiveMode ? verdicts.read.naive : verdicts.read.allowed;

  return (
    <li className="border-border border-t-2 first:border-t-0">
      <div
        data-ticket={ticket.id}
        data-readable={readable}
        className={`${ROW_GRID} py-2 font-mono text-xs ${readable ? "" : "text-muted"}`}
      >
        <span>{ticket.id}</span>
        <span className={ROW_WIDE}>{readable ? ticket.flat : "—"}</span>
        <span className="truncate">
          {readable ? strings.kinds[ticket.kind] : strings.redacted}
        </span>
        <span className={`${ROW_WIDE} truncate`}>
          {readable ? strings.statuses[ticket.status] : "—"}
        </span>
        <span className={`${ROW_WIDE} truncate`}>
          {readable ? (ticket.assignee ?? strings.unassigned) : "—"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 px-3 pb-2">
        {actions.map((action) => {
          const verdict = verdicts[action];
          const allowed = naiveMode ? verdict.naive : verdict.allowed;
          const diverges = verdict.allowed !== verdict.naive;
          const active = asked?.id === ticket.id && asked.action === action;

          return (
            <button
              key={action}
              type="button"
              // Не `disabled` и не `aria-disabled`: кнопка не выполняет действие,
              // а спрашивает, можно ли его выполнить, и работает всегда. Вердикт
              // уходит в имя, иначе он остаётся одним только начертанием
              aria-label={`${strings.actions[action]} — ${allowed ? strings.allowed : strings.denied}`}
              aria-pressed={active}
              data-action={action}
              data-allowed={allowed}
              data-diverges={diverges}
              onClick={() => onAsk({ id: ticket.id, action })}
              className={`spec min-h-9 cursor-pointer border-2 px-2 ${
                active ? "border-accent bg-accent text-on-accent" : "border-border flood"
              } ${allowed ? "" : `line-through ${active ? "" : "text-muted"}`} ${
                diverges && !active ? "border-accent-ink border-dashed" : ""
              }`}
            >
              {strings.actions[action]}
            </button>
          );
        })}
      </div>
    </li>
  );
}
