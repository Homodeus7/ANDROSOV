"use client";

export const TITLE_MS = 600;

/** Хвост поверх ухода: без него маршрут меняется на последних кадрах затухания */
export const TITLE_TAIL_MS = 80;

const root = () => document.documentElement;

const title = () => document.querySelector<HTMLElement>("[data-page-title]");

let leaving = false;

let left: { node: HTMLElement | null; text: string } = { node: null, text: "" };

let epoch = 0;

export const isLeaving = () => leaving;

export function hasArrived() {
  const { node, text } = left;
  return !node || !node.isConnected || node.textContent !== text;
}

export function beginLeave() {
  const node = title();
  left = { node, text: node?.textContent ?? "" };
  leaving = true;
  epoch += 1;
  root().setAttribute("data-leaving", "");

  return epoch;
}

export function endLeave(token?: number) {
  if (token !== undefined && token !== epoch) return;

  leaving = false;
  left = { node: null, text: "" };
  root().removeAttribute("data-leaving");
}
