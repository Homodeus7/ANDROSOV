"use client";

import { useEffect, useRef, type ReactNode } from "react";

const HIDE_AFTER = 200;

/**
 * Шапка прячется на обычном слушателе прокрутки, а не на GSAP. Ради одного
 * этого эффекта библиотека тянулась в общий чанк и её платили все страницы,
 * включая резюме, где анимации нет вообще. Сам сдвиг делает CSS-переход,
 * который `prefers-reduced-motion` уже глушит глобально.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    let previous = window.scrollY;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const node = root.current;
      if (!node) return;

      const current = window.scrollY;
      const hidden = current > HIDE_AFTER && current > previous;
      previous = current;
      node.style.transform = hidden ? "translateY(-100%)" : "translateY(0)";
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={root}
      data-site-header
      className="border-border bg-bg sticky top-0 z-50 border-b-2 transition-transform duration-300 ease-out will-change-transform"
    >
      {children}
    </header>
  );
}
