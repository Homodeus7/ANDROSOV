import { defineComponent, h, type PropType } from "vue";
import { tool } from "../../vue/tool";
import type { FpsDemoStrings } from "../model/strings";
import { BudgetField } from "./budget-field";
import { FpsReadout } from "./fps-readout";
import { NaiveField } from "./naive-field";
import { BLOCK_COUNTS, useFpsDemo } from "./use-fps-demo";

export const FpsDemo = defineComponent({
  name: "FpsDemo",
  props: {
    strings: { type: Object as PropType<FpsDemoStrings>, required: true },
  },
  setup(props) {
    const state = useFpsDemo();
    const s = props.strings;

    return () =>
      h("div", { class: "flex flex-col gap-4" }, [
        h("div", { class: "flex flex-wrap items-center gap-2" }, [
          tool(s.naive, () => state.setMode("naive"), { active: state.mode.value === "naive" }),
          tool(s.budget, () => state.setMode("budget"), {
            active: state.mode.value === "budget",
          }),

          h("div", { class: "flex items-center gap-2" }, [
            h("span", { class: "spec text-muted ml-2" }, s.blocks),
            ...BLOCK_COUNTS.map((count) =>
              tool(String(count), () => state.setCount(count), {
                active: state.count.value === count,
              }),
            ),
          ]),

          h("div", { class: "ml-auto flex items-center gap-2" }, [
            tool(state.running.value ? s.pause : s.resume, state.toggleRunning),
            tool(s.reset, state.reset),
          ]),
        ]),

        h("div", { class: "grid gap-4 lg:grid-cols-12" }, [
          h("div", { class: "col-span-full min-w-0 lg:col-span-7" }, [
            state.mode.value === "naive"
              ? h(NaiveField, { state, label: s.canvas })
              : h(BudgetField, { state, label: s.canvas }),
          ]),
          h(FpsReadout, { state, strings: s, class: "col-span-full lg:col-span-5" }),
        ]),

        h("p", { class: "spec text-muted normal-case" }, s.hint),
      ]);
  },
});
