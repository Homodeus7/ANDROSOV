"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib";


export function FitTitle({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = "";
      // На время замера снимаем `overflow-wrap: anywhere` из `display`: с ним
      // min-content равен ширине одного символа, а нужна ширина слова целиком
      el.style.overflowWrap = "normal";
      el.style.width = "min-content";
      const longest = el.getBoundingClientRect().width;
      el.style.width = "";
      el.style.overflowWrap = "";

      const room = el.clientWidth;
      if (longest <= room) return;

      const base = Number.parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${Math.floor((base * room * 10) / longest) / 10}px`;
    };

    fit();
    void document.fonts.ready.then(fit);

    // За родителем, а не за самим заголовком: fit меняет его высоту, и
    // наблюдение за собой гоняло бы лишний круг на каждый замер
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement ?? el);

    return () => observer.disconnect();
  }, [children]);

  return (
    <h1 ref={ref} data-page-title className={cn("display text-display", className)}>
      {children}
    </h1>
  );
}
