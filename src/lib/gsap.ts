"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Evita recálculo quando a barra de endereço do mobile aparece/some.
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out" });
}

/** Breakpoints compartilhados entre CSS e gsap.matchMedia. */
export const mq = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  tablet:
    "(min-width: 640px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 639.98px) and (prefers-reduced-motion: no-preference)",
  notMobile: "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
