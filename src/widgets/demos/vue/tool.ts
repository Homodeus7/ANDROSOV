import { h } from "vue";

type ToolOptions = { disabled?: boolean; active?: boolean };

export function tool(label: string, onClick: () => void, options: ToolOptions = {}) {
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
