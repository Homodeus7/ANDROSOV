"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/shared/in-view";
import { cn } from "@/shared/lib";

export type IslandLoader = () => Promise<(host: HTMLElement) => () => void>;

type VueIslandProps = {
  load: IslandLoader;
  fallback: React.ReactNode;
  className?: string;
};

/**
 * Vue приезжает отдельным чанком и только когда остров показался на экране:
 * в общий бандл он не попадает никогда. Хост-узел React не наполняет — им
 * целиком владеет Vue, иначе два рантайма правили бы один и тот же DOM.
 */
export function VueIsland({ load, fallback, className }: VueIslandProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const host = useRef<HTMLDivElement>(null);
  const loader = useRef(load);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loader.current = load;
  });

  useEffect(() => {
    if (!inView) return;

    let unmount: (() => void) | undefined;
    let cancelled = false;

    void loader.current().then((mount) => {
      if (cancelled || !host.current) return;
      unmount = mount(host.current);
      setMounted(true);
    });

    return () => {
      cancelled = true;
      unmount?.();
      setMounted(false);
    };
  }, [inView]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div ref={host} />
      {mounted ? null : fallback}
    </div>
  );
}
