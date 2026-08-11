import type { Member } from "./types";

const leaf = (id: string, volume: number): Member => ({ id, volume, children: [] });

/**
 * Три уровня и двенадцать участников: дальше дерево перестаёт читаться на
 * телефоне, а показать надо распределение, а не размер команды.
 */
export const team: Member = {
  id: "0x7a41",
  volume: 184_000,
  children: [
    {
      id: "0x93c2",
      volume: 96_500,
      children: [leaf("0x1d08", 41_250), leaf("0xb672", 12_700), leaf("0x5e19", 8_333)],
    },
    {
      id: "0xc4af",
      volume: 73_900,
      children: [leaf("0x2f60", 55_100), leaf("0x8ad3", 3_050)],
    },
    {
      id: "0x6b25",
      volume: 11_400,
      children: [leaf("0xe907", 9_990), leaf("0x30fc", 7_777), leaf("0xa15b", 1_001)],
    },
  ],
};

export function flatten(member: Member): Member[] {
  return [member, ...member.children.flatMap(flatten)];
}
