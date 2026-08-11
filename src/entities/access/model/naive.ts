import type { Action, Actor, Role } from "./types";

const BY_ROLE: Record<Action, readonly Role[]> = {
  read: ["operator", "dispatcher", "accountant", "resident"],
  assign: ["operator", "dispatcher"],
  close: ["dispatcher", "resident"],
  invoice: ["accountant"],
};

/**
 * Как это выглядело до правил: проверка по роли прямо в компоненте. Заявку сюда
 * даже нечем передать — в этом и дефект, о строке такая проверка не знает ничего.
 */
export const allowedNaively = (actor: Actor, action: Action) =>
  BY_ROLE[action].includes(actor.role);
