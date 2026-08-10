export type BlockKind = "start" | "task" | "gateway" | "end";

export type Block = {
  id: string;
  x: number;
  y: number;
  name: string;
  kind: BlockKind;
};

export type Edge = { from: string; to: string };

export type Scene = {
  blocks: readonly Block[];
  edges: readonly Edge[];
};

export type FlowAction =
  | { type: "CreateNode"; nodeId: string; x: number; y: number; name: string; kind: BlockKind }
  | { type: "DeleteNode"; nodeId: string }
  | { type: "MoveNode"; nodeId: string; x: number; y: number }
  | { type: "SetNodeName"; nodeId: string; name: string }
  | { type: "ConnectPorts"; from: string; to: string }
  | { type: "DisconnectPorts"; from: string; to: string };

export type FlowActionType = FlowAction["type"];

export type NormalizeRule = "ephemeral" | "paired" | "lastWrite";
