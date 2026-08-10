import { ref, shallowRef, watch, type Ref } from "vue";
import { useBoxSize } from "../../vue/use-box-size";
import { createField, resizeField } from "../model/field";

/**
 * `revision` растёт, когда геометрия пересобрана — на неё подписываются обе
 * стратегии, потому что `resizeField` меняет буфер на месте и реактивность
 * такого изменения не видит. Это не обход Vue, а ровно то, ради чего массив
 * вынесен из-под неё.
 */
export function useField(count: Ref<number>) {
  const { box, width, height } = useBoxSize();
  const field = shallowRef(createField(count.value));
  const revision = ref(0);

  function relayout() {
    if (width.value === 0 || height.value === 0) return;
    resizeField(field.value, width.value, height.value);
    revision.value += 1;
  }

  watch(count, (next) => {
    field.value = createField(next);
    relayout();
  });

  watch([width, height], relayout);

  return { box, field, revision };
}
