"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link } from "@/shared/i18n";
import { prefersReducedMotion } from "@/shared/lib";
import { usePageNavigate } from "../lib/use-page-navigate";

type TransitionLinkProps = ComponentProps<typeof Link> & { href: string };

export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const navigate = usePageNavigate();

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
        navigate(href);
      }}
    />
  );
}
