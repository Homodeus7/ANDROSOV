import type { Sample } from "./types";

/**
 * Три `Float64Array` вместо массива объектов: в буфере десятки тысяч событий,
 * и он переписывается каждый кадр. Порядок обхода — порядок записи, а не
 * времени: опоздавшее событие приходит позже своего соседа по шкале.
 */
export function createRing(capacity: number) {
  const time = new Float64Array(capacity);
  const arrival = new Float64Array(capacity);
  const value = new Float64Array(capacity);
  let length = 0;
  let next = 0;

  return {
    get length() {
      return length;
    },
    get capacity() {
      return capacity;
    },
    push(sample: Sample) {
      time[next] = sample.time;
      arrival[next] = sample.arrival;
      value[next] = sample.value;
      next = (next + 1) % capacity;
      if (length < capacity) length += 1;
    },
    each(visit: (time: number, arrival: number, value: number) => void) {
      const start = length < capacity ? 0 : next;
      for (let step = 0; step < length; step += 1) {
        const index = (start + step) % capacity;
        visit(time[index]!, arrival[index]!, value[index]!);
      }
    },
    clear() {
      length = 0;
      next = 0;
    },
  };
}

export type Ring = ReturnType<typeof createRing>;
