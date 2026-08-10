const ORBIT = 0.34;
const PERIOD_MS = 2600;
const GOLDEN_ANGLE = 2.39996;

/**
 * Позиции лежат в обычном `Float64Array`, а не в реактивном состоянии — на
 * этом и держится разница между режимами. Сцена при этом одна: оба режима
 * читают один и тот же буфер, иначе сравнение мерило бы разные картинки.
 */
export type Field = {
  count: number;
  cols: number;
  rows: number;
  blockWidth: number;
  blockHeight: number;
  radius: number;
  homes: Float64Array;
  positions: Float64Array;
};

export function createField(count: number): Field {
  const cols = Math.max(1, Math.round(Math.sqrt(count * 2)));

  return {
    count,
    cols,
    rows: Math.ceil(count / cols),
    blockWidth: 0,
    blockHeight: 0,
    radius: 0,
    homes: new Float64Array(count * 2),
    positions: new Float64Array(count * 2),
  };
}

export function resizeField(field: Field, width: number, height: number): void {
  const cellWidth = width / field.cols;
  const cellHeight = height / field.rows;

  field.blockWidth = Math.max(6, cellWidth * 0.62);
  field.blockHeight = Math.max(4, Math.min(cellHeight * 0.5, 24));
  field.radius = Math.min(cellWidth - field.blockWidth, cellHeight - field.blockHeight) * ORBIT;

  for (let index = 0; index < field.count; index += 1) {
    field.homes[index * 2] = (index % field.cols) * cellWidth;
    field.homes[index * 2 + 1] = Math.floor(index / field.cols) * cellHeight;
  }
  field.positions.set(field.homes);
}

/**
 * Двигаются все блоки: сравниваются способы доставки кадра, и работа в обоих
 * режимах должна быть одна и та же. Фаза разведена золотым углом, иначе сцена
 * ходила бы строем и разница читалась бы как разная анимация.
 */
export function animateField(field: Field, time: number): void {
  const turn = (time / PERIOD_MS) * Math.PI * 2;

  for (let index = 0; index < field.count; index += 1) {
    const angle = turn + index * GOLDEN_ANGLE;
    field.positions[index * 2] = field.homes[index * 2]! + Math.cos(angle) * field.radius;
    field.positions[index * 2 + 1] =
      field.homes[index * 2 + 1]! + Math.sin(angle) * field.radius;
  }
}

export const edgeCount = (field: Field) => Math.max(0, field.count - 1);

export function centreOf(field: Field, index: number): { x: number; y: number } {
  return {
    x: field.positions[index * 2]! + field.blockWidth / 2,
    y: field.positions[index * 2 + 1]! + field.blockHeight / 2,
  };
}
