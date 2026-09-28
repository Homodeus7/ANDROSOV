import { describe, expect, it } from "vitest";
import type { StreamEvent } from "./protocol";
import en from "../../../../../messages/en.json";
import ru from "../../../../../messages/ru.json";
import { chipIds, readPhrase, record } from "./recording";
import { replay, toChunks } from "./replay";
import { createFrameParser, PreviewStreamError, streamPreview } from "./sse";

const messages = { ru: ru.demos.mealStream.chips, en: en.demos.mealStream.chips };
const phrases = messages.ru;

async function play(phrase: string, cut = false) {
  const events: StreamEvent[] = [];
  let chunks = 0;
  const response = replay(record(phrase, "ru", { cut }), {
    seed: 7,
    pace: 0,
    signal: new AbortController().signal,
  });

  try {
    await streamPreview(response, {
      onEvent: (event) => events.push(event),
      onChunk: () => (chunks += 1),
    });
    return { events, chunks, error: undefined };
  } catch (error) {
    return { events, chunks, error: error as PreviewStreamError };
  }
}

describe("frame parser", () => {
  it("assembles a frame from pieces cut anywhere", () => {
    const parser = createFrameParser();
    const text = 'data: {"type":"status","step":"parsing"}\n\n';

    expect(parser.push(text.slice(0, 9))).toEqual([]);
    expect(parser.push(text.slice(9, -1))).toEqual([]);
    expect(parser.pending).toBe(text.slice(0, -1));
    expect(parser.push("\n")).toEqual([{ type: "status", step: "parsing" }]);
  });

  it("skips keep-alive comments", () => {
    expect(createFrameParser().push(": keep-alive\n\n")).toEqual([]);
  });

  it("drops half a frame on flush instead of throwing", () => {
    const parser = createFrameParser();
    parser.push('data: {"type":"item","ind');

    expect(parser.flush()).toEqual({ events: [], dropped: 'data: {"type":"item","ind' });
  });

  it("keeps a whole frame the server closed without a blank line", () => {
    const parser = createFrameParser();
    parser.push('data: {"type":"done","confidence":1,"dishName":"x"}');

    expect(parser.flush().events).toHaveLength(1);
  });
});

describe("recorded stream", () => {
  it("splits frames across more chunks than there are frames", () => {
    const recording = record(phrases.oatmeal, "ru");
    expect(toChunks(recording, 1).length).toBeGreaterThan(recording.frames.length);
  });

  it("links every oatmeal item and ends with done", async () => {
    const { events, error } = await play(phrases.oatmeal);

    expect(error).toBeUndefined();
    expect(events.filter((event) => event.type === "item")).toHaveLength(5);
    expect(events.at(-1)?.type).toBe("done");
  });

  it("leaves the ambiguous item unlinked", async () => {
    const { events } = await play(phrases.ambiguous);
    expect(events.filter((event) => event.type === "item-failed")).toEqual([
      { type: "item-failed", index: 0 },
    ]);
  });

  it("reports a cut connection as a transport error", async () => {
    const { events, error } = await play(phrases.drop, true);

    expect(error).toBeInstanceOf(PreviewStreamError);
    expect(error?.transport).toBe(true);
    expect(events.filter((event) => event.type === "item")).toHaveLength(2);
  });

  it("reports a phrase without food as a domain error", async () => {
    const { error } = await play(phrases.notFood);

    expect(error?.transport).toBe(false);
    expect(error?.code).toBe(422);
  });

  it("recognises food in every chip but the one without it, in both languages", () => {
    for (const chips of Object.values(messages)) {
      for (const id of chipIds) {
        const known = readPhrase(chips[id], "en").some((entry) => entry.known);
        expect(known, chips[id]).toBe(id !== "notFood");
      }
    }
  });
});
