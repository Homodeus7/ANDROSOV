"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link } from "@/shared/i18n";
import { prefersReducedMotion } from "@/shared/lib";
import { useScrollTopNavigate } from "../lib/use-scroll-top-navigate";

type ScrollTopLinkProps = ComponentProps<typeof Link> & {
  href: string;
  /** Вызывается, когда переход остаётся за нами: после всех отказов, до подъёма */
  onNavigate?: () => void;
};

export function ScrollTopLink({ href, onClick, onNavigate, ...props }: ScrollTopLinkProps) {
  const navigate = useScrollTopNavigate();

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
        onNavigate?.();
        navigate(href);
      }}
    />
  );
}
