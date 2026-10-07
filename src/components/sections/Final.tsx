"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, mq, useGSAP } from "@/lib/gsap";
import { deferInit } from "@/lib/deferInit";
import { assets } from "@/config/assets";
import { site } from "@/config/site";
import { OrderButton } from "@/components/ui/StickerButton";
import { RoundSticker, Sparkle } from "@/components/ui/Graphics";

/**
 * FINAL — "BATEU A FOME? / A GENTE CHEGA." e a caixa literalmente chega.
 *
 * Uma tela (sem pin). Ordem visual: título → CTAs → caixa + selo.
 * A caixa (mesmo asset de "Como pedir") fica centrada, cortada pela borda
 * inferior (~metade visível), atrás dos CTAs; o selo encosta no canto dela.
 *
 * Entrada única ao chegar (~1.6s), depois estático:
 *   linha 1 por máscara → linha 2 com mais impacto → CTAs em sequência →
 *   caixa sobe de fora da seção e desacelera (rotação some) → selo.
 * Reduced-motion: composição final direta.
 */
export function Final() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    // Abaixo da dobra: inicializa depois do 1º paint (ver lib/deferInit).
    (context) => deferInit(context, () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
          })
          .from(q("[data-line='1']"), { yPercent: 105, duration: 0.8 }, 0)
          .from(q("[data-line='2']"), { yPercent: 105, scale: 1.08, duration: 0.95, transformOrigin: "50% 100%" }, 0.15)
          .from(q("[data-cta]"), { y: 28, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.45)
          .from(q("[data-box]"), { yPercent: 75, rotation: 7, duration: 1.15, ease: "power3.out" }, 0.55)
          .from(q("[data-seal]"), { scale: 0, rotation: -120, duration: 0.7, ease: "back.out(1.6)" }, 1.05);
      });
      return () => mm.revert();
    }),
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="pedir"
      aria-labelledby="pedir-title"
      className="relative flex h-[100svh] min-h-[620px] flex-col overflow-clip bg-tomato text-cream"
    >
      {/* Transição amarelo → vermelho (mantida) */}
      <div className="checker h-[clamp(14px,1.6vw,22px)] shrink-0 [--c1:var(--color-ink)] [--c2:var(--color-tomato)] [--s:clamp(7px,0.8vw,11px)]" />

      <div className="relative z-10 flex flex-col items-center gutter pt-[calc(var(--header-safe-area)+clamp(0.75rem,4svh,2.5rem))] text-center">
        <h2 id="pedir-title" className="font-display text-[clamp(3.2rem,14.5vw,5.75rem)] leading-[0.9] sm:text-[clamp(4.5rem,min(11.5vw,16svh),12rem)]">
          <span className="block overflow-clip pt-[0.12em] -mt-[0.12em]">
            <span data-line="1" className="block">
              Bateu a fome?
            </span>
          </span>
          <span className="block overflow-clip pt-[0.12em] -mt-[0.12em]">
            <span data-line="2" className="block text-butter">
              A gente chega.
            </span>
          </span>
        </h2>

        <div className="mt-[clamp(1.5rem,4.5svh,2.75rem)] flex w-full max-w-[22rem] flex-col items-stretch gap-3.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
          <div data-cta>
            <OrderButton link={site.order.whatsapp} tone="butter" size="lg" className="w-full" />
          </div>
          <div data-cta>
            <OrderButton link={site.order.ifood} tone="cream" size="lg" className="w-full" />
          </div>
          <div data-cta>
            <OrderButton link={site.order.retirada} tone="ink" size="lg" className="w-full" />
          </div>
        </div>
      </div>

      {/* Caixa chegando pela borda inferior (atrás dos CTAs) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(88vw,46svh)] -translate-x-1/2 translate-y-[48%] sm:w-[min(72vw,52svh)] sm:translate-y-[50%] lg:w-[min(44vw,74svh)]"
      >
        <div data-box className="relative">
          <div className="-rotate-3">
            <Image
              src={assets.heroBox.src}
              width={assets.heroBox.width}
              height={assets.heroBox.height}
              alt=""
              sizes="(min-width:1024px) 44vw, (min-width:640px) 72vw, 88vw"
              className="h-auto w-full object-contain drop-shadow-[0_-18px_40px_rgba(70,0,0,0.35)]"
            />
          </div>

          {/* Selo no canto superior esquerdo da caixa */}
          <div data-seal className="absolute -top-[9%] -left-[1%] sm:-left-[9%] w-[clamp(5.25rem,26%,10rem)]">
            <RoundSticker
              text="Felicidade na caixa • Felicidade na caixa • "
              className="-rotate-12 rounded-full bg-butter text-ink shadow-[0.2rem_0.25rem_0_var(--color-ink)]"
              center={<Sparkle className="w-[28%] text-tomato" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
