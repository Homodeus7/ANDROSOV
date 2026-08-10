import { createApp } from "vue";
import type { FlowDemoStrings } from "../model/strings";
import { FlowDemo } from "./flow-demo";

export function mountFlowDemo(host: HTMLElement, strings: FlowDemoStrings) {
  const app = createApp(FlowDemo, { strings });
  app.mount(host);
  return () => app.unmount();
}
