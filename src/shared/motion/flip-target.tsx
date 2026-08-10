"use client";

import { useRef } from "react";
import { consumeFlip } from "./flip-store";
import { gsap, useGSAP } from "./gsap";
import { DUR, EASE } from "./presets";

type FlipTargetProps = {
  flipId: string;
  children: React.ReactNode;
  className?: string;
};

export function FlipTarget({ flipId, children, className }: FlipTargetProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const from = consumeFlip(flipId);
    const node = root.current;
    if (!from || !node) return;

    const rect = node.getBoundingClientRect();
    const fontSize = parseFloat(getComputedStyle(node).fontSize);
    if (!fontSize) return;

    // Обе рамки сняты в координатах вьюпорта, каждая — в свой момент.
    // Именно это и нужно: заголовок стартует там, где пользователь видел
    // карточку в последний раз, а не там, где она лежала в документе.
    gsap.fromTo(
      node,
      {
        x: from.left - rect.left,
        y: from.top - rect.top,
        scale: from.fontSize / fontSize,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: DUR.page,
        ease: EASE.page,
        transformOrigin: "top left",
        clearProps: "transform",
      },
    );
  });

  return (
    <span ref={root} data-flip-id={flipId} className={className}>
      {children}
    </span>
  );
}
