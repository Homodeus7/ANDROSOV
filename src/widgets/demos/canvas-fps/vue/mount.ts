import { createApp } from "vue";
import type { FpsDemoStrings } from "../model/strings";
import { FpsDemo } from "./fps-demo";

export function mountFpsDemo(host: HTMLElement, strings: FpsDemoStrings) {
  const app = createApp(FpsDemo, { strings });
  app.mount(host);
  return () => app.unmount();
}
