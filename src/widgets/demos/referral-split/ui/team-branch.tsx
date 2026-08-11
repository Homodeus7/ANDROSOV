"use client";

import { subtotal, type Member } from "@/entities/referral";
import type { ReferralSplitStrings } from "../model/strings";

export function TeamBranch({
  member,
  shares,
  volume,
  money,
  strings,
}: {
  member: Member;
  shares: Map<string, number>;
  volume: number;
  money: (cents: number) => string;
  strings: ReferralSplitStrings;
}) {
  const own = shares.get(member.id) ?? 0;
  const branch = subtotal(member, shares);

  return (
    <li>
      <div
        data-member={member.id}
        className="border-border/60 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-2 font-mono text-xs"
      >
        <span className="w-20">{member.id}</span>
        <span className="text-muted w-14 text-right tabular-nums">
          {((member.volume / volume) * 100).toFixed(1)}%
        </span>
        <span data-payout={member.id} className="w-24 text-right tabular-nums">
          {money(own)}
        </span>
        {member.children.length > 0 ? (
          <span className="text-muted spec ml-auto normal-case">
            {strings.subtotal}{" "}
            <span data-branch={member.id} className="tabular-nums">
              {money(branch)}
            </span>
          </span>
        ) : null}
      </div>

      {member.children.length > 0 ? (
        <ul className="border-border/60 ml-3 border-l-2 pl-3">
          {member.children.map((child) => (
            <TeamBranch
              key={child.id}
              member={child}
              shares={shares}
              volume={volume}
              money={money}
              strings={strings}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
