import { defineComponent, h, type PropType } from "vue";
import type { FlowDemoStrings } from "../model/strings";
import { FlowCanvas } from "./flow-canvas";
import { FlowBuffer, FlowTimeline } from "./flow-inspector";
import { useFlowDemo } from "./use-flow-demo";

type ToolOptions = { disabled?: boolean; active?: boolean };

function tool(label: string, onClick: () => void, options: ToolOptions = {}) {
  return h(
    "button",
    {
      type: "button",
      onClick,
      disabled: options.disabled,
      "aria-pressed": options.active,
      class: [
        "spec min-h-11 shrink-0 cursor-pointer border-2 px-3 disabled:pointer-events-none disabled:opacity-35",
        options.active
          ? "border-accent bg-accent text-on-accent"
          : "border-border text-fg flood",
      ],
    },
    label,
  );
}

export const FlowDemo = defineComponent({
  name: "FlowDemo",
  props: {
    strings: { type: Object as PropType<FlowDemoStrings>, required: true },
  },
  setup(props) {
    const state = useFlowDemo(props.strings);
    const s = props.strings;

    function onKeydown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "z" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (event.shiftKey) state.redo();
      else state.undo();
    }

    return () =>
      h("div", { class: "flex flex-col gap-4", onKeydown }, [
        h("div", { class: "flex flex-wrap items-center gap-2" }, [
          tool(s.add, state.addBlock),
          tool(s.connect, state.toggleConnect, {
            disabled: state.selected.value === null,
            active: state.connecting.value,
          }),
          tool(s.remove, state.remove, { disabled: state.selected.value === null }),

          h("label", { class: "flex min-w-0 grow basis-40 items-center gap-2 sm:max-w-64" }, [
            h("span", { class: "spec text-muted sr-only" }, s.rename),
            h("input", {
              type: "text",
              value: state.selectedBlock.value?.name ?? "",
              disabled: state.selectedBlock.value === null,
              placeholder: s.rename,
              maxlength: 24,
              class:
                "border-border bg-surface text-fg placeholder:text-muted min-h-11 w-full min-w-24 border-2 px-3 text-sm disabled:opacity-35",
              onInput: (event: Event) => state.rename((event.target as HTMLInputElement).value),
            }),
          ]),

          h("div", { class: "flex items-center gap-2" }, [
            tool(s.undo, state.undo, { disabled: !state.canUndo.value }),
            tool(s.redo, state.redo, { disabled: !state.canRedo.value }),
            tool(s.reset, state.reset),
          ]),
        ]),

        h(
          "p",
          { class: "spec text-muted normal-case" },
          state.connecting.value ? s.connecting : s.hint,
        ),

        h("div", { class: "grid gap-4 lg:grid-cols-[3fr_2fr]" }, [
          h("div", { class: "flex min-w-0 flex-col gap-3" }, [
            h(FlowCanvas, { state, label: s.canvas }),
            h(FlowTimeline, { state, strings: s }),
          ]),
          h(FlowBuffer, { state, strings: s }),
        ]),
      ]);
  },
});
