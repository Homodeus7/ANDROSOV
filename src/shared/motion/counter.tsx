"use client";

import { useInView } from "@/shared/in-view";
import { useReducedMotion } from "@/shared/lib";
import { gsap, useGSAP } from "./gsap";
import { groupDigits, parseMetric } from "./parse-metric";
import { DUR, EASE } from "./presets";

// Аналог «top 90%» у ScrollTrigger, но замером в момент прокрутки. Стартовые
// позиции триггеров считаются один раз и после пина героя показывают на экран
// выше — счётчик успевал отработать до того, как секция появлялась
const MARGIN = "0px 0px -10% 0px";

type CounterProps = {
  from?: number;
  to: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
};

export function Counter({
  from = 0,
  to,
  prefix = "",
  suffix = "",
  separator = "",
  className,
}: CounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>(MARGIN);
  const reduced = useReducedMotion();

  const text = (value: number) => `${prefix}${groupDigits(value, separator)}${suffix}`;

  useGSAP(
    () => {
      const node = ref.current;
      if (!node || reduced) return;

      node.textContent = text(from);
      if (!inView) return;

      const state = { value: from };

      gsap.to(state, {
        value: to,
        duration: DUR.count,
        ease: EASE.out,
        snap: { value: 1 },
        onUpdate: () => {
          node.textContent = text(Math.round(state.value));
        },
      });
    },
    { scope: ref, dependencies: [inView, reduced] },
  );

  return (
    <span ref={ref} className={className}>
      {text(to)}
    </span>
  );
}

export function CounterText({ value, className }: { value: string; className?: string }) {
  const parsed = parseMetric(value);

  if (!parsed) return <span className={className}>{value}</span>;

  return <Counter {...parsed} className={className} />;
}
