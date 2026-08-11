import { h, type CSSProperties } from "vue";
import { edgeCount, type Field } from "../model/field";

export const FIELD_CLASS =
  "border-border bg-bg relative h-[clamp(14rem,32vw,20rem)] overflow-hidden border-2";

const BLOCK_CLASS = "border-muted/60 absolute top-0 left-0 border";

/** Связи — повёрнутые полоски, а не SVG: они живут в том же layout, что и блоки. */
const WIRE_CLASS = "bg-muted/50 absolute top-0 left-0 h-px w-px origin-top-left";

/**
 * Разметка у режимов общая: сравниваются способы довести кадр до DOM, а не
 * два разных холста. `styleAt` отдан, когда позицию пишет сам Vue, и опущен,
 * когда её пишет кадр.
 */
export function renderField(field: Field, styleAt: ((index: number) => CSSProperties) | null) {
  // Связи и блоки — дети одного узла, поэтому ключи не имеют права пересечься:
  // связь 138 и блок 138 для Vue один узел, и он берётся сравнивать полоску с
  // блоком. Блоки сдвинуты за последний ключ связи. Числа, а не строки: список
  // пересобирается каждый кадр, и строковый ключ был бы мусором на каждый блок
  const blocks = Array.from({ length: field.count }, (_, index) =>
    h("div", {
      key: field.count + index,
      "data-fps-block": index,
      class: BLOCK_CLASS,
      style: styleAt ? styleAt(index) : undefined,
    }),
  );

  const wires = Array.from({ length: edgeCount(field) }, (_, edge) =>
    h("div", { key: edge, "data-fps-wire": edge, class: WIRE_CLASS }),
  );

  return [...wires, ...blocks];
}
