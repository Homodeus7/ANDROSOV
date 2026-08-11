type Snapshot = {
  id: string;
  left: number;
  top: number;
  fontSize: number;
  at: number;
};

// Слепок живёт только на время навигации: заголовок, прилетающий заметно позже
// перехода, читается не как продолжение жеста, а как глюк. Потолок считается от
// клика, а между кликом и переходом теперь укладывается подъём страницы — до
// 1.1 с, — поэтому запаса нужно больше, чем на один только переход
const MAX_AGE_MS = 2600;

let pending: Snapshot | null = null;

export function captureFlip(id: string) {
  // Прошлый слепок недействителен в любом случае: даже неудачная попытка
  // означает, что жест начат заново
  pending = null;

  const element = document.querySelector(`[data-flip-id="${id}"]`);
  if (!element) return;

  const rect = element.getBoundingClientRect();

  // Перелетать есть смысл только от того, что на экране. Из палитры карточка
  // легко оказывается вне вьюпорта, и заголовок влетал бы из ниоткуда
  if (rect.bottom < 0 || rect.top > window.innerHeight) return;

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
