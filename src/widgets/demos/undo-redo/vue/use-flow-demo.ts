import { computed, ref, shallowRef } from "vue";
import {
  CANVAS_SPAN,
  applyAction,
  canRedo,
  canUndo,
  createHistory,
  normalizeActions,
  pendingActions,
  record,
  redo,
  seedScene,
  seek,
  undo,
  type FlowAction,
} from "@/entities/flow";
import type { FlowDemoStrings } from "../model/strings";

export function useFlowDemo(strings: FlowDemoStrings) {
  const history = shallowRef(createHistory(seedScene(strings.seedNames)));
  const selected = ref<string | null>(null);
  const connecting = ref(false);
  const spawned = ref(0);
  const dragged = ref<{ id: string; x: number; y: number } | null>(null);
  const signals = ref(0);

  const scene = computed(() => history.value.scene);

  // Предпросмотр перетаскивания — то же действие, только не записанное:
  // блок едет за курсором, а в буфер уходит одна конечная точка на жест
  const view = computed(() =>
    dragged.value
      ? applyAction(scene.value, {
          type: "MoveNode",
          nodeId: dragged.value.id,
          x: dragged.value.x,
          y: dragged.value.y,
        })
      : scene.value,
  );

  const buffer = computed(() => pendingActions(history.value));
  const normalized = computed(() => normalizeActions(buffer.value));
  const savedShare = computed(() =>
    signals.value === 0
      ? 0
      : Math.round((1 - normalized.value.actions.length / signals.value) * 100),
  );

  function apply(action: FlowAction) {
    signals.value += 1;
    history.value = record(history.value, action);
  }

  function addBlock() {
    const id = `t${spawned.value + 1}`;
    spawned.value += 1;
    apply({
      type: "CreateNode",
      nodeId: id,
      x: (240 + spawned.value * 170) % (CANVAS_SPAN + 1),
      y: (620 + spawned.value * 130) % (CANVAS_SPAN + 1),
      name: `${strings.newBlockName} ${spawned.value}`,
      kind: "task",
    });
    selected.value = id;
    connecting.value = false;
  }

  function pick(id: string) {
    const from = selected.value;
    if (!connecting.value || from === null || from === id) {
      selected.value = selected.value === id ? null : id;
      connecting.value = false;
      return;
    }

    const linked = scene.value.edges.some((edge) => edge.from === from && edge.to === id);
    apply({ type: linked ? "DisconnectPorts" : "ConnectPorts", from, to: id });
    connecting.value = false;
  }

  function dragTo(id: string, x: number, y: number) {
    signals.value += 1;
    dragged.value = { id, x, y };
  }

  function dropBlock() {
    const drop = dragged.value;
    dragged.value = null;
    if (drop) apply({ type: "MoveNode", nodeId: drop.id, x: drop.x, y: drop.y });
  }

  function rename(name: string) {
    if (selected.value) apply({ type: "SetNodeName", nodeId: selected.value, name });
  }

  function remove() {
    if (!selected.value) return;
    apply({ type: "DeleteNode", nodeId: selected.value });
    selected.value = null;
    connecting.value = false;
  }

  function reset() {
    history.value = createHistory(seedScene(strings.seedNames));
    selected.value = null;
    connecting.value = false;
    spawned.value = 0;
    dragged.value = null;
    signals.value = 0;
  }

  return {
    scene,
    view,
    buffer,
    normalized,
    savedShare,
    signals,
    selected,
    connecting,
    position: computed(() => history.value.position),
    total: computed(() => history.value.actions.length),
    selectedBlock: computed(
      () => scene.value.blocks.find((block) => block.id === selected.value) ?? null,
    ),
    canUndo: computed(() => canUndo(history.value)),
    canRedo: computed(() => canRedo(history.value)),
    addBlock,
    pick,
    dragTo,
    dropBlock,
    rename,
    remove,
    reset,
    undo: () => (history.value = undo(history.value)),
    redo: () => (history.value = redo(history.value)),
    seekTo: (position: number) => (history.value = seek(history.value, position)),
    toggleConnect: () => (connecting.value = selected.value !== null && !connecting.value),
  };
}

export type FlowDemoState = ReturnType<typeof useFlowDemo>;
