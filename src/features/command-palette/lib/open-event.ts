export const PALETTE_OPEN_EVENT = "portfolio:palette-open";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT));
}
