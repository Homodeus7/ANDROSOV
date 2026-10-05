import { gsap } from "@/shared/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TICKS = 7;
const TICK_SECONDS = 0.07;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function bindLine(line: HTMLElement, chars: HTMLElement[]) {
  const originals = new Map(chars.map((char) => [char, char.textContent ?? ""]));
  const scrambles = new Map<HTMLElement, gsap.core.Tween>();
  let current: HTMLElement | null = null;

  const settle = (char: HTMLElement) => {
    char.textContent = originals.get(char) ?? "";
    char.style.width = "";
  };

  const scramble = (char: HTMLElement) => {
    if (scrambles.get(char)?.isActive()) return;

    // Unbounded не моноширинный: без фиксированной ширины перебор раскачивал бы всю строку
    char.style.width = `${char.getBoundingClientRect().width}px`;
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
  const unbinds = lines.map((line, index) => bindLine(line, charsByLine[index] ?? []));
  return () => unbinds.forEach((unbind) => unbind());
}
