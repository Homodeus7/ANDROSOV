"use client";

import { useEffect, useRef, useState } from "react";
import { sliceFor, type WindowSlice } from "../model/window";

type Options = { total: number; rowHeight: number; enabled: boolean; overscan?: number };

export function useVirtualRows({ total, rowHeight, enabled, overscan }: Options) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => setViewport(entry!.contentRect.height));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const slice: WindowSlice = enabled
    ? sliceFor({ scrollTop, viewport, rowHeight, total, overscan })
    : { start: 0, end: total, padTop: 0, totalHeight: total * rowHeight };

  return {
    ref,
    slice,
    onScroll: () => setScrollTop(ref.current?.scrollTop ?? 0),
  };
}
