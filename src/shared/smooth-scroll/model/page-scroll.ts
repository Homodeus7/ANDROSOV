type Controller = {
  setLocked: (locked: boolean) => void;
  toTop: () => Promise<void>;
};

let controller: Controller | undefined;
let depth = 0;

/**
 * Плавная прокрутка слушает колесо на окне и двигает страницу сама, поэтому
 * ни блокировка модалки, ни `window.scrollTo` её не касаются. Владелец Lenis
 * регистрирует управление здесь, а остальной код просит страницу через него.
 */
export function bindPageScroll(next: Controller) {
  controller = next;
  next.setLocked(depth > 0);

  return () => {
    controller = undefined;
  };
}

/** Счётчик, а не флаг: два оверлея иначе отпустили бы страницу на первом закрытии */
export function lockPageScroll() {
  depth += 1;
  if (depth === 1) controller?.setLocked(true);

  return () => {
    depth -= 1;
    if (depth === 0) controller?.setLocked(false);
  };
}

/**
 * Без Lenis — мгновенно: он не загружен либо при `prefers-reduced-motion`,
 * либо пока не приехал чанк, и в обоих случаях анимация здесь не нужна.
 */
export function scrollPageToTop(): Promise<void> {
  if (controller) return controller.toTop();

  window.scrollTo({ top: 0, behavior: "auto" });
  return Promise.resolve();
}
