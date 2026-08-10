"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link } from "@/shared/i18n";
import { captureFlip } from "./flip-store";
import { prefersReducedMotion } from "./use-reduced-motion";

type FlipLinkProps = ComponentProps<typeof Link> & { flipId: string };

export function FlipLink({ flipId, onClick, ...props }: FlipLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (!prefersReducedMotion()) captureFlip(flipId);
      }}
    />
  );
}
