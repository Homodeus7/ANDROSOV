"use client";

import { useEffect, useRef, type ReactNode } from "react";

const HIDE_AFTER = 200;

// Плавная прокрутка доводит колесо затухающей анимацией, и на её хвосте кадры
// приходят с долями пикселя в обе стороны. Сравнение «текущая > предыдущей»
// принимало этот дребезг за смену направления, и шапка успевала выехать на
// кадр и уехать обратно. Направление считается только после заметного сдвига
const DIRECTION_THRESHOLD = 12;

/**
 * Шапка прячется на обычном слушателе прокрутки, а не на GSAP. Ради одного
 * этого эффекта библиотека тянулась в общий чанк и её платили все страницы,
 * включая резюме, где анимации нет вообще. Сам сдвиг делает CSS-переход,
 * который `prefers-reduced-motion` уже глушит глобально.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    let anchor = window.scrollY;
    let hidden = false;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const node = root.current;
      if (!node) return;

      const current = window.scrollY;
      const delta = current - anchor;
      // Якорь не двигается, пока сдвиг мал: медленная прокрутка так копится
      // до порога, а не растворяется в нём
      if (Math.abs(delta) < DIRECTION_THRESHOLD) return;

      anchor = current;
      const next = delta > 0 && current > HIDE_AFTER;
      if (next === hidden) return;

      hidden = next;
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
