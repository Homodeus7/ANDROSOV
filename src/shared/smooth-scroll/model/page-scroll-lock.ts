type Handler = (locked: boolean) => void;

let handler: Handler | undefined;
let depth = 0;

/**
 * Плавная прокрутка слушает колесо на окне и двигает страницу сама, поэтому
 * блокировка модалки её не касается: под открытым оверлеем уезжал сайт.
 * Замок держит счётчик, а не флаг, — два оверлея подряд иначе отпустили бы
 * страницу на первом же закрытии.
 */
export function bindPageScrollLock(next: Handler) {
  handler = next;
  next(depth > 0);
  return () => {
    handler = undefined;
  };
}

export function lockPageScroll() {
  depth += 1;
  if (depth === 1) handler?.(true);

  return () => {
    depth -= 1;
    if (depth === 0) handler?.(false);
  };
}
