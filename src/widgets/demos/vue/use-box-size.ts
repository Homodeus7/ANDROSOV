import { onBeforeUnmount, onMounted, ref } from "vue";

export function useBoxSize() {
  const box = ref<HTMLElement | null>(null);
  const width = ref(0);
  const height = ref(0);
  let observer: ResizeObserver | null = null;

  onMounted(() => {
    if (!box.value) return;
    observer = new ResizeObserver(([entry]) => {
      width.value = entry!.contentRect.width;
      height.value = entry!.contentRect.height;
    });
    observer.observe(box.value);
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { box, width, height };
}
