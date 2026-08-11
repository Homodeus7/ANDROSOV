import { createRandom } from "@/shared/lib";
import type { Sample } from "./types";

export type StreamOptions = { late: boolean; gap: boolean };

/** Событий на виртуальную секунду вне всплеска. */
const RATE = 25;
const BURST_EVERY = 17_000;
const BURST_MS = 2_500;
const BURST_RATE = 4;
const GAP_EVERY = 40_000;
const GAP_MS = 8_000;
const LATE_SHARE = 0.05;
const LATE_MIN = 2_000;
const LATE_MAX = 8_000;

/** Медиана латентности ~120 мс; хвост даёт логнормаль, всплеск сдвигает медиану. */
const MU = Math.log(120);
const SIGMA = 0.55;
const BURST_MU = 0.9;

/**
 * Латентность логнормальна, всплески сгущают поток и утяжеляют хвост. Без
 * хвоста и без неравной наполненности бакетов ломать в `avg` и `p95` нечего:
 * ровный поток складывается ровно, и ошибка свёртки не видна.
 */
export function createStream(seed: number) {
  let random = createRandom(seed);
  let clock = 0;
  let carry = 0;

  const gauss = () => {
    const uniform = Math.max(random(), 1e-9);
    return Math.sqrt(-2 * Math.log(uniform)) * Math.cos(2 * Math.PI * random());
  };

  return {
    get clock() {
      return clock;
    },
    advance(elapsed: number, options: StreamOptions): Sample[] {
      const start = clock;
      clock += elapsed;

      const bursting = start % BURST_EVERY < BURST_MS;
      carry += (RATE * (bursting ? BURST_RATE : 1) * elapsed) / 1000;
      const count = Math.floor(carry);
      carry -= count;

      const samples: Sample[] = [];

      for (let index = 0; index < count; index += 1) {
        const arrival = start + random() * elapsed;
        const delay =
          options.late && random() < LATE_SHARE
            ? LATE_MIN + random() * (LATE_MAX - LATE_MIN)
            : 0;
        const value = Math.exp(MU + (bursting ? BURST_MU : 0) + SIGMA * gauss());
        const time = arrival - delay;

        // Молчание отмеряется по часам события, а не по границе кадра: иначе
        // в тишину попадала бы горсть событий с краёв кадра, и дыры в бакете
        // не получалось бы вовсе
        if (options.gap && time % GAP_EVERY < GAP_MS) continue;

        samples.push({ time, arrival, value });
      }

      return samples;
    },
    reset() {
      random = createRandom(seed);
      clock = 0;
      carry = 0;
    },
  };
}

export type Stream = ReturnType<typeof createStream>;
