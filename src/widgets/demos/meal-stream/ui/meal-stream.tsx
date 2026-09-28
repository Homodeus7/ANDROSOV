"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/shared/i18n";
import { cn, useReducedMotion } from "@/shared/lib";
import { toolClass } from "../../model/tool-class";
import { apply, idle, totals, type Meal } from "../model/meal";
import { chipIds, cutsConnection, hash, record, type ChipId } from "../model/recording";
import { replay } from "../model/replay";
import { PreviewStreamError, streamPreview } from "../model/sse";
import type { MealStreamStrings } from "../model/strings";
import { FrameLog, type LogEntry, type Wire } from "./frame-log";
import { MealLine } from "./meal-line";
import { useTween } from "./use-tween";

const SLOW_PACE = 3;

type Failure = { transport: boolean; code: number | null };

export function MealStream({
  strings,
  locale,
}: {
  strings: MealStreamStrings;
  locale: Locale;
}) {
  const reduced = useReducedMotion();
  const [phrase, setPhrase] = useState(strings.chips.oatmeal);
  const [chip, setChip] = useState<ChipId | undefined>("oatmeal");
  const [slow, setSlow] = useState(false);
  const [meal, setMeal] = useState<Meal>(idle);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [pending, setPending] = useState("");
  const [wire, setWire] = useState<Wire>("waiting");
  const [failure, setFailure] = useState<Failure | undefined>();
  const current = useRef<AbortController | null>(null);
  const last = useRef({ phrase: strings.chips.oatmeal });

  const format = useMemo(() => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    return (value: number) => number.format(value);
  }, [locale]);

  async function run(text: string, cut = false) {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    last.current = { phrase: text };

    setMeal(idle);
    setLog([]);
    setPending("");
    setFailure(undefined);
    setWire("live");

    const started = performance.now();
    const response = replay(record(text, locale, { cut }), {
      seed: hash(`${text}:${cut}`),
      pace: slow ? SLOW_PACE : 1,
      signal: controller.signal,
    });

    try {
      await streamPreview(response, {
        onChunk: ({ bytes, text: chunk, events, pending: tail }) => {
          const at = performance.now() - started;
          setLog((entries) => [
            ...entries,
            { kind: "chunk", at, bytes, text: chunk },
            ...events.map((event) => ({ kind: "event" as const, event })),
          ]);
          setPending(tail);
        },
        onFlush: (dropped) => {
          setPending("");
          if (dropped) setLog((entries) => [...entries, { kind: "dropped", text: dropped }]);
        },
        onEvent: (event) => setMeal((state) => apply(state, event)),
      });
      setWire("closed");
    } catch (error) {
      if (controller.signal.aborted) return;
      if (!(error instanceof PreviewStreamError)) throw error;

      setFailure({ transport: error.transport, code: error.code });
      setWire(error.transport ? "cut" : "closed");
    }
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!current.current) void run(last.current.phrase);
    }, 400);
    return () => clearTimeout(handle);
    // Первый разбор — один раз, когда демо доехало до экрана, если человек
    // не успел выбрать пример сам
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => current.current?.abort(), []);

  function choose(id: ChipId) {
    setChip(id);
    setPhrase(strings.chips[id]);
    void run(strings.chips[id], cutsConnection(id));
  }

  const sum = totals(meal.lines);
  const kcal = useTween(sum.kcal, reduced);
  const confidence = useTween(meal.confidence ?? 0, reduced);
  const energy = sum.protein * 4 + sum.fat * 9 + sum.carbs * 4;
  const share = (grams: number, factor: number) =>
    energy > 0 ? `${((grams * factor) / energy) * 100}%` : "0%";

  const transport = failure?.transport === true;
  const steps = ["parsing", "matching", "done"] as const;
  const reached = meal.phase === "done" ? 3 : meal.phase === "matching" ? 1 : 0;

  return (
    <div className="flex flex-col gap-4" data-phase={meal.phase} data-wire={wire}>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setChip(undefined);
          void run(phrase);
        }}
      >
        <label className="spec text-muted w-full sm:w-auto" htmlFor="meal-stream-phrase">
          {strings.input}
        </label>
        <input
          id="meal-stream-phrase"
          value={phrase}
          maxLength={120}
          onChange={(event) => setPhrase(event.target.value)}
          placeholder={strings.placeholder}
          autoComplete="off"
          className="border-border bg-bg text-fg min-h-11 min-w-0 grow basis-64 border-2 px-3"
        />
        <button type="submit" className={toolClass(true)} disabled={!phrase.trim()}>
          {strings.submit}
        </button>
        <button
          type="button"
          aria-pressed={slow}
          className={toolClass(slow)}
          onClick={() => setSlow((on) => !on)}
        >
          {strings.slow}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="spec text-muted">{strings.examples}</span>
        {chipIds.map((id) => (
          <button
            key={id}
            type="button"
            data-chip={id}
            aria-pressed={id === chip}
            className={cn(
              toolClass(id === chip),
              "max-w-full shrink py-2 text-left normal-case",
            )}
            onClick={() => choose(id)}
          >
            {strings.chips[id]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="border-border bg-surface col-span-full flex min-w-0 flex-col border-2 lg:col-span-7 lg:min-h-[32rem]">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3 px-4 pt-4 pb-3">
            <p className="display min-w-0 grow text-lg leading-tight text-balance">
              {meal.dishName ?? (meal.phase === "idle" ? strings.idle : "…")}
            </p>
            <div className="w-36 shrink-0" data-confidence={meal.confidence ?? ""}>
              <p className="spec text-muted flex justify-between">
                <span>{strings.confidence}</span>
                <span className="text-fg tabular-nums">{Math.round(confidence * 100)}%</span>
              </p>
              <span className="bg-border mt-1 block h-1.5">
                <span
                  className="bg-accent block h-full"
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </span>
            </div>
          </div>

          <ol className="border-border grid grid-cols-3 border-t-2" aria-live="polite">
            {steps.map((step, index) => {
              const done = index < reached;
              const active = index === reached && meal.phase !== "idle" && !failure;
              return (
                <li
                  key={step}
                  data-step={step}
                  data-state={done ? "done" : active ? "active" : "todo"}
                  className={cn(
                    "border-border spec flex items-center gap-2 border-l-2 px-3 py-2 first:border-l-0",
                    done && "bg-accent text-on-accent",
                    !done && !active && "text-muted",
                  )}
                >
                  <span className="tabular-nums">{index + 1}</span>
                  <span className="min-w-0 leading-tight">{strings.steps[step]}</span>
                  {active ? (
                    <span
                      aria-hidden
                      className="bg-accent ml-auto size-2 shrink-0 animate-pulse"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <ul className="border-border grow border-t-2">
            {meal.lines.map((line, index) => (
              <MealLine
                key={index}
                line={line}
                index={index}
                stalled={transport && line.status === "pending"}
                reduced={reduced}
                format={format}
                strings={strings}
              />
            ))}
            {meal.phase === "parsing" && !failure ? (
              <li aria-hidden className="flex flex-col gap-2 px-4 py-4">
                <span className="bg-border block h-4 w-2/3 animate-pulse" />
                <span className="bg-border block h-4 w-1/2 animate-pulse" />
              </li>
            ) : null}
          </ul>

          {failure ? (
            <div
              role="status"
              data-error={failure.transport ? "transport" : "domain"}
              className="border-border flex flex-wrap items-center gap-3 border-t-2 px-4 py-3"
            >
              <span className="spec bg-fg text-bg shrink-0 px-1.5">
                {failure.transport ? "transport" : `error ${failure.code}`}
              </span>
              <span className="min-w-0 grow basis-60 text-sm">
                {failure.transport ? strings.transport : strings.domain}
              </span>
              {failure.transport ? (
                <button
                  type="button"
                  className={toolClass(true)}
                  onClick={() => void run(last.current.phrase)}
                >
                  {strings.retry}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="border-border flex flex-wrap items-end gap-x-6 gap-y-3 border-t-2 px-4 py-4">
            <p className="flex items-baseline gap-2">
              <span className="spec text-muted">{strings.total}</span>
              <span
                className="display text-accent-ink text-4xl tabular-nums"
                data-total={sum.kcal}
              >
                {Math.round(kcal)}
              </span>
              <span className="spec text-muted">{strings.kcal}</span>
            </p>
            <div className="min-w-48 grow">
              <p className="spec text-muted flex flex-wrap gap-x-4 tabular-nums">
                <span>
                  {strings.protein} {format(sum.protein)}
                </span>
                <span>
                  {strings.fat} {format(sum.fat)}
                </span>
                <span>
                  {strings.carbs} {format(sum.carbs)}
                </span>
              </p>
              <span aria-hidden className="bg-border mt-2 flex h-2 overflow-hidden">
                <span
                  className="bg-fg block h-full transition-[width] duration-500"
                  style={{ width: share(sum.protein, 4) }}
                />
                <span
                  className="bg-accent block h-full transition-[width] duration-500"
                  style={{ width: share(sum.fat, 9) }}
                />
                <span
                  className="bg-muted block h-full transition-[width] duration-500"
                  style={{ width: share(sum.carbs, 4) }}
                />
              </span>
            </div>
          </div>
        </section>

        {/* Высоту ряда задает разбор, журнал под нее подстраивается и прокручивается */}
        <div className="relative col-span-full min-w-0 lg:col-span-5">
          <FrameLog
            className="lg:absolute lg:inset-0"
            entries={log}
            pending={pending}
            wire={wire}
            strings={strings}
          />
        </div>
      </div>

      <p className="spec text-muted normal-case">{strings.hint}</p>
      <p className="text-muted max-w-prose text-xs">{strings.note}</p>
    </div>
  );
}
