"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 520;

/** Число доезжает до цели, а не прыгает; новая цель подхватывается с текущего места. */
export function useTween(target: number, reduced: boolean) {
  const [value, setValue] = useState(target);
  const shown = useRef(target);

  useEffect(() => {
    if (reduced) {
      shown.current = target;
      return;
    }

    const origin = shown.current;
    const started = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - started) / DURATION, 1);
      const eased = 1 - (1 - progress) ** 3;
      shown.current = origin + (target - origin) * eased;
      setValue(shown.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);

  return reduced ? target : value;
}
