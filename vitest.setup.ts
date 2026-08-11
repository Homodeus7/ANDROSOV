import "@testing-library/jest-dom/vitest";

// jsdom не реализует `matchMedia`, а ScrollTrigger зовёт его при регистрации:
// без заглушки падает любой тест, чей импорт хоть где-то доходит до GSAP
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
