export const roles = ["operator", "dispatcher", "accountant", "resident"] as const;

export type Role = (typeof roles)[number];

export const actions = ["read", "assign", "close", "invoice"] as const;

export type Action = (typeof actions)[number];

export const ticketStatuses = ["new", "assigned", "done"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketKinds = ["leak", "heating", "lift", "noise"] as const;

export type TicketKind = (typeof ticketKinds)[number];

export type Ticket = {
  id: string;
  flat: string;
  kind: TicketKind;
  status: TicketStatus;
  /** Пусто — заявка ещё ни на кого не назначена. */
  assignee?: string;
};

export type Actor = {
  id: string;
  role: Role;
  /** Только у жильца: его квартира и есть граница видимости. */
  flat?: string;
};

export const ruleKeys = [
  "operator.read",
  "operator.assign",
  "dispatcher.read",
  "dispatcher.assign",
  "dispatcher.close",
  "accountant.read",
  "accountant.invoice",
  "resident.read",
  "resident.close",
] as const;

export type RuleKey = (typeof ruleKeys)[number];

export type Verdict = {
  allowed: boolean;
  /** Тот же вопрос, заданный проверкой по роли. */
  naive: boolean;
  /** Правило, давшее `allowed`. Пусто — не нашлось ни одного, то есть запрет. */
  rule?: RuleKey;
};

export type ReviewedTicket = { ticket: Ticket; verdicts: Record<Action, Verdict> };
