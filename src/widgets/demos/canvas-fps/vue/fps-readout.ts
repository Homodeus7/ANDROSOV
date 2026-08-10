import { computed, defineComponent, h, type PropType } from "vue";
import type { FrameStats } from "@/entities/frame";
import type { FpsDemoStrings } from "../model/strings";
import type { FpsDemoState } from "./use-fps-demo";

// Полоса нормирована на два бюджета кадра, поэтому середина высоты — ровно
// 16.7 мс: всё, что выше половины, в кадр не уложилось
const STRIP_MS = (1000 / 60) * 2;

function cell(label: string, value: string, accent = false) {
  return h("div", { class: "border-border grow basis-28 border-l-2 pl-3 first:border-l-0" }, [
    h(
      "p",
      { class: ["display text-2xl tabular-nums", accent ? "text-accent-ink" : "text-fg"] },
      value,
    ),
    h("p", { class: "spec text-muted mt-1" }, label),
  ]);
}

function row(label: string, stats: FrameStats | undefined, strings: FpsDemoStrings) {
  return h("p", { class: "spec flex items-baseline justify-between gap-4 tabular-nums" }, [
    h("span", { class: "text-muted" }, label),
    stats
      ? h("span", { "data-result": label }, `${stats.fps} FPS · p95 ${stats.p95} ${strings.ms}`)
      : h("span", { class: "text-muted" }, strings.waiting),
  ]);
}

export const FpsReadout = defineComponent({
  name: "FpsReadout",
  props: {
    state: { type: Object as PropType<FpsDemoState>, required: true },
    strings: { type: Object as PropType<FpsDemoStrings>, required: true },
  },
  setup(props) {
    // Полоса кадров перерисовывается вместе со сводкой, четыре раза в секунду:
    // измеритель, рисующий себя каждый кадр, мерил бы в основном себя
    const bars = computed(() =>
      props.state.strip.value.map((delta) => Math.min(1, delta / STRIP_MS)),
    );

    return () => {
      const s = props.strings;
      const stats = props.state.stats.value;
      const results = props.state.results.value;

      return h("div", { class: "flex flex-col gap-4" }, [
        h("div", { class: "border-border bg-surface flex flex-wrap gap-y-4 border-2 p-4" }, [
          cell(s.fps, String(stats.fps), true),
          cell(s.p95, `${stats.p95}`),
          cell(s.dropped, `${stats.dropped}%`),
          cell(s.reads, String(props.state.readsPerFrame.value)),
        ]),

        h(
          "div",
          {
            "aria-hidden": "true",
            class: "border-border flex h-12 items-end gap-px border-2 p-1",
          },
          bars.value.map((share, index) =>
            h("span", {
              key: index,
              class: ["min-w-px grow", share > 0.5 ? "bg-muted" : "bg-accent-ink"],
              style: { height: `${Math.max(4, share * 100)}%` },
            }),
          ),
        ),

        h("div", { class: "border-border bg-surface flex flex-col gap-2 border-2 p-4" }, [
          h("p", { class: "spec text-muted" }, s.measured),
          row(s.naive, results.naive, s),
          row(s.budget, results.budget, s),
          h("p", { class: "spec flex items-baseline justify-between gap-4 tabular-nums" }, [
            h("span", { class: "text-muted" }, s.loop),
            h("span", { "data-loop": props.state.awake.value ? "awake" : "asleep" }, [
              props.state.awake.value ? s.awake : s.asleep,
              props.state.running.value
                ? null
                : h(
                    "span",
                    { class: "text-muted", "data-wasted": String(props.state.wasted.value) },
                    ` · ${s.wasted} ${props.state.wasted.value}`,
                  ),
            ]),
          ]),
        ]),

        h(
          "p",
          { class: "text-muted text-xs" },
          props.state.mode.value === "naive" ? s.naiveNote : s.budgetNote,
        ),
      ]);
    };
  },
});
