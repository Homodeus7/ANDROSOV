import type { Actor, Role, Ticket } from "./types";

export const DISPATCHER = "u-disp";

export const actors: Record<Role, Actor> = {
  operator: { id: "u-op", role: "operator" },
  dispatcher: { id: DISPATCHER, role: "dispatcher" },
  accountant: { id: "u-acc", role: "accountant" },
  resident: { id: "u-res", role: "resident", flat: "42" },
};

/**
 * Восемь строк подобраны так, чтобы у каждой роли нашлись и разрешённые, и
 * запрещённые: на одинаковых строках демо не показало бы ничего.
 */
export const tickets: Ticket[] = [
  { id: "TCK-1041", flat: "42", kind: "leak", status: "done", assignee: DISPATCHER },
  { id: "TCK-1042", flat: "42", kind: "heating", status: "assigned", assignee: "u-tech" },
  { id: "TCK-1043", flat: "17", kind: "lift", status: "new" },
  { id: "TCK-1044", flat: "17", kind: "noise", status: "done", assignee: DISPATCHER },
  { id: "TCK-1045", flat: "8", kind: "heating", status: "assigned", assignee: DISPATCHER },
  { id: "TCK-1046", flat: "8", kind: "leak", status: "new" },
  { id: "TCK-1047", flat: "42", kind: "noise", status: "new" },
  { id: "TCK-1048", flat: "23", kind: "lift", status: "done", assignee: "u-tech" },
];
