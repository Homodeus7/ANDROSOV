import { flatten } from "./tree";
import type { Member } from "./types";

const volumeOf = (members: Member[]) =>
  members.reduce((total, member) => total + member.volume, 0);

/**
 * Метод наибольшего остатка: доли режутся вниз до целого цента, а остаток
 * раздаётся по одному центу тем, у кого дробная часть была больше. Дороже
 * округления на строку ровно одной сортировкой — и только так сумма выплат
 * сходится с пулом при любом пуле.
 */
export function distribute(pool: number, root: Member): Map<string, number> {
  const members = flatten(root);
  const volume = volumeOf(members);

  const parts = members.map((member) => {
    const exact = (pool * member.volume) / volume;
    const cents = Math.floor(exact);
    return { id: member.id, cents, rest: exact - cents };
  });

  const shares = new Map(parts.map((part) => [part.id, part.cents]));
  let left = pool - parts.reduce((total, part) => total + part.cents, 0);

  // Порядок разрешения ничьих задан явно: иначе выплата зависела бы от того,
  // как сортировка обошлась с равными остатками сегодня
  const queue = [...parts].sort((a, b) => b.rest - a.rest || a.id.localeCompare(b.id));

  for (const part of queue) {
    if (left === 0) break;
    shares.set(part.id, shares.get(part.id)! + 1);
    left -= 1;
  }

  return shares;
}

/** Округление на каждой строке по отдельности — и никто не сводит итог. */
export function distributeNaively(pool: number, root: Member): Map<string, number> {
  const members = flatten(root);
  const volume = volumeOf(members);

  return new Map(
    members.map((member) => [member.id, Math.round((pool * member.volume) / volume)]),
  );
}

export const paid = (shares: Map<string, number>) =>
  [...shares.values()].reduce((total, cents) => total + cents, 0);

export const subtotal = (member: Member, shares: Map<string, number>): number =>
  flatten(member).reduce((total, item) => total + (shares.get(item.id) ?? 0), 0);
