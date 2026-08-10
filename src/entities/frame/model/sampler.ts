const WINDOW = 120;
const BUDGET_MS = 1000 / 60;

/**
 * Кадр считается потерянным не по превышению бюджета, а по полутора бюджетам:
 * на 60 Гц метки rAF гуляют вокруг 17 мс, и строгий порог красил бы совершенно
 * ровную картинку в «половина кадров пропущена».
 */
const DROP_MS = BUDGET_MS * 1.5;

export type FrameStats = {
  fps: number;
  p50: number;
  p95: number;
  /** Доля потерянных кадров в окне, проценты */
  dropped: number;
  samples: number;
};

export const EMPTY_STATS: FrameStats = { fps: 0, p50: 0, p95: 0, dropped: 0, samples: 0 };

const round1 = (value: number) => Math.round(value * 10) / 10;

const percentile = (sorted: readonly number[], q: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)]!;

/**
 * Кольцевой буфер, а не растущий массив: сэмплер работает внутри кадра, и
 * измеритель, который сам аллоцирует на каждом кадре, испортил бы измерение.
 */
export function createSampler(size: number = WINDOW) {
  const deltas = new Float64Array(size);
  let filled = 0;
  let next = 0;

  function ordered() {
    const start = filled === size ? next : 0;
    const out: number[] = [];
    for (let index = 0; index < filled; index += 1) out.push(deltas[(start + index) % size]!);
    return out;
  }

  return {
    push(delta: number) {
      deltas[next] = delta;
      next = (next + 1) % size;
      if (filled < size) filled += 1;
    },
    reset() {
      filled = 0;
      next = 0;
    },
    recent: ordered,
    stats(): FrameStats {
      if (filled === 0) return EMPTY_STATS;

      const values = ordered();
      let total = 0;
      let dropped = 0;
      for (const value of values) {
        total += value;
        if (value > DROP_MS) dropped += 1;
      }

      const sorted = [...values].sort((a, b) => a - b);

      return {
        fps: Math.round(1000 / (total / values.length)),
        p50: round1(percentile(sorted, 0.5)),
        p95: round1(percentile(sorted, 0.95)),
        dropped: Math.round((dropped / values.length) * 100),
        samples: values.length,
      };
    },
  };
}

export type FrameSampler = ReturnType<typeof createSampler>;
