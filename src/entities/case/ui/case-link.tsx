"use client";

import type { ComponentProps } from "react";
import { captureFlip } from "@/shared/motion";
import { ScrollTopLink } from "@/shared/smooth-scroll";
import { caseFlipId, caseHref } from "../model/route";

type CaseLinkProps = Omit<ComponentProps<typeof ScrollTopLink>, "href" | "onNavigate"> & {
  slug: string;
};

/**
 * Единственный путь на страницу кейса — и с карточки на главной, и с соседей
 * внизу кейса, и из резюме. Жест один: страница уходит наверх, а заголовок
 * прилетает оттуда, где карточку видели в момент клика.
 *
 * Слепок снимается до подъёма, а не после: за подъём карточка уезжает вниз
 * экрана, а с соседей кейса — и вовсе за его край, и перелёт стартовал бы не
 * оттуда, куда смотрели.
 */
export function CaseLink({ slug, ...props }: CaseLinkProps) {
  return (
    <ScrollTopLink
      {...props}
      href={caseHref(slug)}
      onNavigate={() => captureFlip(caseFlipId(slug))}
    />
  );
}
