import { describe, expect, it } from "vitest";
import { PENDING, REJECTED, explain } from "./errors";
import { EXPECTED_CHAIN, SIGNATURE, TRANSITIONS, initialState, reduce } from "./machine";
import { eventNames, statuses, type WalletEvent, type WalletState } from "./types";

const OTHER_CHAIN = 137;

const run = (events: WalletEvent[], from: WalletState = initialState) =>
  events.reduce(reduce, from);

const connected = () => run([{ name: "connect" }, { name: "approve" }]);

describe("wallet machine", () => {
  it("reaches every status from a cold start", () => {
    const reached = new Set([initialState.status]);
    const queue: WalletState[] = [initialState];

    while (queue.length > 0) {
      const state = queue.pop()!;
      for (const name of eventNames) {
        for (const chainId of [EXPECTED_CHAIN, OTHER_CHAIN]) {
          const next = reduce(state, { name, chainId });
          if (reached.has(next.status)) continue;
          reached.add(next.status);
          queue.push(next);
        }
      }
    }

    expect([...reached].sort()).toEqual([...statuses].sort());
  });

  it("leaves a way out of every status", () => {
    for (const status of statuses) {
      expect(Object.keys(TRANSITIONS[status]), status).not.toHaveLength(0);
    }
  });

  it("ignores an event the current status has no transition for", () => {
    const state = connected();
    expect(reduce(state, { name: "connect" })).toBe(state);
    expect(reduce(state, { name: "approve" })).toBe(state);
  });

  // Ради этого перехода всё и написано: отказ от подписи не рвёт подключение
  it("keeps the connection when a signature is refused", () => {
    const state = run([{ name: "sign" }, { name: "reject" }], connected());

    expect(state.status).toBe("ready");
    expect(state.error).toEqual(REJECTED);
    expect(state.signature).toBeUndefined();
    expect(explain(state)).toBe("rejected");
  });

  it("drops back to the start when the connection itself is refused", () => {
    const state = run([{ name: "connect" }, { name: "reject" }]);

    expect(state.status).toBe("disconnected");
    expect(state.error).toEqual(REJECTED);
  });

  it("never reaches ready on a chain the app does not know", () => {
    const wrong = run([
      { name: "connect" },
      { name: "chainChanged", chainId: OTHER_CHAIN },
      { name: "approve" },
    ]);

    expect(wrong.status).toBe("wrongChain");
    expect(explain(wrong)).toBe("wrongChain");
  });

  it("follows the chain changing under a connected app", () => {
    const state = run([{ name: "chainChanged", chainId: OTHER_CHAIN }], connected());
    expect(state.status).toBe("wrongChain");

    const back = reduce(state, { name: "chainChanged", chainId: EXPECTED_CHAIN });
    expect(back.status).toBe("ready");
  });

  it("voids a signature the moment the chain moves under it", () => {
    const signed = run([{ name: "sign" }, { name: "approve" }], connected());
    expect(signed.signature).toBe(SIGNATURE);

    const moved = reduce(signed, { name: "chainChanged", chainId: OTHER_CHAIN });
    expect(moved.signature).toBeUndefined();
  });

  // -32002: запрос уже открыт. Второго окна не будет, и ждать надо первое
  it("stays in the same request when the provider says one is already pending", () => {
    const state = run([{ name: "connect" }, { name: "busy" }]);

    expect(state.status).toBe("connecting");
    expect(state.error).toEqual(PENDING);
    expect(explain(state)).toBe("pending");
  });

  it("answers with an advice key for every status it can be in", () => {
    for (const status of statuses) {
      expect(explain({ status, chainId: EXPECTED_CHAIN }), status).toBeTruthy();
    }
  });
});
