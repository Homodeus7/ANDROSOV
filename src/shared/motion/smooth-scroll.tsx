"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "./use-reduced-motion";
import { ScrollTrigger, gsap } from "./gsap";

export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const update = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
