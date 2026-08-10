import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { createSampler, EMPTY_STATS, type FrameStats } from "@/entities/frame";

export type FpsMode = "naive" | "budget";

export const BLOCK_COUNTS = [40, 120, 240] as const;

const REPORT_MS = 250;
const WARMUP_FRAMES = 30;

export type FrameListener = (clock: number) => void;

/**
 * Цикл кадров живёт здесь, а не в компоненте сцены: режимы должны меряться
 * одним и тем же секундомером, иначе сравнение ничего не стоит.
 */
export function useFpsDemo() {
  const mode = ref<FpsMode>("naive");
  const count = ref<number>(BLOCK_COUNTS[1]);
  const running = ref(true);
  const stats = shallowRef<FrameStats>(EMPTY_STATS);
  const strip = shallowRef<number[]>([]);
  const results = shallowRef<Partial<Record<FpsMode, FrameStats>>>({});
  const readsPerFrame = ref(0);
  const wasted = ref(0);
  const awake = ref(false);

  // Обычный объект, а не ref: счётчик растёт сотни раз за кадр, и реактивность
  // на нём мерила бы саму себя
  const reads = { current: 0 };

  const sampler = createSampler();
  const listeners = new Set<FrameListener>();

  let handle = 0;
  let last = 0;
  let clock = 0;
  let warmup = WARMUP_FRAMES;
  let reported = 0;
  let idleFrames = 0;
  let lastReads = 0;

  function report(now: number) {
    reported = now;
    readsPerFrame.value = lastReads;
    wasted.value = idleFrames;
    stats.value = sampler.stats();
    strip.value = sampler.recent();
    if (running.value && stats.value.samples >= WARMUP_FRAMES)
      results.value = { ...results.value, [mode.value]: stats.value };
  }

  function frame(now: number) {
    handle = requestAnimationFrame(frame);

    const delta = last === 0 ? 0 : now - last;
    last = now;
    if (running.value) clock += delta;
    else idleFrames += 1;

    // Замеры считаются с отставанием на кадр: Vue перерисовывает сцену
    // микротаской после rAF, и счётчик закрывается только к следующему кадру
    lastReads = reads.current;
    reads.current = 0;
    for (const listener of listeners) listener(clock);

    if (warmup > 0) warmup -= 1;
    else if (delta > 0) sampler.push(delta);

    if (now - reported > REPORT_MS) report(now);
  }

  function start() {
    if (handle !== 0) return;
    last = 0;
    warmup = WARMUP_FRAMES;
    sampler.reset();
    awake.value = true;
    handle = requestAnimationFrame(frame);
  }

  function stop() {
    if (handle === 0) return;
    cancelAnimationFrame(handle);
    handle = 0;
    awake.value = false;
  }

  // Холостой цикл — часть наивного режима, а не оплошность демо: он и есть то,
  // что убрано в бюджетном. На паузе бюджетный кадр не планируется вовсе
  function sync() {
    if (running.value || mode.value === "naive") start();
    else stop();
  }

  watch([mode, count], () => {
    sampler.reset();
    warmup = WARMUP_FRAMES;
    idleFrames = 0;
    wasted.value = 0;
    stats.value = EMPTY_STATS;
    strip.value = [];
    last = 0;
  });

  watch([running, mode], sync, { immediate: true });
  onBeforeUnmount(stop);

  return {
    mode,
    count,
    running,
    stats,
    strip,
    results,
    readsPerFrame,
    wasted,
    awake,
    reads,
    onFrame(listener: FrameListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setMode: (next: FpsMode) => (mode.value = next),
    setCount: (next: number) => (count.value = next),
    toggleRunning: () => (running.value = !running.value),
    reset() {
      results.value = {};
      idleFrames = 0;
      wasted.value = 0;
      sampler.reset();
      warmup = WARMUP_FRAMES;
      stats.value = EMPTY_STATS;
      strip.value = [];
    },
  };
}

export type FpsDemoState = ReturnType<typeof useFpsDemo>;
