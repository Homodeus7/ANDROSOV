"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/shared/lib";
import { bindPageScrollLock } from "../model/page-scroll-lock";

/**
 * Lenis и GSAP приезжают отдельным чанком уже из эффекта. Статический импорт
 * клал их в общий бандл каждой страницы — включая те, где плавной прокрутки
 * никто не просил. Пользователь с `prefers-reduced-motion` не грузит их вовсе.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import("lenis"), import("@/shared/motion")]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;

        const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        const update = (time: number) => lenis.raf(time * 1000);

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        const unbind = bindPageScrollLock((locked) => {
          if (locked) lenis.stop();
          else lenis.start();
        });

        dispose = () => {
          unbind();
          gsap.ticker.remove(update);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [reduced]);

  return null;
}
