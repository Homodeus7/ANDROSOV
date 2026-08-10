import { applyAction, foldScene } from "./scene";
import type { FlowAction, Scene } from "./types";

/**
 * Отмена здесь — не обратное действие, а свёртка префикса буфера. Поэтому
 * новый тип операции не требует писать к нему инверсию: достаточно уметь его
 * применить. Ровно это и позволяет одному буферу покрыть все 40+ типов.
 *
 * `scene` — кеш свёртки на текущей позиции. Без него перетаскивание, которое
 * пишет действие на каждый кадр, пересобирало бы весь префикс на каждый кадр.
 */
export type FlowHistory = {
  base: Scene;
  actions: readonly FlowAction[];
  position: number;
  scene: Scene;
};

export function createHistory(base: Scene): FlowHistory {
  return { base, actions: [], position: 0, scene: base };
}

export function sceneAt(history: FlowHistory, position = history.position): Scene {
  return position === history.position
    ? history.scene
    : foldScene(history.base, history.actions.slice(0, position));
}

export function pendingActions(history: FlowHistory): readonly FlowAction[] {
  return history.actions.slice(0, history.position);
}

export function record(history: FlowHistory, action: FlowAction): FlowHistory {
  const scene = applyAction(history.scene, action);
  if (scene === history.scene) return history;

  return {
    base: history.base,
    actions: [...history.actions.slice(0, history.position), action],
    position: history.position + 1,
    scene,
  };
}

export function seek(history: FlowHistory, position: number): FlowHistory {
  const clamped = Math.max(0, Math.min(history.actions.length, Math.round(position)));
  if (clamped === history.position) return history;

  return { ...history, position: clamped, scene: sceneAt(history, clamped) };
}

export function undo(history: FlowHistory) {
  return seek(history, history.position - 1);
}

export function redo(history: FlowHistory) {
  return seek(history, history.position + 1);
}

export function canUndo(history: FlowHistory) {
  return history.position > 0;
}

export function canRedo(history: FlowHistory) {
  return history.position < history.actions.length;
}
