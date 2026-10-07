"use client";

import { ScrollTrigger } from "@/lib/gsap";

type Setup = () => void | (() => void);

const queue: Array<() => void> = [];
let scheduled = false;

const idle = (cb: () => void) =>
  typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 300 }) : window.setTimeout(cb, 1);

function pump() {
  const job = queue.shift();
  if (!job) {
    scheduled = false;
    // Pins criados depois do Hero: recalcula todas as posições uma única vez.
    ScrollTrigger.refresh();
    return;
  }
  job();
  idle(pump);
}

/**
 * Inicialização GSAP de seções ABAIXO da dobra, fora do commit de hidratação.
 *
 * Por quê: todas as inits rodavam dentro da mesma Long Task da hidratação,
 * atrasando o primeiro frame do Hero (LCP) e somando TBT. Aqui cada seção
 * inicializa depois do primeiro paint, em tarefa própria, na ordem do
 * documento (= ordem de chamada), e no fim há um único ScrollTrigger.refresh().
 * As animações em si não mudam.
 *
 * Uso: useGSAP((context) => deferInit(context, () => { ...; return cleanup }), { scope })
 */
export function deferInit(context: gsap.Context, setup: Setup) {
  let cleanup: void | (() => void);
  let cancelled = false;
  queue.push(() => {
    if (!cancelled) context.add(() => void (cleanup = setup()));
  });
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => idle(pump)); // depois do 1º frame
  }
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
