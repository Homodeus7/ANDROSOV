type Snapshot = {
  id: string;
  left: number;
  top: number;
  fontSize: number;
  at: number;
};

// Слепок живёт только на время навигации: заголовок, прилетающий через
// секунду после перехода, читается не как продолжение жеста, а как глюк
const MAX_AGE_MS = 1500;

let pending: Snapshot | null = null;

export function captureFlip(id: string) {
  const element = document.querySelector(`[data-flip-id="${id}"]`);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  pending = {
    id,
    left: rect.left,
    top: rect.top,
    fontSize: parseFloat(getComputedStyle(element).fontSize),
    at: performance.now(),
  };
}

export function consumeFlip(id: string) {
  const current = pending;
  pending = null;

  if (!current || current.id !== id) return null;
  if (performance.now() - current.at > MAX_AGE_MS) return null;

  return current;
}
