"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { TransitionLink } from "@/shared/page-transition";

/**
 * Отдельный клиентский кусок, а не вся шапка: путь нужен только ссылкам, а
 * заголовки и переключатели рядом с ними прекрасно рендерятся на сервере.
 */
export function NavLink({
  href,
  match,
  children,
}: {
  href: string;
  match: readonly string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = match.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <TransitionLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(active ? "text-accent-ink" : "hover:text-accent-ink")}
    >
      {children}
    </TransitionLink>
  );
}
