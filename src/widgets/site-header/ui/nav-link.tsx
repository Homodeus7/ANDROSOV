"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/shared/i18n";
import { cn } from "@/shared/lib";

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
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(active ? "text-accent-ink" : "hover:text-accent-ink")}
    >
      {children}
    </Link>
  );
}
