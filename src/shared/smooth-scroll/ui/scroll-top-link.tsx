"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link, useRouter } from "@/shared/i18n";
import { prefersReducedMotion } from "@/shared/lib";
import { scrollPageToTop } from "../model/page-scroll";

type ScrollTopLinkProps = ComponentProps<typeof Link> & { href: string };

/**
 * Переход после прокрутки, а не одновременно с ней. Если сначала уйти на новую
 * страницу, браузер схлопнет позицию до её высоты — с длинного кейса на
 * короткий это скачок почти в тысячу пикселей, и только потом поедет плавно.
 */
export function ScrollTopLink({ href, onClick, ...props }: ScrollTopLinkProps) {
  const router = useRouter();

  return (
    <Link
      {...props}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || prefersReducedMotion()) return;

        // Открытие в новой вкладке и средняя кнопка остаются браузеру
        const modified =
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0;
        if (modified) return;

        event.preventDefault();
        void scrollPageToTop().then(() => router.push(href));
      }}
    />
  );
}
