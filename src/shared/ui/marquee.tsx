"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib";

type MarqueeProps = {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
};

const MIN_COPIES = 2;

export function Marquee({ items, speed = 24, reverse = false, className }: MarqueeProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(MIN_COPIES);

  useEffect(() => {
    const box = viewport.current;
    const first = copy.current;
    if (!box || !first) return;

    const fit = () => {
      const width = first.offsetWidth;
      if (!width) return;
      setCopies(Math.max(MIN_COPIES, Math.ceil(box.offsetWidth / width) + 1));
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(first);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={viewport}
      aria-hidden
      data-clip
      className={cn("border-border overflow-hidden border-y-2 py-3", className)}
    >
      <div
        data-marquee-track
        className="marquee-track spec flex w-max"
        style={
          {
            "--marquee-duration": `${speed}s`,
            "--marquee-direction": reverse ? "reverse" : "normal",
            "--marquee-shift": `${-100 / copies}%`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: copies }, (_, index) => (
          <ul
            key={index}
            ref={index === 0 ? copy : undefined}
            data-marquee-copy={index === 0 ? "" : undefined}
            className="flex shrink-0"
          >
            {items.map((item) => (
              <li key={item} className="flex shrink-0 items-center gap-8 pr-8">
                <span>{item}</span>
                <span className="text-accent-ink">▪</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
