"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useInView } from "@/shared/in-view";
import { cn } from "@/shared/lib";

/**
 * Демо грузится, только доехав до экрана. Элемент можно создавать заранее:
 * `dynamic` тянет чанк на рендере, а не на создании элемента.
 */
export function DemoFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const t = useTranslations("demos");
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={cn("relative min-h-[34rem]", className)}>
      {inView ? (
        children
      ) : (
        <p className="spec text-muted absolute inset-0 flex items-center justify-center">
          {t("loading")}
        </p>
      )}
    </div>
  );
}
