import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { CANVAS_SPAN, type Block } from "@/entities/flow";
import type { FlowDemoState } from "./use-flow-demo";

const BLOCK_HEIGHT = 52;
const ARROW_GAP = 30;

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

export const FlowCanvas = defineComponent({
  name: "FlowCanvas",
  props: {
    state: { type: Object as PropType<FlowDemoState>, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
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

    const blockWidth = computed(() => Math.max(96, Math.min(140, width.value * 0.3)));
    const travelX = computed(() => Math.max(1, width.value - blockWidth.value));
    const travelY = computed(() => Math.max(1, height.value - BLOCK_HEIGHT));

    const left = (block: Block) => (block.x / CANVAS_SPAN) * travelX.value;
    const top = (block: Block) => (block.y / CANVAS_SPAN) * travelY.value;
    const centre = (block: Block) => ({
      x: left(block) + blockWidth.value / 2,
      y: top(block) + BLOCK_HEIGHT / 2,
    });

    type Drag = {
      id: string;
      grabX: number;
      grabY: number;
      fromX: number;
      fromY: number;
      moved: boolean;
    };

    let drag: Drag | null = null;
    let swallowClick = false;

    function onPointerDown(event: PointerEvent, block: Block) {
      const rect = box.value?.getBoundingClientRect();
      if (!rect || event.button !== 0) return;

      drag = {
        id: block.id,
        grabX: event.clientX - rect.left - left(block),
        grabY: event.clientY - rect.top - top(block),
        fromX: event.clientX,
        fromY: event.clientY,
        moved: false,
      };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = box.value?.getBoundingClientRect();
      if (!drag || !rect) return;

      // Дрожание руки на клике не должно превращаться в перетаскивание
      if (!drag.moved && Math.hypot(event.clientX - drag.fromX, event.clientY - drag.fromY) < 4)
        return;
      drag.moved = true;

      const x = clamp(event.clientX - rect.left - drag.grabX, travelX.value);
      const y = clamp(event.clientY - rect.top - drag.grabY, travelY.value);
      props.state.move(
        drag.id,
        Math.round((x / travelX.value) * CANVAS_SPAN),
        Math.round((y / travelY.value) * CANVAS_SPAN),
      );
    }

    function onPointerUp(event: PointerEvent) {
      if (!drag) return;
      // click прилетает уже после pointerup, поэтому решение о нём принимаем здесь
      swallowClick = drag.moved;
      drag = null;
      const target = event.currentTarget as HTMLElement;
      if (target.hasPointerCapture(event.pointerId))
        target.releasePointerCapture(event.pointerId);
    }

    // Клик после настоящего перетаскивания — хвост жеста, а не выбор блока.
    // Сам обработчик нужен ради клавиатуры: Enter на кнопке шлёт только click
    function onClick(block: Block) {
      if (swallowClick) {
        swallowClick = false;
        return;
      }
      props.state.pick(block.id);
    }

    function renderEdges() {
      const lookup = new Map(props.state.scene.value.blocks.map((block) => [block.id, block]));

      return h(
        "svg",
        { class: "text-muted absolute inset-0 h-full w-full", "aria-hidden": "true" },
        [
          h("defs", [
            h(
              "marker",
              {
                id: "flow-arrow",
                viewBox: "0 0 8 8",
                refX: "7",
                refY: "4",
                markerWidth: "5",
                markerHeight: "5",
                orient: "auto",
              },
              [h("path", { d: "M0 0 L8 4 L0 8 Z", fill: "currentColor" })],
            ),
          ]),
          ...props.state.scene.value.edges.flatMap((edge) => {
            const from = lookup.get(edge.from);
            const to = lookup.get(edge.to);
            if (!from || !to) return [];

            const a = centre(from);
            const b = centre(to);
            const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const pull = Math.min(ARROW_GAP, distance / 2);

            return [
              h("line", {
                key: `${edge.from}-${edge.to}`,
                x1: a.x,
                y1: a.y,
                x2: b.x - ((b.x - a.x) / distance) * pull,
                y2: b.y - ((b.y - a.y) / distance) * pull,
                stroke: "currentColor",
                "stroke-width": 2,
                "marker-end": "url(#flow-arrow)",
              }),
            ];
          }),
        ],
      );
    }

    function renderBlock(block: Block) {
      const isSelected = props.state.selected.value === block.id;
      const isSource = isSelected && props.state.connecting.value;

      return h(
        "button",
        {
          key: block.id,
          type: "button",
          "data-block": block.id,
          "aria-pressed": isSelected,
          class: [
            "absolute flex touch-none cursor-grab flex-col justify-center gap-0.5 border-2 px-3 text-left transition-colors active:cursor-grabbing",
            isSource
              ? "border-accent bg-accent text-on-accent"
              : isSelected
                ? "border-accent-ink bg-surface text-fg"
                : "border-muted/60 bg-surface text-fg hover:border-fg",
          ],
          style: {
            left: `${left(block)}px`,
            top: `${top(block)}px`,
            width: `${blockWidth.value}px`,
            height: `${BLOCK_HEIGHT}px`,
          },
          onPointerdown: (event: PointerEvent) => onPointerDown(event, block),
          onPointermove: onPointerMove,
          onPointerup: onPointerUp,
          onPointercancel: onPointerUp,
          onClick: () => onClick(block),
        },
        [
          h(
            "span",
            { class: "spec flex items-baseline justify-between gap-2 leading-none opacity-60" },
            [
              h("span", { class: "text-[0.625rem]" }, block.id),
              h("span", { class: "text-[0.625rem]" }, block.kind),
            ],
          ),
          h("span", { class: "truncate text-xs leading-tight font-medium" }, block.name),
        ],
      );
    }

    return () =>
      h(
        "div",
        {
          ref: box,
          role: "application",
          "aria-label": props.label,
          class:
            "border-border bg-bg relative h-[clamp(15rem,38vw,21rem)] overflow-hidden border-2",
        },
        [renderEdges(), ...props.state.scene.value.blocks.map(renderBlock)],
      );
  },
});
