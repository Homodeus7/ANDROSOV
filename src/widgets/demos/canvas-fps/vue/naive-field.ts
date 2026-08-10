import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
  type PropType,
} from "vue";
import { animateField } from "../model/field";
import { FIELD_CLASS, renderField } from "./field-view";
import { useField } from "./use-field";
import type { FpsDemoState } from "./use-fps-demo";

/**
 * Как это пишется, пока не померили. Позиции — реактивное состояние, и кадр
 * перерисовывает сцену целиком через `left` / `top`, то есть через свойства,
 * участвующие в layout. Дальше идёт проход по связям: у блока снимается
 * прямоугольник, по нему тут же расставляется полоска связи — чтение, запись,
 * чтение, запись. Каждая запись пачкает layout, каждое следующее чтение
 * заставляет браузер пересчитать его синхронно, посреди кадра.
 */
export const NaiveField = defineComponent({
  name: "NaiveField",
  props: {
    state: { type: Object as PropType<FpsDemoState>, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
    const { box, field, revision } = useField(props.state.count);
    const clock = ref(0);

    let blocks: HTMLElement[] = [];
    let wires: HTMLElement[] = [];

    function cache() {
      const root = box.value;
      if (!root) return;
      blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-fps-block]"));
      wires = Array.from(root.querySelectorAll<HTMLElement>("[data-fps-wire]"));
    }

    function measure() {
      const root = box.value;
      if (!root || blocks.length === 0) return;

      const origin = root.getBoundingClientRect();
      props.state.reads.current += 1;

      let previous = blocks[0]!.getBoundingClientRect();
      props.state.reads.current += 1;

      for (let index = 1; index < blocks.length; index += 1) {
        const rect = blocks[index]!.getBoundingClientRect();
        props.state.reads.current += 1;

        const wire = wires[index - 1];
        if (wire) {
          const x = previous.x - origin.x + previous.width / 2;
          const y = previous.y - origin.y + previous.height / 2;
          const dx = rect.x - previous.x + (rect.width - previous.width) / 2;
          const dy = rect.y - previous.y + (rect.height - previous.height) / 2;

          wire.style.left = `${x}px`;
          wire.style.top = `${y}px`;
          wire.style.width = `${Math.hypot(dx, dy)}px`;
          wire.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        }
        previous = rect;
      }
    }

    const off = props.state.onFrame((time) => {
      animateField(field.value, time);
      clock.value = time;
    });

    onMounted(cache);
    onBeforeUnmount(off);
    watch(revision, () => nextTick(cache));
    onUpdated(measure);

    // Метка кадра выведена в атрибут не для красоты: рендер обязан зависеть от
    // часов и от перекладки, и именно эта зависимость перерисовывает всю сцену
    return () =>
      h(
        "div",
        {
          ref: box,
          role: "img",
          "aria-label": props.label,
          class: FIELD_CLASS,
          "data-fps-frame": `${revision.value}:${Math.round(clock.value)}`,
        },
        renderField(field.value, (index) => ({
          width: `${field.value.blockWidth}px`,
          height: `${field.value.blockHeight}px`,
          left: `${field.value.positions[index * 2]}px`,
          top: `${field.value.positions[index * 2 + 1]}px`,
        })),
      );
  },
});
