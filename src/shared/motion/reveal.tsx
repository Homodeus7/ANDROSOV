"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/shared/lib";
import { gsap, useGSAP } from "./gsap";
import { DUR, EASE, STAGGER } from "./presets";
import { useReducedMotion } from "./use-reduced-motion";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  start?: string;
};

export function Reveal({
  as,
  children,
  className,
  stagger = STAGGER.list,
  y = 24,
  start = "top 85%",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const host = ref.current;
      if (!host) return;

      const targets = Array.from(host.children);
      if (targets.length === 0) return;

      const done = () => host.setAttribute("data-revealed", "");

      if (reduced) {
        done();
        return;
      }

      gsap.set(targets, { opacity: 0, y });
      done();

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: DUR.reveal,
        stagger,
        ease: EASE.out,
        scrollTrigger: { trigger: host, start },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
