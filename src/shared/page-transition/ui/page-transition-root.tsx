"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "@/shared/i18n";
import { endLeave, hasArrived, isLeaving } from "../model/transition";

const MAX_FRAMES = 15;

export function PageTransitionRoot() {
  useLayoutEffect(() => {
    document.documentElement.dataset.js = "1";
  }, []);

  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!isLeaving()) return;

    const root = document.documentElement;
    let frame = 0;
    let left = MAX_FRAMES;

    const arrive = () => {
      // Разметка новой страницы уже в DOM, но ещё не отрисована: тем же кадром
      // меняем позу «ушёл вверх» на «приходит снизу», поэтому между страницами
      // показывать нечего — заголовка нет ни в одной позиции, ни в другой
      root.setAttribute("data-arriving", "");
      endLeave();

      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => root.removeAttribute("data-arriving"));
      });
    };

    const step = () => {
      if (hasArrived() || left-- <= 0) {
        arrive();
        return;
      }

      frame = requestAnimationFrame(step);
    };

    step();

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
