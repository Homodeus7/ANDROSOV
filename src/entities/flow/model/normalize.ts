import type { FlowAction, NormalizeRule } from "./types";

export type NormalizeResult = {
  /** Что реально уезжает на сервер. */
  actions: FlowAction[];
  /** Правило, погасившее действие, по индексам исходного буфера. */
  marks: (NormalizeRule | null)[];
};

const COLLAPSIBLE = new Set(["MoveNode", "SetNodeName"]);

function touchedNodes(action: FlowAction): string[] {
  switch (action.type) {
    case "ConnectPorts":
    case "DisconnectPorts":
      return [action.from, action.to];
    default:
      return [action.nodeId];
  }
}

function edgeKey(action: FlowAction) {
  return action.type === "ConnectPorts" || action.type === "DisconnectPorts"
    ? `${action.from}→${action.to}`
    : null;
}

export function normalizeActions(actions: readonly FlowAction[]): NormalizeResult {
  const marks: (NormalizeRule | null)[] = actions.map(() => null);

  const created = new Set<string>();
  const ephemeral = new Set<string>();
  for (const action of actions) {
    if (action.type === "CreateNode") created.add(action.nodeId);
    if (action.type === "DeleteNode" && created.has(action.nodeId))
      ephemeral.add(action.nodeId);
  }

  // Узел, родившийся и умерший внутри буфера, сервер не видел никогда —
  // ни его самого, ни рёбер к нему, ни правок по дороге
  actions.forEach((action, index) => {
    if (touchedNodes(action).some((node) => ephemeral.has(node))) marks[index] = "ephemeral";
  });

  // Связал и тут же развязал — на сервере не изменилось ничего.
  // Гасим только последнее непогашенное соединение того же ребра
  const openConnects = new Map<string, number[]>();
  actions.forEach((action, index) => {
    if (marks[index]) return;
    const key = edgeKey(action);
    if (!key) return;

    if (action.type === "ConnectPorts") {
      const stack = openConnects.get(key) ?? [];
      stack.push(index);
      openConnects.set(key, stack);
      return;
    }

    const opened = openConnects.get(key)?.pop();
    if (opened === undefined) return;
    marks[opened] = "paired";
    marks[index] = "paired";
  });

  // Перетаскивание — это сотни MoveNode. Серверу нужна конечная точка,
  // а не траектория курсора: держим только последнюю запись на узел
  const lastWrite = new Set<string>();
  for (let index = actions.length - 1; index >= 0; index -= 1) {
    const action = actions[index]!;
    if (marks[index] || !COLLAPSIBLE.has(action.type)) continue;

    const key = `${action.type}:${touchedNodes(action)[0]}`;
    if (lastWrite.has(key)) marks[index] = "lastWrite";
    else lastWrite.add(key);
  }

  return { actions: actions.filter((_, index) => marks[index] === null), marks };
}
