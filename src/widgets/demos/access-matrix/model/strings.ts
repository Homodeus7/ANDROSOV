import type { Action, Role, RuleKey, TicketKind, TicketStatus } from "@/entities/access";

export type AccessMatrixStrings = {
  roles: Record<Role, string>;
  actions: Record<Action, string>;
  kinds: Record<TicketKind, string>;
  statuses: Record<TicketStatus, string>;
  rules: Record<RuleKey, string>;
  naive: string;
  columns: { id: string; flat: string; kind: string; status: string; assignee: string };
  unassigned: string;
  redacted: string;
  ask: string;
  allowed: string;
  denied: string;
  noRule: string;
  byRole: string;
  visible: string;
  diverges: string;
  hint: string;
  note: string;
};
