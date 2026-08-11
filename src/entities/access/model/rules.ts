import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability";
import type { Action, Actor, RuleKey, Ticket } from "./types";

export type AppAbility = MongoAbility<[Action, "Ticket" | Ticket]>;

/**
 * Весь домен прав — этот файл. Новая роль здесь одна ветка, а не проверки,
 * расползшиеся по компонентам. Условие в третьем аргументе — то, ради чего
 * правила вообще выносят: право зависит от строки, а не только от роли.
 */
export function abilityFor(actor: Actor): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const allow = (key: RuleKey, action: Action, on?: Partial<Ticket>) =>
    can(action, "Ticket", on).because(key);

  switch (actor.role) {
    case "operator":
      allow("operator.read", "read");
      allow("operator.assign", "assign", { status: "new" });
      break;
    case "dispatcher":
      allow("dispatcher.read", "read");
      allow("dispatcher.assign", "assign");
      allow("dispatcher.close", "close", { assignee: actor.id });
      break;
    case "accountant":
      allow("accountant.read", "read");
      allow("accountant.invoice", "invoice", { status: "done" });
      break;
    case "resident":
      allow("resident.read", "read", { flat: actor.flat });
      allow("resident.close", "close", { flat: actor.flat, status: "done" });
      break;
  }

  return build();
}
