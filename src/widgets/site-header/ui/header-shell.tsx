"use client";

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/shared/motion";

export function HeaderShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const shift = gsap.quickTo(root.current, "yPercent", { duration: 0.3, ease: "power2.out" });

      const trigger = ScrollTrigger.create({
        start: "top -=200",
        end: "max",
        onUpdate: (self) => shift(self.direction === 1 ? -100 : 0),
        onLeaveBack: () => shift(0),
      });

      return () => trigger.kill();
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="border-border bg-bg sticky top-0 z-50 border-b-2 will-change-transform"
    >
      {children}
    </header>
  );
}
