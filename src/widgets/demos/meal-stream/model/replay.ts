import { mulberry32, type Recording } from "./recording";

type Chunk = { delay: number; bytes: Uint8Array };

const concat = (left: Uint8Array, right: Uint8Array) => {
  const joined = new Uint8Array(left.length + right.length);
  joined.set(left);
  joined.set(right, left.length);
  return joined;
};

/**
 * Сеть режет поток где придется, а не по кадрам: границы чанков случайны
 * и ложатся хоть посреди JSON, хоть посреди двухбайтовой буквы.
 */
export function toChunks(recording: Recording, seed: number): Chunk[] {
  const encoder = new TextEncoder();
  const random = mulberry32(seed);
  const chunks: Chunk[] = [];

  for (const [index, frame] of recording.frames.entries()) {
    const whole = encoder.encode(frame.text);
    const cut = index === recording.cutAt;
    const bytes = cut ? whole.slice(0, Math.floor(whole.length * 0.6)) : whole;

    const splits = cut ? 1 : Math.floor(random() * 3);
    const bounds = Array.from({ length: splits }, () =>
      Math.max(1, Math.floor(random() * bytes.length)),
    ).sort((left, right) => left - right);
    const edges = [0, ...new Set(bounds), bytes.length];

    for (let piece = 0; piece < edges.length - 1; piece += 1) {
      const slice = bytes.slice(edges[piece], edges[piece + 1]);
      if (slice.length === 0) continue;

      const delay = piece === 0 ? frame.delay : 20 + Math.round(random() * 60);
      const last = chunks.at(-1);
      if (delay === 0 && last) last.bytes = concat(last.bytes, slice);
      else chunks.push({ delay, bytes: slice });
    }

    if (cut) break;
  }

  return chunks;
}

/** Ответ `fetch` без сети: тело — те же байты, выданные с задержками. */
export function replay(
  recording: Recording,
  { seed, pace, signal }: { seed: number; pace: number; signal: AbortSignal },
) {
  const chunks = toChunks(recording, seed);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      let next = 0;

      const schedule = () => {
        const chunk = chunks[next];
        next += 1;
        // Сервер закрыл соединение: у оборванной записи — посреди кадра
        if (!chunk) return controller.close();

        timer = setTimeout(() => {
          controller.enqueue(chunk.bytes);
          schedule();
        }, chunk.delay * pace);
      };

      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          try {
            controller.error(signal.reason);
          } catch {
            // Поток уже закрыт — прерывать нечего
          }
        },
        { once: true },
      );

      schedule();
    },
    cancel() {
      clearTimeout(timer);
    },
  });

  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}
