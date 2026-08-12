"use client";

import type { ComponentProps } from "react";
import { TransitionLink } from "@/shared/page-transition";
import { caseHref } from "../model/route";

type CaseLinkProps = Omit<ComponentProps<typeof TransitionLink>, "href"> & {
  slug: string;
};

/**
 * Единственный путь на страницу кейса — и с карточки на главной, и с соседей
 * внизу кейса, и из резюме. Жест один на всех: страница поднимается наверх,
 * заголовок текущей страницы уходит вверх, и уже на его место приходит новый.
 */
export function CaseLink({ slug, ...props }: CaseLinkProps) {
  return <TransitionLink {...props} href={caseHref(slug)} />;
}
