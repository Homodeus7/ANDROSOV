export type Sample = {
  /** Когда событие произошло. */
  time: number;
  /** Когда о нём узнали. У опоздавшего события больше времени. */
  arrival: number;
  value: number;
};

/** Всё, что бэкенд отдаёт за бакет: сырых значений в ответе уже нет. */
export type Summary = { count: number; sum: number; p95: number };

/** Пустой бакет — `undefined`. Ноль означал бы, что измерение было. */
export type Point = number | undefined;
