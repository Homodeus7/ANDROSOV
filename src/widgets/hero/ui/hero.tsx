"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import {
  DUR,
  EASE,
  STAGGER,
  SplitText,
  gsap,
  useGSAP,
  useReducedMotion,
} from "@/shared/motion";
import { Container, SectionLabel } from "@/shared/ui";
import { HEADLINE, Headline } from "./headline";

const SPEC = [
  ["Stack", "React / Vue / TypeScript"],
  ["Motion", "GSAP / ScrollTrigger"],
  ["Base", "Vietnam, UTC+7"],
] as const;

export function Hero() {
  const t = useTranslations("home");
  const root = useRef<HTMLElement>(null);
  const rule = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!root.current) return;

      // clearProps здесь недопустим: он стирает инлайновый font-size строк,
      // а первый проход всегда приходит с reduced=true из серверного снапшота
      if (reduced) return;

      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]", root.current);
      const meta = gsap.utils.toArray<HTMLElement>("[data-hero-meta]", root.current);

      const splits = lines.map(
        (line) =>
          new SplitText(line.querySelector<HTMLElement>("[data-hero-text]")!, {
            type: "chars",
            mask: "chars",
          }),
      );

      // Маски SplitText шире исходного набора, поэтому calc(100cqw / widthEm)
      // из разметки после разбивки уже не попадает в контейнер — доводим замером
      const fitLines = () => {
        for (const line of lines) {
          const text = line.querySelector<HTMLElement>("[data-hero-text]");
          const glyphs = text ? [...text.children] : [];
          if (glyphs.length === 0) continue;

          const target = line.clientWidth;
          line.style.fontSize = "100px";

          const boxes = glyphs.map((glyph) => glyph.getBoundingClientRect());
          const natural =
            Math.max(...boxes.map((box) => box.right)) -
            Math.min(...boxes.map((box) => box.left));

          line.style.fontSize = natural > 0 ? `${(100 * target) / natural}px` : "";
        }
      };

      fitLines();
      const observer = new ResizeObserver(fitLines);
      observer.observe(root.current);

      gsap.set(meta, { opacity: 0, y: 14 });
      splits.forEach((split) => gsap.set(split.chars, { yPercent: 115 }));

      const tl = gsap.timeline({ defaults: { ease: EASE.chars } });

      splits.forEach((split, index) => {
        const at = index * 0.18;
        const band = lines[index].querySelector<HTMLElement>("[data-hero-band]");

        if (band) {
          gsap.set(band, { scaleX: 0 });
          tl.to(band, { scaleX: 1, duration: 0.75, ease: EASE.page }, at);
        }

        tl.to(split.chars, { yPercent: 0, duration: 0.9, stagger: STAGGER.chars }, at + 0.22);
      });

      tl.from(rule.current, { scaleX: 0, duration: DUR.page, ease: EASE.out }, 0.5).to(
        meta,
        { opacity: 1, y: 0, duration: DUR.reveal, stagger: STAGGER.list, ease: EASE.out },
        0.6,
      );

      const mm = gsap.matchMedia();
      mm.add("(min-width: 48rem)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=100%",
              scrub: 1,
              pin: true,
            },
          })
          .to("[data-hero-line]", { yPercent: -14, stagger: 0.04, ease: "none" }, 0)
          .to(meta, { opacity: 0, ease: "none" }, 0)
          .to("[data-hero-bg]", { yPercent: 12, ease: "none" }, 0);
      });

      return () => {
        observer.disconnect();
        mm.revert();
        splits.forEach((split) => split.revert());
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      className="border-border relative flex flex-col justify-between overflow-hidden border-b-2 md:min-h-[100svh]"
    >
      <div
        data-hero-bg
        aria-hidden
        className="rule-y pointer-events-none absolute inset-x-0 -top-[10%] h-[130%] opacity-40"
      />

      <Container className="relative flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <SectionLabel index={1} total={4}>
          {t("role")}
        </SectionLabel>
        <p data-hero-meta className="spec flex shrink-0 items-center gap-2">
          <span className="bg-accent inline-block size-2" aria-hidden />
          {t("availability")}
        </p>
      </Container>

      <Container className="relative py-10 md:py-14">
        <Headline lines={HEADLINE} />
      </Container>

      <div>
        <div ref={rule} className="bg-border relative h-0.5 origin-left" aria-hidden />

        <Container grid className="relative gap-y-6 py-6 md:py-8">
          <div data-hero-meta className="col-span-full lg:col-span-3">
            <p className="spec text-muted">{t("location")}</p>
            <dl className="spec mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              {SPEC.map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="text-muted">{term}</dt>
                  <dd className="normal-case">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p
            data-hero-meta
            className="col-span-full self-end text-balance lg:col-span-5 lg:col-start-5"
          >
            {t("lead")}
          </p>

          <p
            data-hero-meta
            className="spec col-span-full flex items-center gap-3 self-end lg:col-span-3 lg:col-start-10 lg:justify-end"
          >
            <ArrowDown className="size-4 motion-safe:animate-bounce" aria-hidden />
            {t("scroll")}
          </p>
        </Container>
      </div>
    </section>
  );
}
