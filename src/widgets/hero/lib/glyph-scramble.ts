import { gsap } from "@/shared/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TICKS = 7;
const TICK_SECONDS = 0.07;
const SCROLL_QUIET_MS = 200;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function bindLine(line: HTMLElement, chars: HTMLElement[], isScrolling: () => boolean) {
  const originals = new Map(chars.map((char) => [char, char.textContent ?? ""]));
  const scrambles = new Map<HTMLElement, gsap.core.Tween>();
  let current: HTMLElement | null = null;

  const settle = (char: HTMLElement) => {
    char.textContent = originals.get(char) ?? "";
    char.style.width = "";
  };

  const scramble = (char: HTMLElement) => {
    if (scrambles.get(char)?.isActive()) return;

    // Unbounded не моноширинный: без фиксированной ширины перебор раскачивал бы всю строку.
    // Ширина в em, потому что замер героя на время меряет строку на 100px
    // и пиксельная ширина посреди перебора сжала бы строку насовсем
    const fontSize = parseFloat(getComputedStyle(char).fontSize);
    char.style.width = `${char.getBoundingClientRect().width / fontSize}em`;
    const state = { tick: 0 };
    let shown = -1;

    const tween = gsap.to(state, {
      tick: TICKS,
      duration: TICKS * TICK_SECONDS,
      ease: "none",
      onUpdate: () => {
        const tick = Math.floor(state.tick);
        if (tick === shown) return;
        shown = tick;
        char.textContent = tick < TICKS ? randomGlyph() : (originals.get(char) ?? "");
      },
      onComplete: () => settle(char),
    });
    scrambles.set(char, tween);
  };

  const onMove = (event: PointerEvent) => {
    // Под неподвижным курсором при прокрутке едет текст, и Chrome шлёт
    // синтетические pointermove — без них перебор запускался бы от скролла
    if (isScrolling() || (event.movementX === 0 && event.movementY === 0)) return;

    const hit = chars.find((char) => {
      const box = char.getBoundingClientRect();
      return event.clientX >= box.left && event.clientX < box.right;
    });
    if (hit === current) return;

    current = hit ?? null;
    if (hit) scramble(hit);
  };
  const onLeave = () => {
    current = null;
  };

  line.addEventListener("pointermove", onMove);
  line.addEventListener("pointerleave", onLeave);

  return () => {
    line.removeEventListener("pointermove", onMove);
    line.removeEventListener("pointerleave", onLeave);
    scrambles.forEach((tween) => tween.kill());
    chars.forEach(settle);
  };
}

export function bindGlyphScramble(lines: HTMLElement[], charsByLine: HTMLElement[][]) {
  let scrolledAt = -Infinity;
  const onScroll = () => {
    scrolledAt = performance.now();
  };
  const isScrolling = () => performance.now() - scrolledAt < SCROLL_QUIET_MS;

  window.addEventListener("scroll", onScroll, { passive: true });
  const unbinds = lines.map((line, index) =>
    bindLine(line, charsByLine[index] ?? [], isScrolling),
  );

  return () => {
    window.removeEventListener("scroll", onScroll);
    unbinds.forEach((unbind) => unbind());
  };
}
