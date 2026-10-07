"use client";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Posição de scroll de uma seção, compatível com os pins do ScrollTrigger.
 * - Seção pinada: mede o pin-spacer (a seção em si fica `fixed` durante o pin)
 *   e soma `progress` × comprimento do pin.
 * - Seção comum: desconta a barra do header para o título não ficar atrás dela.
 */
export function sectionScrollY(id: string, progress = 0) {
  const el = document.getElementById(id);
  if (!el) return null;
  const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : null;
  const box = spacer ?? el;
  const top = box.getBoundingClientRect().top + window.scrollY;
  if (spacer) return top + Math.max(0, spacer.offsetHeight - el.offsetHeight) * progress;
  if (top < 1) return 0;
  const bar = document.querySelector<HTMLElement>("[data-nav-bar]")?.offsetHeight ?? 0;
  return Math.max(0, top - bar);
}

/**
 * HOME: volta ao início REAL da página (scroll 0 = progresso 0 do Hero).
 * Nunca mira o elemento #inicio: com o pin ativo, a posição renderizada dele
 * fica deslocada até o FIM do pin (frame amarelo). `lock` impede que a roda/touch
 * interrompa a rolagem no meio da timeline; o ScrollTrigger sincroniza no fim.
 * Usado pelo logo do navbar e pelo item "Início" do menu.
 */
export function goHome() {
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2, force: true, lock: true, onComplete: () => ScrollTrigger.update() });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" }); // reduced-motion
    ScrollTrigger.update();
  }
}

export function scrollToSection(id: string, progress = 0) {
  const y = sectionScrollY(id, progress);
  if (y === null) return false;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(y, { duration: 1.4, force: true });
  else window.scrollTo({ top: y, behavior: "auto" }); // reduced-motion: sem animação
  return true;
}
