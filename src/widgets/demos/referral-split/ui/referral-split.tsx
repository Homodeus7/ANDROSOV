"use client";

import { useMemo, useState } from "react";
import {
  distribute,
  distributeNaively,
  flatten,
  paid,
  team,
  type Member,
} from "@/entities/referral";
import type { ReferralSplitStrings } from "../model/strings";
import { TeamBranch } from "./team-branch";

const START = 12_345;
const MAX = 200_000;

const volumeOf = (members: Member[]) =>
  members.reduce((total, member) => total + member.volume, 0);

export function ReferralSplit({
  strings,
  locale,
}: {
  strings: ReferralSplitStrings;
  locale: string;
}) {
  const [pool, setPool] = useState(START);

  const volume = useMemo(() => volumeOf(flatten(team)), []);
  const shares = useMemo(() => distribute(pool, team), [pool]);
  const drift = useMemo(() => paid(distributeNaively(pool, team)) - pool, [pool]);

  const format = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale],
  );

  const money = (cents: number) => format.format(cents / 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="spec text-muted" htmlFor="referral-pool">
          {strings.pool}
        </label>
        <input
          id="referral-pool"
          type="range"
          min={1}
          max={MAX}
          value={pool}
          onChange={(event) => setPool(Number(event.target.value))}
          className="accent-accent min-h-11 w-full max-w-sm"
        />
        <span data-pool="" className="display text-2xl tabular-nums">
          {money(pool)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="border-border bg-bg min-w-0 border-2 p-3">
          <div className="border-border spec text-muted flex flex-wrap gap-x-4 border-b-2 pb-2">
            <span className="w-20">{strings.team}</span>
            <span className="w-14 text-right">{strings.share}</span>
            <span className="w-24 text-right">{strings.payout}</span>
          </div>
          <ul className="mt-2">
            <TeamBranch
              member={team}
              shares={shares}
              volume={volume}
              money={money}
              strings={strings}
            />
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <dl className="border-border bg-surface grid grid-cols-2 gap-3 border-2 p-4">
            <div>
              <dd data-total="paid" className="display text-2xl tabular-nums">
                {money(paid(shares))}
              </dd>
              <dt className="spec text-muted mt-1">{strings.paid}</dt>
            </div>
            <div>
              <dd
                data-total="drift"
                className={`display text-2xl tabular-nums ${drift === 0 ? "" : "text-accent-ink"}`}
              >
                {drift > 0 ? `+${drift}` : drift}
              </dd>
              <dt className="spec text-muted mt-1">{strings.drift}</dt>
            </div>
          </dl>

          <p className="spec text-muted normal-case">{strings.exact}</p>
          <p className="text-muted max-w-prose text-xs">{strings.note}</p>
        </div>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
    </div>
  );
}
