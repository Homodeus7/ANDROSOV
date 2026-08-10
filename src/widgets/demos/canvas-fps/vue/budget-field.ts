import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  watch,
  type PropType,
} from "vue";
import { animateField, centreOf, edgeCount } from "../model/field";
import { FIELD_CLASS, renderField } from "./field-view";
import { useField } from "./use-field";
import type { FpsDemoState } from "./use-fps-demo";

/**
 * Тот же кадр в бюджете, и та же работа: блоки и связи переставляются целиком,
 * никакой хитрости про «обновим только изменившееся» здесь нет. Разница ровно
 * в двух вещах. Координаты берутся из массива, а не снимаются с DOM, поэтому
 * за кадр не читается ни одного прямоугольника и layout некому пересчитывать
 * посреди прохода. И пишется только `transform` — он доезжает до композитора
 * мимо layout, тогда как `left` / `top` / `width` идут через него.
 */
export const BudgetField = defineComponent({
  name: "BudgetField",
  props: {
    state: { type: Object as PropType<FpsDemoState>, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
    const { box, field, revision } = useField(props.state.count);

    let blocks: HTMLElement[] = [];
    let wires: HTMLElement[] = [];

    function cache() {
      const root = box.value;
      if (!root) return;
      blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-fps-block]"));
      wires = Array.from(root.querySelectorAll<HTMLElement>("[data-fps-wire]"));
    }

    function resize() {
      const width = `${field.value.blockWidth}px`;
      const height = `${field.value.blockHeight}px`;
      for (const element of blocks) {
        element.style.width = width;
        element.style.height = height;
      }
    }

    function paint() {
      for (let index = 0; index < blocks.length; index += 1) {
        const x = field.value.positions[index * 2]!;
        const y = field.value.positions[index * 2 + 1]!;
        blocks[index]!.style.transform = `translate(${x}px, ${y}px)`;
      }

      const links = Math.min(wires.length, edgeCount(field.value));
      for (let edge = 0; edge < links; edge += 1) {
        const from = centreOf(field.value, edge);
        const to = centreOf(field.value, edge + 1);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        // scaleX по полоске в один пиксель вместо ширины: длина тоже уезжает
        // в композитор, а не в layout
        wires[edge]!.style.transform =
          `translate(${from.x}px, ${from.y}px) rotate(${Math.atan2(dy, dx)}rad) scaleX(${Math.hypot(dx, dy)})`;
      }
    }

    const off = props.state.onFrame((time) => {
      animateField(field.value, time);
      paint();
    });

    onMounted(() => {
      cache();
      resize();
      paint();
    });

    onBeforeUnmount(off);
    watch(revision, () =>
      nextTick(() => {
        cache();
        resize();
        paint();
      }),
    );

    return () =>
      h(
        "div",
        { ref: box, role: "img", "aria-label": props.label, class: FIELD_CLASS },
        renderField(field.value, null),
      );
  },
});
