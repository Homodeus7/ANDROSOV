"use client";

import { useMemo, useState } from "react";
import { actors, divergences, review, roles, tickets, type Role } from "@/entities/access";
import { toolClass } from "../../model/tool-class";
import type { AccessMatrixStrings } from "../model/strings";
import { RulePanel } from "./rule-panel";
import { ROW_GRID, ROW_WIDE, TicketRow, type Asked } from "./ticket-row";

export function AccessMatrix({ strings }: { strings: AccessMatrixStrings }) {
  const [role, setRole] = useState<Role>("dispatcher");
  const [naiveMode, setNaiveMode] = useState(false);
  const [asked, setAsked] = useState<Asked | undefined>(undefined);

  const rows = useMemo(() => review(actors[role], tickets), [role]);

  const verdict = asked
    ? rows.find((row) => row.ticket.id === asked.id)?.verdicts[asked.action]
    : undefined;

  const visible = rows.filter((row) =>
    naiveMode ? row.verdicts.read.naive : row.verdicts.read.allowed,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {roles.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === role}
            data-role={item}
            className={toolClass(item === role)}
            onClick={() => setRole(item)}
          >
            {strings.roles[item]}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={naiveMode}
          data-source="naive"
          className={`${toolClass(naiveMode)} ml-auto`}
          onClick={() => setNaiveMode((on) => !on)}
        >
          {strings.naive}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="border-border bg-bg col-span-full min-w-0 border-2 lg:col-span-7">
          <div className={`${ROW_GRID} border-border spec text-muted border-b-2 py-2`}>
            <span>{strings.columns.id}</span>
            <span className={ROW_WIDE}>{strings.columns.flat}</span>
            <span>{strings.columns.kind}</span>
            <span className={ROW_WIDE}>{strings.columns.status}</span>
            <span className={ROW_WIDE}>{strings.columns.assignee}</span>
          </div>

          <ul>
            {rows.map((row) => (
              <TicketRow
                key={row.ticket.id}
                row={row}
                naiveMode={naiveMode}
                asked={asked}
                onAsk={setAsked}
                strings={strings}
              />
            ))}
          </ul>
        </div>

        <RulePanel
          className="col-span-full lg:col-span-5"
          asked={asked}
          verdict={verdict}
          naiveMode={naiveMode}
          visible={visible}
          total={rows.length}
          diverges={divergences(rows)}
          strings={strings}
        />
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
    </div>
  );
}
