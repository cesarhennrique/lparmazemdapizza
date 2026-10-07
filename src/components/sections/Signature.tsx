"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, mq, useGSAP } from "@/lib/gsap";
import { deferInit } from "@/lib/deferInit";
import { assets } from "@/config/assets";
import { Sparkle, WaveEdge } from "@/components/ui/Graphics";

// TODO(copy): confirmar o nome do sabor da foto com o Armazém.
const flavor = "Calabresa";

/**
 * Callouts editoriais (desktop): um por quadrante, fora da pizza e fora da
 * faixa da palavra gigante. Coordenadas em % do palco (pizza = 0..100).
 * `path`: conector desenhado à mão do texto até um ponto da pizza.
 */
const callouts = [
  {
    title: "Calabresa",
    body: "fatiada fina, em todo canto. sem economia.",
    side: "left",
    pos: "lg:left-[-64%] lg:top-[-1%]",
    path: "M-11 7 C 2 2, 12 8, 21 21",
    dot: [21, 21],
  },
  {
    title: "Cebola",
    body: "pode tirar. a gente não julga (julga um pouco).",
    side: "right",
    pos: "lg:left-[114%] lg:top-[3%]",
    path: "M111 11 C 98 6, 88 12, 79 25",
    dot: [79, 25],
  },
  {
    title: "Orégano",
    body: "o cheiro que chega antes do motoboy.",
    side: "left",
    pos: "lg:left-[-64%] lg:top-[87%]",
    path: "M-11 92 C 3 97, 15 90, 24 76",
    dot: [24, 76],
  },
  {
    title: "Queijo",
    body: "do tipo que puxa até onde der.",
    side: "right",
    pos: "lg:left-[114%] lg:top-[89%]",
    path: "M111 94 C 97 99, 85 91, 76 77",
    dot: [76, 77],
  },
] as const;

const WEDGES = 8;
const HERO_WEDGE = 1; // fatia que "sai" da pizza: no meio da rotação aponta → (faixa da palavra, longe dos callouts)

/** clip-path de uma cunha de 360/N graus a partir do centro (raio > círculo). */
function wedgeClip(i: number) {
  const step = 360 / WEDGES;
  const a0 = -90 - step / 2 + i * step;
  const pts = [0, 0.5, 1].map((t) => {
    const a = ((a0 + t * step) * Math.PI) / 180;
    return `${(50 + 75 * Math.cos(a)).toFixed(2)}% ${(50 + 75 * Math.sin(a)).toFixed(2)}%`;
  });
  return `polygon(50% 50%, ${pts.join(", ")})`;
}
function wedgeDir(i: number) {
  const a = ((-90 + i * (360 / WEDGES)) * Math.PI) / 180;
  return { x: Math.cos(a), y: Math.sin(a) };
}

/**
 * SIGNATURE MOMENT (pin + scrub)
 *
 *   0.00 → 0.14  pizza sobe girando; palavra entra pela direita
 *   0.00 → 0.90  rotação contínua da pizza (+200°)
 *   0.16 → 0.30  a pizza se abre em 8 fatias (clip-path, mesma imagem)
 *   0.28 → 0.60  callouts dos ingredientes, um por vez (texto + conector desenhado)
 *   0.40 → 0.62  uma fatia é puxada para fora
 *   0.62 → 0.76  fatias voltam, callouts saem
 *   0.72 → 0.88  pizza cresce (limitada ao maxDisplay do asset)
 *   0.84 → 1.00  fundo ink → cream; pizza sobe e entrega a próxima seção
 *
 * A palavra existe em duas camadas (sólida atrás / vazada na frente)
 * com o mesmo movimento — parece atravessar o plano da pizza.
 */
