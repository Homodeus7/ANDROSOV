import type { Block, FlowAction, Scene } from "./types";

export const EMPTY_SCENE: Scene = { blocks: [], edges: [] };

function findEdge(scene: Scene, from: string, to: string) {
  return scene.edges.some((edge) => edge.from === from && edge.to === to);
}

function patchBlock(scene: Scene, nodeId: string, patch: Partial<Block>): Scene {
  const current = scene.blocks.find((block) => block.id === nodeId);
  if (!current) return scene;

  const keys = Object.keys(patch) as (keyof Block)[];
  if (keys.every((key) => current[key] === patch[key])) return scene;

  return {
    ...scene,
    blocks: scene.blocks.map((block) => (block.id === nodeId ? { ...block, ...patch } : block)),
  };
}

/**
 * Действие, ничего не изменившее, возвращает ту же сцену по ссылке. На этом
 * держится инвариант буфера: в лог попадают только действия с эффектом,
 * поэтому свёртке не приходится разбирать дубликаты и холостые пары.
 */
export function applyAction(scene: Scene, action: FlowAction): Scene {
  switch (action.type) {
    case "CreateNode":
      return scene.blocks.some((block) => block.id === action.nodeId)
        ? scene
        : {
            ...scene,
            blocks: [
              ...scene.blocks,
              {
                id: action.nodeId,
                x: action.x,
                y: action.y,
                name: action.name,
                kind: action.kind,
              },
            ],
          };

    case "DeleteNode":
      return scene.blocks.some((block) => block.id === action.nodeId)
        ? {
            blocks: scene.blocks.filter((block) => block.id !== action.nodeId),
            edges: scene.edges.filter(
              (edge) => edge.from !== action.nodeId && edge.to !== action.nodeId,
            ),
          }
        : scene;

    case "MoveNode":
      return patchBlock(scene, action.nodeId, { x: action.x, y: action.y });

    case "SetNodeName":
      return patchBlock(scene, action.nodeId, { name: action.name });

    case "ConnectPorts":
      return findEdge(scene, action.from, action.to)
        ? scene
        : { ...scene, edges: [...scene.edges, { from: action.from, to: action.to }] };

    case "DisconnectPorts":
      return findEdge(scene, action.from, action.to)
        ? {
            ...scene,
            edges: scene.edges.filter(
              (edge) => !(edge.from === action.from && edge.to === action.to),
            ),
          }
        : scene;
  }
}

export function foldScene(base: Scene, actions: readonly FlowAction[]): Scene {
  return actions.reduce(applyAction, base);
}
