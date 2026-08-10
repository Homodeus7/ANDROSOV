export type WindowParams = {
  scrollTop: number;
  viewport: number;
  rowHeight: number;
  total: number;
  overscan?: number;
};

export type WindowSlice = {
  start: number;
  end: number;
  padTop: number;
  totalHeight: number;
};

/**
 * Только арифметика: где именно окно берёт строки, проверяется без браузера.
 * `overscan` — запас по строке сверху и снизу, чтобы на границе прокрутки не
 * появлялась пустая полоса.
 */
export function sliceFor({
  scrollTop,
  viewport,
  rowHeight,
  total,
  overscan = 4,
}: WindowParams): WindowSlice {
  const totalHeight = total * rowHeight;
  if (total === 0 || rowHeight <= 0) return { start: 0, end: 0, padTop: 0, totalHeight: 0 };

  const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const visible = Math.ceil(Math.max(0, viewport) / rowHeight);

  const start = Math.max(0, Math.min(total - 1, first - overscan));
  const end = Math.min(total, first + visible + overscan);

  return { start, end, padTop: start * rowHeight, totalHeight };
}