export function Signature() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    // Abaixo da dobra: inicializa depois do 1º paint (ver lib/deferInit).
    (context) => deferInit(context, () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: "(min-width: 1024px)", motion: mq.motion }, (ctx) => {
        const { desktop, motion } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        const stage = q("[data-stage]")[0] as HTMLElement;
        const size = () => stage.offsetWidth;
        const wedges = q("[data-wedge]");
        const words = q("[data-word]");
        const items = q("[data-callout]");
        const spread = desktop ? 0.055 : 0.04;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: desktop ? "+=320%" : "+=230%",
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        // entrada
        tl.fromTo(q("[data-lift]"), { yPercent: 75, scale: 0.55 }, { yPercent: 0, scale: 1, duration: 0.14, ease: "power3.out" }, 0)
          .fromTo(q("[data-spin]"), { rotation: -120 }, { rotation: 200, duration: 0.9 }, 0)
          .fromTo(words, { xPercent: 28 }, { xPercent: -28, duration: 1 }, 0)
          .from(q("[data-shadow]"), { autoAlpha: 0, scale: 0.4, duration: 0.14 }, 0)
          .from(q("[data-kicker]"), { autoAlpha: 0, y: 30, duration: 0.08 }, 0.06);

        // abre em fatias
        wedges.forEach((w, i) => {
          const d = wedgeDir(i);
          tl.to(w, { x: () => d.x * size() * spread, y: () => d.y * size() * spread, duration: 0.14, ease: "power2.out" }, 0.16);
        });

        // callouts (+ conector desenhado no desktop)
        const links = q("[data-link]");
        items.forEach((el, i) => {
          const at = 0.28 + i * (desktop ? 0.075 : 0.08);
          tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" }, at);
          if (desktop && links[i]) {
            tl.fromTo(
              links[i].querySelectorAll("[data-draw]"),
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 0.07, ease: "power2.inOut" },
              at + 0.02,
            ).fromTo(
              links[i].querySelectorAll("[data-dot]"),
              { scale: 0, transformOrigin: "50% 50%" },
              { scale: 1, duration: 0.03 },
              at + 0.08,
            );
          }
          if (!desktop && i < items.length - 1) {
            tl.to(el, { autoAlpha: 0, y: -16, duration: 0.05 }, 0.28 + (i + 1) * 0.08 - 0.01);
          }
        });

        // a fatia que sai — janela curta (0.38 → 0.56) para, mesmo girando com a
        // pizza, ficar na faixa da direita e nunca cruzar um callout
        const hd = wedgeDir(HERO_WEDGE);
        tl.to(
          wedges[HERO_WEDGE],
          {
            x: () => hd.x * size() * 0.16,
            y: () => hd.y * size() * 0.16,
            scale: 1.05,
            duration: 0.1,
            ease: "power2.inOut",
          },
          0.38,
        ).to(
          wedges[HERO_WEDGE],
          { x: () => hd.x * size() * spread, y: () => hd.y * size() * spread, scale: 1, duration: 0.07, ease: "power2.inOut" },
          0.53,
        );

        // fecha
        tl.to(wedges, { x: 0, y: 0, scale: 1, duration: 0.12, ease: "power2.inOut" }, 0.63)
          .to([...items, ...links], { autoAlpha: 0, duration: 0.05 }, 0.63)
          .to(q("[data-grow]"), { scale: desktop ? 1.18 : 1.12, duration: 0.16 }, 0.72);

        // entrega para a próxima seção
        tl.fromTo(q("[data-wipe]"), { yPercent: 100 }, { yPercent: 0, duration: 0.16, ease: "power2.inOut" }, 0.84)
          .to(q("[data-word-back]"), { color: "var(--color-tomato)", duration: 0.14 }, 0.84)
          .to(q("[data-word-front]"), { "--stroke": "#141110", duration: 0.14 }, 0.84)
          .to(q("[data-kicker]"), { autoAlpha: 0, duration: 0.05 }, 0.66)
          .to(q("[data-lift]"), { yPercent: -110, duration: 0.16, ease: "power2.in" }, 0.82)
          .to(q("[data-shadow]"), { autoAlpha: 0, duration: 0.08 }, 0.84);
      });

      return () => mm.revert();
    }),
    { scope: root },
  );

  const word = (layer: "back" | "front") => (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center ${layer === "back" ? "z-0" : "z-20"}`}
    >
      <span
        data-word
        {...{ [`data-word-${layer}`]: "" }}
        className={`font-display block whitespace-nowrap text-[clamp(7rem,26vw,26rem)] leading-none lg:text-[clamp(7rem,24vw,24rem)] ${
          layer === "back" ? "text-tomato" : "text-outline [--stroke:var(--color-cream)]"
        }`}
      >
        {flavor}
      </span>
    </div>
  );

  return (
    <section
      ref={root}
      id="a-pizza"
      aria-labelledby="sabor-title"
      className="relative h-[100svh] min-h-[560px] overflow-clip bg-ink text-cream"
    >
      <h2 id="sabor-title" className="sr-only">
        {flavor}: calabresa, cebola, orégano e muito queijo
      </h2>

      {/* Kicker: faixa preta limpa acima da pizza (sai antes de a pizza crescer) */}
      <p
        data-kicker
        className="absolute inset-x-0 top-(--header-safe-area) z-30 flex items-center justify-center gap-3 font-display text-[clamp(0.95rem,1.25vw,1.3rem)] tracking-[0.16em] text-butter"
      >
        <span aria-hidden className="h-px w-[clamp(1.5rem,4vw,4rem)] bg-butter/50" />
        A protagonista da casa
        <span aria-hidden className="h-px w-[clamp(1.5rem,4vw,4rem)] bg-butter/50" />
      </p>

      {/* Onda creme que sobe e entrega para "Como pedir" */}
      <div data-wipe aria-hidden className="pointer-events-none absolute inset-0 z-0 translate-y-full">
        <WaveEdge className="absolute inset-x-0 top-0 h-[clamp(1.5rem,3vw,3rem)] -translate-y-[calc(100%-2px)] text-cream" />
        <div className="h-full bg-cream" />
      </div>

      {word("back")}

      {/* Palco da pizza: tamanho limitado pelo maxDisplay do asset */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          data-stage
          className="relative aspect-square w-[min(86vw,52svh)] -translate-y-[4svh] sm:w-[min(80vw,54svh)] lg:translate-y-0 lg:w-[min(40vw,60svh)]"
          style={{ maxWidth: assets.pizza.maxDisplay }}
        >
          <div data-shadow className="absolute inset-[6%] translate-y-[7%] rounded-full bg-black/70 blur-2xl" />
          <div data-lift className="absolute inset-0 z-10">
            <div data-grow className="absolute inset-0">
              <div data-spin className="absolute inset-0">
                {Array.from({ length: WEDGES }, (_, i) => (
                  <div
                    key={i}
                    data-wedge
                    className="absolute inset-0 will-change-transform"
                    style={{ clipPath: wedgeClip(i), WebkitClipPath: wedgeClip(i) }}
                  >
                    <Image
                      src={assets.pizza.src}
                      width={assets.pizza.width}
                      height={assets.pizza.height}
                      alt={i === 0 ? assets.pizza.alt : ""}
                      aria-hidden={i !== 0}
                      sizes="(min-width:1024px) 42vw, 88vw"
                      className="h-full w-full"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conectores (desktop): SVG quadrado em coordenadas do palco (0..100),
              estendido 70% para cada lado para alcançar os textos. */}
          <svg
            aria-hidden
            viewBox="-70 -70 240 240"
            className="pointer-events-none absolute -inset-[70%] z-30 hidden overflow-visible lg:block"
          >
            {callouts.map((c) => (
              <g key={c.title} data-link>
                <path d={c.path} pathLength={1} data-draw fill="none" stroke="var(--color-ink)" strokeWidth="1" strokeLinecap="round" />
                <path d={c.path} pathLength={1} data-draw fill="none" stroke="var(--color-butter)" strokeWidth="0.34" strokeLinecap="round" />
                <circle data-dot cx={c.dot[0]} cy={c.dot[1]} r="1.25" fill="var(--color-butter)" stroke="var(--color-ink)" strokeWidth="0.5" />
              </g>
            ))}
          </svg>

          {/* Callouts — desktop nos quadrantes; mobile/tablet como legenda única */}
          <ul className="pointer-events-none absolute inset-x-0 top-[calc(100%+0.25rem)] z-30 lg:inset-0 max-lg:motion-reduce:flex max-lg:motion-reduce:flex-wrap max-lg:motion-reduce:justify-center max-lg:motion-reduce:gap-x-4 max-lg:motion-reduce:gap-y-1">
            {callouts.map((c) => (
              <li
                key={c.title}
                data-callout
                className={`absolute inset-x-0 mx-auto w-fit max-w-[19rem] text-center max-lg:motion-reduce:relative max-lg:motion-reduce:mx-0 max-lg:motion-reduce:[&_[data-body]]:hidden lg:inset-x-auto lg:mx-0 lg:w-[50%] lg:max-w-[17rem] ${c.pos} ${
                  c.side === "left" ? "lg:text-right" : "lg:text-left"
                }`}
              >
                {/* conector curto (mobile/tablet): do texto até a borda da pizza */}
                <svg aria-hidden viewBox="0 0 12 40" className="mx-auto mb-1 h-[clamp(1.25rem,4svh,2.25rem)] w-3 lg:hidden motion-reduce:hidden">
                  <path d="M6 40 C 2 28, 10 16, 6 5" fill="none" stroke="var(--color-butter)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="6" cy="4" r="3" fill="var(--color-butter)" />
                </svg>
                <span
                  className={`flex items-center gap-2 font-display text-[clamp(1.7rem,2.2vw,2.4rem)] leading-none text-butter max-lg:justify-center ${
                    c.side === "left" ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <Sparkle className="h-[0.42em] w-[0.42em] shrink-0 text-tomato" />
                  {c.title}
                </span>
                <span data-body className="mt-1.5 block text-[clamp(1rem,1.15vw,1.2rem)] leading-snug font-semibold text-cream">
                  {c.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {word("front")}
    </section>
  );
}
