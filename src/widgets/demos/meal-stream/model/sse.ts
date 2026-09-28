import type { StreamEvent } from "./protocol";

export class PreviewStreamError extends Error {
  constructor(
    message: string,
    readonly code: number | null,
    // Сломался поток — повторить имеет смысл. Иначе бэкенд прислал `error`,
    // и повтор упадет так же
    readonly transport: boolean,
  ) {
    super(message);
  }
}

export function createFrameParser() {
  let buffer = "";

  const parseFrame = (frame: string): StreamEvent | undefined => {
    const data = frame
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");

    // Кадр из одних комментариев — keep-alive, пока модель думает
    return data ? (JSON.parse(data) as StreamEvent) : undefined;
  };

  return {
    get pending() {
      return buffer;
    },

    push(text: string) {
      buffer += text;
      const events: StreamEvent[] = [];

      for (let end = buffer.indexOf("\n\n"); end !== -1; end = buffer.indexOf("\n\n")) {
        const event = parseFrame(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
        if (event) events.push(event);
      }

      return events;
    },

    flush() {
      const tail = buffer;
      buffer = "";
      if (!tail.trim()) return { events: [], dropped: "" };

      // Целый кадр без пустой строки в конце или половина кадра от оборванной
      // связи — различает их только неудачный разбор. Выброшенный хвост
      // оставляет поток незавершенным, и это уже транспортная ошибка
      try {
        const event = parseFrame(tail);
        return { events: event ? [event] : [], dropped: "" };
      } catch {
        return { events: [], dropped: tail };
      }
    },
  };
}

export type ChunkInfo = { bytes: number; text: string; events: StreamEvent[]; pending: string };

export async function streamPreview(
  response: Response,
  handlers: {
    onEvent: (event: StreamEvent) => void;
    onChunk?: (chunk: ChunkInfo) => void;
    onFlush?: (dropped: string) => void;
  },
) {
  if (!response.ok || !response.body) {
    throw new PreviewStreamError(`HTTP ${response.status}`, response.status, true);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = createFrameParser();
  let finished = false;
  let failure: PreviewStreamError | undefined;

  const deliver = (events: StreamEvent[]) => {
    for (const event of events) {
      if (event.type === "done") finished = true;
      if (event.type === "error")
        failure = new PreviewStreamError(event.message, event.code, false);
      handlers.onEvent(event);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      // Граница чанка режет кириллицу посреди символа: декодер держит
      // недостающие байты у себя до следующего чанка
      const text = decoder.decode(value, { stream: true });
      const events = parser.push(text);
      handlers.onChunk?.({ bytes: value.byteLength, text, events, pending: parser.pending });
      deliver(events);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PreviewStreamError(String(error), null, true);
  }

  deliver(parser.push(decoder.decode()));
  const tail = parser.flush();
  handlers.onFlush?.(tail.dropped);
  deliver(tail.events);

  if (failure) throw failure;
  if (!finished) throw new PreviewStreamError("Stream ended before done", null, true);
}
