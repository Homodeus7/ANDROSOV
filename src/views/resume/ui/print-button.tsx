"use client";

/**
 * PDF печатает сам браузер. Генератор в бандле означал бы вторую вёрстку
 * резюме, которая рано или поздно разойдётся с первой; печатная таблица
 * стилей работает с той же разметкой.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="spec border-border text-fg flood min-h-11 cursor-pointer border-2 px-3 print:hidden"
    >
      {label}
    </button>
  );
}
