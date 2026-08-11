import { subject } from "@casl/ability";
import { allowedNaively } from "./naive";
import { abilityFor } from "./rules";
import {
  actions,
  type Action,
  type Actor,
  type ReviewedTicket,
  type RuleKey,
  type Ticket,
  type Verdict,
} from "./types";

export function review(actor: Actor, rows: readonly Ticket[]): ReviewedTicket[] {
  const ability = abilityFor(actor);

  return rows.map((ticket) => {
    // Копия, а не сама строка: `subject` помечает объект, а фикстура общая
    const row = subject("Ticket", { ...ticket });

    const verdicts = Object.fromEntries(
      actions.map((action): [Action, Verdict] => [
        action,
        {
          allowed: ability.can(action, row),
          naive: allowedNaively(actor, action),
          rule: ability.relevantRuleFor(action, row)?.reason as RuleKey | undefined,
        },
      ]),
    ) as Record<Action, Verdict>;

    return { ticket, verdicts };
  });
}

export const divergences = (rows: readonly ReviewedTicket[]) =>
  rows.reduce(
    (total, row) =>
      total + Object.values(row.verdicts).filter((v) => v.allowed !== v.naive).length,
    0,
  );
