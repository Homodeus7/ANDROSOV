"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/shared/lib";
import { bindPageScroll } from "../model/page-scroll";

// Фиксированная длительность на любое расстояние означает, что с длинного
// кейса страница стартует рывком: замер показал 1336 px за первый кадр
const TO_TOP_SPEED = 3400;
const TO_TOP_MIN = 0.45;
const TO_TOP_MAX = 1.1;

// Своя кривая вместо экспоненты Lenis: та стартует мгновенно, и подъём
// с длинного кейса читается как рывок, а не как движение страницы
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

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

        const unbind = bindPageScroll({
          setLocked: (locked) => (locked ? lenis.stop() : lenis.start()),
          toTop: () => {
            if (window.scrollY < 1) return Promise.resolve();

            const seconds = window.scrollY / TO_TOP_SPEED;

            return new Promise<void>((resolve) => {
              // force: остановленный Lenis игнорирует scrollTo, а прокрутка
              // вверх нужна и из-под оверлея
              lenis.scrollTo(0, {
                duration: Math.min(TO_TOP_MAX, Math.max(TO_TOP_MIN, seconds)),
                easing: easeInOutCubic,
                force: true,
                onComplete: () => resolve(),
              });
            });
          },
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
