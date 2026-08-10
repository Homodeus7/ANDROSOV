"use client";

import { useEffect, useState } from "react";
import { Container } from "@/shared/ui";

export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "g" && event.key !== "G" && event.key !== "п" && event.key !== "П")
        return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      setVisible((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <Container grid className="h-full">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="bg-accent/10 border-accent/30 h-full border-x lg:block"
            data-col={index + 1}
            style={index >= 4 ? { display: "var(--grid-col-display, none)" } : undefined}
          />
        ))}
      </Container>
    </div>
  );
}
