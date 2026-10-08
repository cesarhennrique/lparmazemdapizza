"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, mq, useGSAP } from "@/lib/gsap";
import { assets } from "@/config/assets";
import { primaryOrder } from "@/config/site";
import { Sparkle } from "@/components/ui/Graphics";
import { OrderButton } from "@/components/ui/StickerButton";

/** "DUVIDO." dividido em grupos: a fatia passa na frente de "VI" e atrás de "DO.". */
const GROUPS = [
  { id: "L", text: "DU", front: false },
  { id: "M", text: "VI", front: false },
  { id: "R", text: "DO.", front: true },
] as const;

/**
 * HERO MOMENT — "UMA FATIA? / DUVIDO."
 *
 * Tudo é medido em --duv (tamanho da fonte de DUVIDO), então a relação
 * palavra ↔ fatia é a mesma em qualquer viewport:
 *   --word-x / --word-y  centro-esquerdo da palavra
 *   --sw / --sx / --sy   largura e posição da fatia (em múltiplos de --duv)
 *   --eb                 tamanho de "UMA FATIA?"
 *
 * Planos (z, dentro da seção isolada):
 *   10  "UMA FATIA?" + "DUVIDO." (camada de trás, palavra inteira)
 *   15  revelação amarela (cresce ATRÁS da fatia no fim)
 *   20  fatia (+ brilho)
 *   30  "DO." (camada da frente — duplicata exata, só esse grupo visível)
 *   40  CTA mobile
 *
 * Camadas de transform: [data-s] scroll · [data-intro]/[data-rise] entrada ·
 * [data-px] parallax do ponteiro · [data-float] respiração.
 *
 * Scroll (pin; desktop +=120%, tablet/mobile +=95%). Os tempos abaixo são os
 * da timeline original; no código, T()/D() encolhem a leitura inicial (18% → 8%)
 * e remapeiam o resto proporcionalmente:
 *   0.00 → 0.18  leitura (quase parado)
 *   0.18 → 0.42  fatia avança, cresce e gira; "DU" e "DO." abrem um pouco
 *   0.42 → 0.68  fatia ao centro; "UMA FATIA?" sai; DUVIDO se separa em 3 grupos
 *   0.68 → 0.84  grupos saem (lados / baixo); fatia domina, centralizada
 *   0.72 → 0.92  o amarelo do Manifesto cresce atrás da fatia
 *   0.86 → 1.00  a fatia avança e sobe para fora do quadro; fica só o amarelo
 *
 * A caixa (assets.heroBox) saiu do Hero — reservada para "Como pedir".
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: mq.motion,
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 639.98px)",
          finePointer: "(hover: hover) and (pointer: fine)",
        },
        (ctx) => {
          const { motion, desktop, mobile, finePointer } = ctx.conditions as Record<string, boolean>;

          if (!motion) {
            gsap.set(q("[data-intro]"), { autoAlpha: 1 });
            return;
          }

          const el = root.current!;
          const slice = q("[data-s='slice']")[0] as HTMLElement;
          const group = (id: string) => q(`[data-g='${id}']`); // as duas camadas juntas

          /* ── ENTRADA (~1.4s) ─────────────────────────── */
          gsap.set(q("[data-intro]"), { autoAlpha: 1 });
          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          intro
            .from(q("[data-rise='eyebrow']"), { yPercent: 110, duration: 0.8 }, 0.2)
            .from(q("[data-rise='word']"), { yPercent: 105, duration: 0.95, stagger: 0.07 }, 0.3)
            .from(
              q("[data-intro='slice']"),
              { x: "18vw", y: "10vh", scale: 0.82, rotation: 10, autoAlpha: 0, duration: 1.15, ease: "power4.out" },
              0.4,
            )
            .from(q("[data-intro='spark']"), { scale: 0, rotation: -90, duration: 0.6, ease: "power3.out" }, 1.0)
            .from(q("[data-intro='bar']"), { autoAlpha: 0, y: 20, duration: 0.6, ease: "power3.out" }, 0.9);

          // Respiração MUITO sutil da fatia.
          const float = gsap.to(q("[data-float]"), {
            y: -6,
            rotation: "+=0.7",
            duration: 3.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          });
          intro.eventCallback("onComplete", () => float.play());

          // Parallax do ponteiro: poucos pixels, só com mouse.
          let onMove: ((e: PointerEvent) => void) | undefined;
          if (finePointer && desktop) {
            const sx = gsap.quickTo(q("[data-px='slice']"), "x", { duration: 1.2, ease: "power3.out" });
            const sy = gsap.quickTo(q("[data-px='slice']"), "y", { duration: 1.2, ease: "power3.out" });
            onMove = (e) => {
              sx((e.clientX / window.innerWidth - 0.5) * 12);
              sy((e.clientY / window.innerHeight - 0.5) * 8);
            };
            el.addEventListener("pointermove", onMove);
          }

          /* ── SCROLL ───────────────────────────────────── */
          // Medidas sem transforms (offset*), reavaliadas no refresh.
          const sliceToCenter = () => ({
            x: window.innerWidth / 2 - (slice.offsetLeft + slice.offsetWidth / 2),
            y: window.innerHeight / 2 - (slice.offsetTop + slice.offsetHeight / 2),
          });
          const maxScale = () => Math.min(1.6, (assets.heroSlice.width * 1.1) / slice.offsetWidth);
          const vw = (n: number) => () => (window.innerWidth * n) / 100;
          // Retiming: a "leitura" inicial encolhe de 18% para 8% do pin (a entrada
          // já é por tempo); o restante da timeline original é remapeado por T()/D().
          const T = (t: number) => 0.08 + ((t - 0.18) * 0.92) / 0.82;
          const D = (d: number) => (d * 0.92) / 0.82;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: desktop ? "+=120%" : "+=95%",
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                if (self.isActive) float.pause();
                else if (self.progress === 0) float.play();
              },
            },
          });

          tl
            // 0 → 0.08 · leitura
            .to(slice, { scale: 1.02, duration: 0.08 }, 0)
            .to(q("[data-s='bar']"), { autoAlpha: 0, y: 30, duration: 0.08 }, 0)
            .to(q("[data-s='spark']"), { scale: 0, rotation: 90, duration: 0.1 }, 0.06)

            // 0.18 → 0.42 · fatia avança; a palavra "abre" para ela passar
            .to(
              slice,
              {
                x: () => sliceToCenter().x * 0.3,
                y: () => sliceToCenter().y * 0.2,
                scale: 1.15,
                rotation: 4,
                duration: D(0.24),
                ease: "power1.inOut",
              },
              T(0.18),
            )
            .to(group("L"), { x: vw(-1.5), duration: D(0.24), ease: "power1.inOut" }, T(0.18))
            .to(group("R"), { x: vw(2), duration: D(0.24), ease: "power1.inOut" }, T(0.18))

            // 0.42 → 0.68 · fatia ao centro; eyebrow sai; DUVIDO se separa
            .to(
              slice,
              {
                x: () => sliceToCenter().x,
                y: () => sliceToCenter().y,
                scale: () => maxScale() * 0.85,
                rotation: -2,
                duration: D(0.26),
                ease: "power2.inOut",
              },
              T(0.42),
            )
            .to(q("[data-s='eyebrow']"), { y: () => -window.innerHeight * 0.12, autoAlpha: 0, duration: D(0.18), ease: "power2.in" }, T(0.42))
            .to(group("L"), { x: vw(mobile ? -10 : -14), duration: D(0.26), ease: "power2.inOut" }, T(0.42))
            .to(group("M"), { y: () => window.innerHeight * 0.06, autoAlpha: 0.35, duration: D(0.26), ease: "power2.inOut" }, T(0.42))
            .to(group("R"), { x: vw(mobile ? 12 : 16), duration: D(0.26), ease: "power2.inOut" }, T(0.42))

            // 0.68 → 0.84 · tipografia sai; pizza domina
            .to(group("L"), { x: vw(-75), autoAlpha: 0, duration: D(0.18), ease: "power2.in" }, T(0.68))
            .to(group("R"), { x: vw(75), autoAlpha: 0, duration: D(0.18), ease: "power2.in" }, T(0.68))
            .to(group("M"), { y: () => window.innerHeight * 0.3, autoAlpha: 0, duration: D(0.14), ease: "power2.in" }, T(0.68))
            .to(slice, { scale: maxScale, y: () => sliceToCenter().y - window.innerHeight * 0.08, rotation: -5, duration: D(0.18) }, T(0.68))
            // 0.72 → 0.92 · o amarelo cresce atrás da fatia (centro da tela)
            .fromTo(
              q("[data-s='reveal']"),
              { clipPath: "circle(0% at 50% 50%)" },
              { clipPath: "circle(75% at 50% 50%)", duration: D(0.2), ease: "power2.inOut" },
              T(0.72),
            )
            // 0.86 → 1 · a fatia avança e sobe para fora; o amarelo assume
            .to(
              slice,
              { y: () => sliceToCenter().y - window.innerHeight * 1.15, rotation: -12, duration: D(0.14), ease: "power2.in" },
              T(0.86),
            );

          return () => {
            if (onMove) el.removeEventListener("pointermove", onMove);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  /** "UMA FATIA?" + "DUVIDO." — mesma geometria nas duas camadas. */
  const headline = (layer: "back" | "front") => (
    <span
      aria-hidden
      className={`absolute flex flex-col items-start left-(--word-x) top-[calc(var(--word-y)-0.49*var(--duv)-0.86*var(--eb))] ${
        layer === "back" ? "z-10" : "z-30"
      }`}
    >
      <span data-s={layer === "back" ? "eyebrow" : undefined} className={`block ${layer === "front" ? "invisible" : ""}`}>
        <span className="block overflow-clip py-[0.12em] -my-[0.12em]">
          <span data-rise={layer === "back" ? "eyebrow" : undefined} className="block text-cream [font-size:var(--eb)]">
            Uma fatia?
          </span>
        </span>
      </span>
      <span className="mt-[calc(0.06*var(--duv))] block whitespace-nowrap text-butter [font-size:var(--duv)]">
        {GROUPS.map((g) => (
          <span key={g.id} data-g={g.id} className="inline-block will-change-transform">
            <span className="inline-block overflow-clip py-[0.1em] -my-[0.1em] align-top">
              <span
                data-rise="word"
                className={`inline-block ${layer === "front" && !g.front ? "invisible" : ""} ${
                  layer === "front" ? "[text-shadow:0_0.015em_0.06em_rgba(70,0,0,0.35)]" : ""
                }`}
              >
                {g.text}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );

  return (
    <section
      ref={root}
      id="inicio"
      aria-label="Armazém da Pizza"
      className="relative h-[100svh] min-h-[560px] overflow-clip bg-tomato text-cream
        [--duv:32vw] [--eb:12vw] [--word-x:var(--gutter)] [--word-y:49svh] [--sw:4.8] [--sx:0.98] [--sy:-1.27]
        sm:[--duv:27vw] sm:[--eb:6vw] sm:[--word-y:50svh] sm:[--sw:3.1] sm:[--sx:1.0] sm:[--sy:-0.8]
        lg:[--duv:min(27vw,42svh)] lg:[--eb:calc(0.19*var(--duv))] lg:[--word-x:4vw] lg:[--word-y:51svh] lg:[--sw:2.65] lg:[--sx:1.14] lg:[--sy:-0.77]"
    >
      <h1 aria-label="Uma fatia? Duvido." data-intro="headline" className="font-display pointer-events-none absolute inset-0">
        {headline("back")}
        {headline("front")}
      </h1>

      {/* Fatia — atravessa DUVIDO (na frente de "VI", atrás de "DO.") */}
      <div
        data-s="slice"
        className="pointer-events-none absolute z-20 w-[calc(var(--sw)*var(--duv))] left-[calc(var(--word-x)+var(--sx)*var(--duv))] top-[calc(var(--word-y)+var(--sy)*var(--duv))]"
      >
        <div data-intro="slice">
          <div data-px="slice">
            <div data-float className="rotate-4">
              <Image
                src={assets.heroSlice.src}
                width={assets.heroSlice.width}
                height={assets.heroSlice.height}
                alt={assets.heroSlice.alt}
                preload
                sizes="(min-width:1024px) 72vw, (min-width:640px) 84vw, 120vw"
                className="h-auto w-full object-contain drop-shadow-[0_36px_36px_rgba(70,0,0,0.35)]"
              />
            </div>
          </div>
        </div>
        {/* Único grafismo: brilho na borda da fatia */}
        <div data-s="spark" aria-hidden className="absolute left-[71%] top-[3%] w-[4.5%]">
          <div data-intro="spark">
            <Sparkle className="w-full text-cream" />
          </div>
        </div>
      </div>

      {/* CTA — somente mobile/tablet (no desktop ele vive no header) */}
      <div data-s="bar" className="absolute inset-x-0 bottom-0 z-40 gutter pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <div data-intro="bar">
          <OrderButton link={primaryOrder} tone="butter" size="md" className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Revelação para o Manifesto — atrás da fatia (z-15 < z-20) */}
      <div
        data-s="reveal"
        aria-hidden
        className="pointer-events-none absolute inset-0 z-15 bg-butter [clip-path:circle(0%_at_50%_50%)]"
      />
    </section>
  );
}
