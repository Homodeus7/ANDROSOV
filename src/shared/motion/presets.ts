export const DUR = {
  color: 0.1,
  move: 0.3,
  reveal: 0.5,
  page: 0.6,
  count: 1.2,
} as const;

export const EASE = {
  out: "power2.out",
  page: "expo.inOut",
  chars: "expo.out",
} as const;

export const STAGGER = {
  chars: 0.015,
  list: 0.08,
} as const;

export const REVEAL_MAX_CHILDREN = 8;
