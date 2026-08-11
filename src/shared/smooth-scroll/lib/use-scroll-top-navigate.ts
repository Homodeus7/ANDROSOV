"use client";

import { useRouter } from "@/shared/i18n";
import { prefersReducedMotion } from "@/shared/lib";
import { scrollPageToTop } from "../model/page-scroll";

/**
 * Переход после прокрутки, а не одновременно с ней. Если сначала уйти на новую
 * страницу, браузер схлопнет позицию до её высоты — с длинного кейса на
 * короткий это скачок почти в тысячу пикселей, и только потом поедет плавно.
 */
export function useScrollTopNavigate() {
  const router = useRouter();

  return (href: string) => {
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }

    void scrollPageToTop().then(() => router.push(href));
  };
}
