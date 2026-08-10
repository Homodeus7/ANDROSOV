import { computed, defineComponent, h, nextTick, ref, watch, type PropType } from "vue";
import { describeAction } from "../model/describe";
import type { FlowDemoStrings } from "../model/strings";
import type { FlowDemoState } from "./use-flow-demo";

const VISIBLE_ROWS = 40;

export const FlowTimeline = defineComponent({
  name: "FlowTimeline",
  props: {
    state: { type: Object as PropType<FlowDemoState>, required: true },
    strings: { type: Object as PropType<FlowDemoStrings>, required: true },
  },
  setup(props) {
    const ticks = computed(() => {
      const { marks } = props.state.normalized.value;
      const position = props.state.position.value;

      return props.state.buffer.value.map((_, index) => ({
        applied: index < position,
        collapsed: marks[index] !== null,
      }));
    });

    return () =>
      h("div", { class: "flex items-center gap-4" }, [
        h(
          "span",
          { class: "spec text-muted shrink-0 tabular-nums" },
          `${props.state.position.value} / ${props.state.total.value}`,
        ),
        h(
          "div",
          {
            class:
              "border-border relative h-11 grow border-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent-ink)]",
          },
          [
            h(
              "div",
              {
                "aria-hidden": "true",
                class: "absolute inset-0 flex items-stretch gap-px p-1",
              },
              ticks.value.map((tick, index) =>
                h("span", {
                  key: index,
                  class: [
                    "min-w-px grow",
                    tick.applied
                      ? tick.collapsed
                        ? "bg-muted/70"
                        : "bg-accent-ink"
                      : "bg-border",
                  ],
                }),
              ),
            ),
            // Ползунок нативный: сам держит клавиатуру, тач и клик по дорожке,
            // а рисуем мы поверх свою шкалу
            h("input", {
              type: "range",
              min: 0,
              max: Math.max(1, props.state.total.value),
              step: 1,
              value: props.state.position.value,
              disabled: props.state.total.value === 0,
              "aria-label": props.strings.timeline,
              class: "absolute inset-0 h-full w-full cursor-ew-resize opacity-0",
              onInput: (event: Event) =>
                props.state.seekTo(Number((event.target as HTMLInputElement).value)),
            }),
          ],
        ),
      ]);
  },
});

export const FlowBuffer = defineComponent({
  name: "FlowBuffer",
  props: {
    state: { type: Object as PropType<FlowDemoState>, required: true },
    strings: { type: Object as PropType<FlowDemoStrings>, required: true },
  },
  setup(props) {
    const list = ref<HTMLElement | null>(null);
    const rows = computed(() => {
      const { marks } = props.state.normalized.value;
      const all = props.state.buffer.value.map((action, index) => ({
        action,
        rule: marks[index] ?? null,
        index,
      }));
      return all.slice(-VISIBLE_ROWS);
    });

    watch(
      () => props.state.buffer.value.length,
      () => nextTick(() => list.value?.scrollTo({ top: list.value.scrollHeight })),
    );

    return () =>
      h("div", { class: "border-border bg-surface flex min-h-0 flex-col border-2" }, [
        h(
          "div",
          {
            class:
              "border-border flex items-baseline justify-between gap-4 border-b-2 px-4 py-3",
          },
          [
            h("span", { class: "spec text-muted" }, props.strings.buffer),
            h("span", { class: "spec text-muted tabular-nums" }, [
              h("span", { "data-buffer": "raw" }, String(props.state.buffer.value.length)),
              " → ",
              h(
                "span",
                { "data-buffer": "sent", class: "text-accent-ink" },
                String(props.state.normalized.value.actions.length),
              ),
            ]),
          ],
        ),

        h(
          "div",
          {
            ref: list,
            class:
              "h-[clamp(9rem,22vw,13rem)] overflow-y-auto px-4 py-3 font-mono text-[0.6875rem] leading-relaxed",
          },
          props.state.buffer.value.length === 0
            ? [h("p", { class: "text-muted" }, props.strings.empty)]
            : [
                props.state.buffer.value.length > VISIBLE_ROWS
                  ? h(
                      "p",
                      { class: "text-muted mb-2" },
                      `+${props.state.buffer.value.length - VISIBLE_ROWS} ${props.strings.earlier}`,
                    )
                  : null,
                ...rows.value.map(({ action, rule, index }) => {
                  const described = describeAction(action);
                  return h(
                    "p",
                    {
                      key: index,
                      "data-row": rule ?? "sent",
                      class: [
                        "flex items-baseline justify-between gap-3 whitespace-nowrap",
                        rule ? "text-muted line-through decoration-1" : "text-fg",
                      ],
                    },
                    [
                      h("span", { class: "truncate" }, [
                        h("span", { class: rule ? "" : "text-accent-ink" }, action.type),
                        ` ${described.target}`,
                        described.detail
                          ? h("span", { class: "text-muted" }, ` ${described.detail}`)
                          : null,
                      ]),
                      rule
                        ? h(
                            "span",
                            { class: "shrink-0 no-underline" },
                            props.strings.rules[rule],
                          )
                        : null,
                    ],
                  );
                }),
              ],
        ),

        h("div", { class: "border-border border-t-2 px-4 py-3" }, [
          h("p", { class: "flex items-baseline justify-between gap-4" }, [
            h("span", { class: "spec text-muted" }, props.strings.saved),
            h(
              "span",
              { class: "display text-accent-ink text-2xl tabular-nums" },
              `−${props.state.savedShare.value}%`,
            ),
          ]),
          h("p", { class: "text-muted mt-2 text-xs" }, props.strings.coverage),
        ]),
      ]);
  },
});
