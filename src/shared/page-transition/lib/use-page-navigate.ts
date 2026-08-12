"use client";

import { usePathname, useRouter } from "@/shared/i18n";
import { prefersReducedMotion } from "@/shared/lib";
import { scrollPageToTop } from "@/shared/smooth-scroll";
import { TITLE_MS, TITLE_TAIL_MS, beginLeave, endLeave, isLeaving } from "../model/transition";

const STUCK_MS = 2500;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export function usePageNavigate() {
  const router = useRouter();
  const pathname = usePathname();

  return (href: string) => {
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }

    const rise = scrollPageToTop();

    // Тот же адрес: перехода не будет, значит и заголовку неоткуда вернуться
    if (href === pathname) return;

    let token = 0;

    void rise
      .then(() => {
        token = beginLeave();
        return wait(TITLE_MS + TITLE_TAIL_MS);
      })
      .then(() => {
        router.push(href);
        window.setTimeout(() => {
          if (isLeaving()) endLeave(token);
        }, STUCK_MS);
      });
  };
}
