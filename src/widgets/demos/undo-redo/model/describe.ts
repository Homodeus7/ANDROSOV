import type { FlowAction } from "@/entities/flow";

export function describeAction(action: FlowAction): { target: string; detail: string } {
  switch (action.type) {
    case "CreateNode":
      return { target: action.nodeId, detail: action.name };
    case "DeleteNode":
      return { target: action.nodeId, detail: "" };
    case "MoveNode":
      return { target: action.nodeId, detail: `${action.x} · ${action.y}` };
    case "SetNodeName":
      return { target: action.nodeId, detail: action.name };
    case "ConnectPorts":
    case "DisconnectPorts":
      return { target: `${action.from} → ${action.to}`, detail: "" };
  }
}
