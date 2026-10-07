"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scrollToSection";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis dirigido pelo ticker do GSAP (um único rAF para tudo).
 * Desativado com prefers-reduced-motion. Em touch, o scroll continua nativo.
 * Âncoras internas (#id) usam scrollToSection (ciente dos pins) em ambos os modos;
 * `data-scroll-progress` no link define o ponto dentro de uma seção pinada.
 */
export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!id || id.startsWith("placeholder")) return;
      if (scrollToSection(id, Number(a.dataset.scrollProgress ?? 0))) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return () => document.removeEventListener("click", onClick);

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
