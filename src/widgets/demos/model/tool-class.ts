const BASE =
  "spec min-h-11 shrink-0 cursor-pointer border-2 px-3 disabled:pointer-events-none disabled:opacity-35";

/** Один и тот же вид кнопки в демо на Vue и в демо на React — строка общая. */
export const toolClass = (active = false) =>
  `${BASE} ${active ? "border-accent bg-accent text-on-accent" : "border-border text-fg flood"}`;
