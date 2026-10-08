"use client";

import { useRef } from "react";
import { gsap, mq, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { deferInit } from "@/lib/deferInit";
import { Scribble, Sparkle } from "@/components/ui/Graphics";

const marquee = ["Delivery ou retirada", "Domingo a domingo", "18h às 22h", "Uma fatia? Duvido.", "Felicidade na caixa"];

/**
 * MANIFESTO (calmo)
 * Pin curto (45% / 40% no mobile); cada palavra acende de forma contínua (scrub),
 * começando já na subida da seção (top 35%) e terminando no fim do pin.
 *   0.00 → 0.85  palavras 14% → 100% de opacidade, em ordem
 *   0.70 → 0.95  rabisco sublinha "queijo pra puxar"
 * Depois: faixa xadrez com marquee que reage à velocidade do scroll.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    // Abaixo da dobra: inicializa depois do 1º paint (ver lib/deferInit).
    (context) => deferInit(context, () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(mq.motion, () => {
        const split = SplitText.create(q("[data-manifesto]"), { type: "words", aria: "none" }) // <p> não aceita aria-label;
        // Pin curto + timeline que já começa enquanto a seção sobe (top 35%):
        // sem trecho "amarelo parado" entre o fim do Hero e a primeira palavra.
        const pinEl = q("[data-pin]")[0];
        const pinLen = () => window.innerHeight * (window.innerWidth < 640 ? 0.4 : 0.45);
        ScrollTrigger.create({ trigger: pinEl, start: "top top", end: () => `+=${pinLen()}`, pin: true });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinEl,
            start: "top 35%",
            end: () => `+=${window.innerHeight * 0.35 + pinLen()}`, // = fim do pin
            scrub: 0.6,
          },
        });
        tl.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.85 / split.words.length, duration: 0.15 }, 0)
          .fromTo(q("[data-draw]"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25 }, 0.7)
          .from(q("[data-note]"), { autoAlpha: 0, rotation: -12, scale: 0.6, duration: 0.15, ease: "back.out(2)" }, 0.05);

        // Marquee: loop infinito + aceleração/skew pela velocidade do scroll.
        const loop = gsap.to(track.current, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
        const skew = gsap.quickTo(track.current, "skewX", { duration: 0.4, ease: "power3.out" });
        ScrollTrigger.create({
          trigger: q("[data-marquee]")[0],
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
            loop.timeScale(1 + Math.abs(v) * 4);
            skew(v * -8);
          },
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      });

      return () => mm.revert();
    }),
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" aria-label="Manifesto" className="relative bg-butter text-ink">
      <div data-pin className="relative flex min-h-[100svh] flex-col items-center justify-center gutter py-24">
        <p
          data-note
          className="mb-[clamp(1.5rem,4svh,3rem)] -rotate-3 rounded-full bg-ink px-4 py-1.5 font-hand text-[clamp(1.2rem,1.8vw,1.6rem)] leading-none font-bold text-butter"
        >
          manifesto curto, porque a pizza esfria
        </p>
        <p
          data-manifesto
          className="max-w-[17ch] text-center text-[clamp(2.1rem,5.6vw,5.6rem)] leading-[1.02] font-extrabold tracking-[-0.035em] [font-stretch:80%] sm:max-w-[19ch]"
        >
          A gente não faz pizza pra foto. Mas ela sai bem em todas. Chega rápido, chega quente e chega com{" "}
          <span className="relative inline-block text-tomato">
            queijo pra puxar.
            <Scribble className="absolute -bottom-[0.12em] left-0 h-[0.32em] w-full text-tomato" />
          </span>
        </p>
      </div>

      {/* Faixa xadrez + marquee */}
      <div data-marquee className="relative z-10 -my-6 overflow-clip py-6">
        <div className="checker -rotate-2 scale-x-110 border-y-[3px] border-ink py-[clamp(0.5rem,1.2vw,0.9rem)] [--c1:var(--color-tomato)] [--c2:var(--color-cream)] [--s:12px]">
          <div className="bg-ink py-[clamp(0.6rem,1.4vw,1.1rem)]">
            <div ref={track} className="flex w-max will-change-transform">
              {[0, 1].map((k) => (
                <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
                  {marquee.map((t) => (
                    <li key={t} className="flex items-center gap-[clamp(1rem,2.5vw,2.25rem)] pr-[clamp(1rem,2.5vw,2.25rem)] font-display text-[clamp(1.6rem,3.6vw,3.4rem)] leading-none text-cream">
                      {t}
                      <Sparkle className="h-[0.55em] w-[0.55em] text-butter" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
