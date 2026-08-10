import { h } from "vue";
import { toolClass } from "../model/tool-class";

type ToolOptions = { disabled?: boolean; active?: boolean };

export function tool(label: string, onClick: () => void, options: ToolOptions = {}) {
  return h(
    "button",
    {
      type: "button",
      onClick,
      disabled: options.disabled,
      "aria-pressed": options.active,
      class: toolClass(options.active),
    },
    label,
  );
}
