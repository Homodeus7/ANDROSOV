"use client";

import { useEffect } from "react";
import { lockPageScroll } from "../model/page-scroll-lock";

export function usePageScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return lockPageScroll();
  }, [active]);
}
