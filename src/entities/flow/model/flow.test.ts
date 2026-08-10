import { describe, expect, it } from "vitest";
import {
  canRedo,
  canUndo,
  createHistory,
  pendingActions,
  record,
  sceneAt,
  seek,
  undo,
} from "./history";
import { normalizeActions } from "./normalize";
import { applyAction, foldScene } from "./scene";
import { seedScene } from "./seed";
import type { FlowAction, Scene } from "./types";

const base = seedScene(["Start", "Check", "Route", "Notify", "Done"]);

const move = (nodeId: string, x: number, y: number): FlowAction => ({
  type: "MoveNode",
  nodeId,
  x,
  y,
});

function collect(actions: readonly FlowAction[]) {
  const result = normalizeActions(actions);
  return { sent: result.actions, marks: result.marks };
}

describe("applyAction", () => {
  it("returns the very same scene when nothing changed", () => {
    expect(applyAction(base, move("n1", 0, 0))).toBe(base);
    expect(applyAction(base, { type: "ConnectPorts", from: "n1", to: "n2" })).toBe(base);
    expect(applyAction(base, { type: "DeleteNode", nodeId: "nope" })).toBe(base);
  });

  it("drops the edges of a deleted block", () => {
    const next = applyAction(base, { type: "DeleteNode", nodeId: "n2" });
    expect(next.blocks).toHaveLength(4);
    expect(next.edges.some((edge) => edge.from === "n2" || edge.to === "n2")).toBe(false);
  });
});

describe("normalizeActions", () => {
  it("collapses a drag into its final position", () => {
    const drag = [move("n1", 30, 24), move("n1", 44, 30), move("n1", 60, 40)];
    const { sent, marks } = collect(drag);

    expect(sent).toEqual([move("n1", 60, 40)]);
    expect(marks).toEqual(["lastWrite", "lastWrite", null]);
  });

  it("keeps the last position of each block separately", () => {
    const { sent } = collect([move("n1", 1, 1), move("n2", 2, 2), move("n1", 3, 3)]);
    expect(sent).toEqual([move("n2", 2, 2), move("n1", 3, 3)]);
  });

  it("erases a block that was born and died inside the buffer", () => {
    const { sent, marks } = collect([
      { type: "CreateNode", nodeId: "tmp", x: 0, y: 0, name: "Tmp", kind: "task" },
      move("tmp", 40, 40),
      { type: "ConnectPorts", from: "n1", to: "tmp" },
      { type: "SetNodeName", nodeId: "tmp", name: "Renamed" },
      { type: "DeleteNode", nodeId: "tmp" },
    ]);

    expect(sent).toEqual([]);
    expect(marks.every((mark) => mark === "ephemeral")).toBe(true);
  });

  it("keeps a block that outlives the buffer", () => {
    const { sent } = collect([
      { type: "CreateNode", nodeId: "tmp", x: 0, y: 0, name: "Tmp", kind: "task" },
      move("tmp", 40, 40),
    ]);
    expect(sent).toHaveLength(2);
  });

  it("cancels a connection undone in the same buffer", () => {
    const { sent, marks } = collect([
      { type: "ConnectPorts", from: "n1", to: "n4" },
      move("n1", 30, 30),
      { type: "DisconnectPorts", from: "n1", to: "n4" },
    ]);

    expect(sent).toEqual([move("n1", 30, 30)]);
    expect(marks).toEqual(["paired", null, "paired"]);
  });

  it("keeps a disconnect of an edge that predates the buffer", () => {
    const { sent } = collect([{ type: "DisconnectPorts", from: "n1", to: "n2" }]);
    expect(sent).toHaveLength(1);
  });
});

describe("normalizeActions — свёртка не меняет результат", () => {
  const ids = ["n1", "n2", "n3", "n4", "n5", "extra"];

  function nextAction(seed: number, scene: Scene): FlowAction {
    const pick = <T>(items: readonly T[], salt: number) =>
      items[(seed * 31 + salt * 17) % items.length]!;
    const block = scene.blocks.length > 0 ? pick(scene.blocks, 3) : null;

    switch (seed % 6) {
      case 0:
        return {
          type: "CreateNode",
          nodeId: `t${seed}`,
          x: seed % 400,
          y: seed % 200,
          name: `T${seed}`,
          kind: "task",
        };
      case 1:
        return { type: "DeleteNode", nodeId: block?.id ?? "n1" };
      case 2:
        return { type: "SetNodeName", nodeId: block?.id ?? "n1", name: `N${seed}` };
      case 3:
        return { type: "ConnectPorts", from: pick(ids, 1), to: pick(ids, 5) };
      case 4:
        return { type: "DisconnectPorts", from: pick(ids, 2), to: pick(ids, 7) };
      default:
        return move(block?.id ?? "n1", seed % 400, seed % 200);
    }
  }

  it("folds to the same scene over a long generated session", () => {
    for (let run = 0; run < 40; run += 1) {
      let history = createHistory(base);
      for (let step = 1; step <= 60; step += 1) {
        history = record(history, nextAction(run * 97 + step * 13, sceneAt(history)));
      }

      const raw = pendingActions(history);
      const { actions: sent } = normalizeActions(raw);

      expect(foldScene(base, sent), `run ${run}`).toEqual(foldScene(base, raw));
      expect(sent.length).toBeLessThanOrEqual(raw.length);
    }
  });
});

describe("history", () => {
  it("skips an action that changes nothing", () => {
    const history = record(createHistory(base), move("n1", 0, 0));
    expect(history.actions).toHaveLength(0);
  });

  it("rewinds without losing the redo tail", () => {
    let history = record(createHistory(base), move("n1", 100, 100));
    history = record(history, move("n2", 200, 200));
    history = undo(history);

    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(true);
    expect(sceneAt(history).blocks.find((block) => block.id === "n2")?.x).toBe(500);
  });

  it("drops the redo tail once a new action lands", () => {
    let history = record(createHistory(base), move("n1", 100, 100));
    history = record(history, move("n2", 200, 200));
    history = seek(history, 1);
    history = record(history, move("n3", 300, 300));

    expect(history.actions).toHaveLength(2);
    expect(canRedo(history)).toBe(false);
  });

  it("sends only what happened before the scrubber", () => {
    let history = record(createHistory(base), move("n1", 100, 100));
    history = record(history, move("n2", 200, 200));

    expect(pendingActions(seek(history, 1))).toHaveLength(1);
  });
});
