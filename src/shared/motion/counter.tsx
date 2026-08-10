"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { DUR, EASE } from "./presets";
import { useReducedMotion } from "./use-reduced-motion";

type CounterProps = {
  from?: number;
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function Counter({ from = 0, to, prefix = "", suffix = "", className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const node = ref.current;
      if (!node || reduced) return;

      const state = { value: from };
      node.textContent = `${prefix}${from}${suffix}`;

      gsap.to(state, {
        value: to,
        duration: DUR.count,
        ease: EASE.out,
        snap: { value: 1 },
        onUpdate: () => {
          node.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
        },
        scrollTrigger: { trigger: node, start: "top 90%" },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <span ref={ref} className={className}>
      {`${prefix}${to}${suffix}`}
    </span>
  );
}
