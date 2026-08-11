"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { downsample, type Column, type Point } from "@/entities/series";
import { useTheme } from "@/shared/theme";

export type ChartApi = { draw: (raw: Point[], folded: Point[]) => void };

type Painter = (raw: Point[], folded: Point[]) => void;

const PAD = 10;
/** Пикселей на колонку: бакетов бывает больше, чем пикселей. */
const COLUMN_PX = 2;

export function RollupChart({ ref, label }: { ref: Ref<ChartApi>; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const painter = useRef<Painter | null>(null);
  const theme = useTheme();

  useImperativeHandle(ref, () => ({
    draw: (raw, folded) => painter.current?.(raw, folded),
  }));

  useEffect(() => {
    const node = canvas.current;
    const context = node?.getContext("2d");
    if (!node || !context) return;

    const styles = getComputedStyle(node);
    const raw = styles.getPropertyValue("--accent-ink").trim();
    const folded = styles.getPropertyValue("--muted").trim();
    const border = styles.getPropertyValue("--border").trim();

    let width = 0;
    let height = 0;
    let series: [Point[], Point[]] = [[], []];

    function paint() {
      if (!context || width === 0) return;
      context.clearRect(0, 0, width, height);

      const points = series[0].length;
      if (points === 0) return;

      const count = Math.max(1, Math.min(Math.round(width / COLUMN_PX), points));
      const columns = series.map((line) => downsample(line, count));

      let top = 0;
      for (const line of columns) {
        for (const column of line) if (column) top = Math.max(top, column.max);
      }
      if (top <= 0) return;

      const step = width / count;
      const y = (value: number) => height - PAD - (value / top) * (height - PAD * 2);

      context.strokeStyle = border;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, height - PAD);
      context.lineTo(width, height - PAD);
      context.stroke();

      const stroke = (line: Column[], color: string, dash: number[]) => {
        context.save();
        context.lineWidth = 2;
        context.strokeStyle = color;
        context.setLineDash(dash);
        context.beginPath();

        let open = false;
        line.forEach((column, index) => {
          if (!column) {
            open = false;
            return;
          }
          const x = index * step + step / 2;
          // Разрыв рвёт путь, а не соединяется прямой: линии через пустоту
          // не существует, её пришлось бы выдумать
          if (open) context.lineTo(x, y(column.max));
          else context.moveTo(x, y(column.max));
          context.lineTo(x, y(column.min));
          open = true;
        });

        context.stroke();
        context.restore();
      };

      stroke(columns[1]!, folded, [6, 4]);
      stroke(columns[0]!, raw, []);
    }

    const resize = () => {
      const rect = node.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      node.width = Math.round(width * ratio);
      node.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(node);

    painter.current = (next, folded) => {
      series = [next, folded];
      paint();
    };

    return () => {
      observer.disconnect();
      painter.current = null;
    };
  }, [theme]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      className="border-border bg-bg block h-[clamp(11rem,22vw,17rem)] w-full border-2"
    />
  );
}
