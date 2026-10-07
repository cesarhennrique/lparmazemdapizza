"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, mq, SplitText, useGSAP } from "@/lib/gsap";
import { deferInit } from "@/lib/deferInit";
import { assets } from "@/config/assets";
import { HandArrow, Sparkle } from "@/components/ui/Graphics";

const steps = [
  {
    n: "01",
    title: "Escolhe",
    body: "Abre o cardápio no WhatsApp ou no iFood e escolhe sem culpa.",
    // desktop: texto à esquerda, caixa à direita
    pos: "lg:left-[4vw] lg:bottom-[7svh] lg:w-[44vw]",
  },
  {
    n: "02",
    title: "A gente assa",
    body: "Massa, molho, queijo e forno. Depois fecha tudo na caixa amarela.",
    // desktop: caixa vai para a esquerda, texto à direita
    pos: "lg:left-[55vw] lg:bottom-[9svh] lg:w-[40vw]",
  },
  {
    n: "03",
    title: "Você puxa o queijo",
    body: "Chega quente e rápido. O resto é com você.",
    // desktop: caixa volta à direita, mais perto da câmera
    pos: "lg:left-[4vw] lg:bottom-[7svh] lg:w-[40vw]",
  },
] as const;

/**
 * COMO PEDIR — a caixa do Armazém conduz a narrativa.
 *
 * Uma única composição (pin) que se reorganiza a cada passo:
 *   pré-pin   título sobe por máscara; caixa entra pela direita girando
 *   0.00→0.08 passo 01 surge (texto à esquerda, caixa à direita)
 *   0.26→0.42 título sai; 01 sai; caixa atravessa para a esquerda; 02 entra
 *   0.56→0.70 02 sai; caixa volta à direita, maior (perto da câmera); 03 entra
 *   0.80→0.94 03 sai; caixa vai ao centro e cresce (limite: resolução nativa)
 *   0.84→0.96 o amarelo cresce a partir da caixa
 *   0.92→1.00 a caixa se funde ao amarelo → Unidade (fundo amarelo)
 *
 * Mobile/tablet (<1024): mesma narrativa, empilhada (título / caixa / passo),
 * pin mais curto e deslocamentos menores. Reduced-motion: tudo visível, estático.
 * Camadas de transform: [data-box] scroll · [data-box-in] entrada.
 */
export function HowTo() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    // Abaixo da dobra: inicializa depois do 1º paint (ver lib/deferInit).
    (context) => deferInit(context, () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ motion: mq.motion, desktop: "(min-width: 1024px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        const el = root.current!;
        const box = q("[data-box]")[0] as HTMLElement;
        const [s1, s2, s3] = q("[data-step]");
        const vw = (n: number) => () => (window.innerWidth * n) / 100;
        const vh = (n: number) => () => (window.innerHeight * n) / 100;
        // Escala máxima sem passar muito da resolução nativa do PNG.
        const maxScale = () => Math.min(2.2, (assets.heroBox.width * 1.1) / box.offsetWidth);
        // Leva o centro da caixa ao centro da viewport (offset* = sem transforms).
        const toCenter = () => {
          let x = 0;
          let y = 0;
          for (let n: HTMLElement | null = box; n && n !== el; n = n.offsetParent as HTMLElement | null) {
            x += n.offsetLeft;
            y += n.offsetTop;
          }
          return { x: window.innerWidth / 2 - (x + box.offsetWidth / 2), y: window.innerHeight / 2 - (y + box.offsetHeight / 2) };
        };

        /* ── PRÉ-PIN: entrada ───────────────────────── */
        const split = SplitText.create(q("[data-title]"), { type: "words", mask: "words", wordsClass: "hw" });
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "top top", scrub: 0.8 } })
          .from(q("[data-eyebrow]"), { y: 20, autoAlpha: 0, duration: 0.3 }, 0)
          .from(split.words, { yPercent: 110, duration: 0.5, stagger: 0.04, ease: "power3.out" }, 0.05)
          .from(
            q("[data-box-in]"),
            { x: vw(desktop ? 32 : 40), y: vh(10), rotation: 16, duration: 1, ease: "power2.out" },
            0,
          );

        /* ── PIN: a composição muda a cada passo ───── */
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: desktop ? "+=200%" : "+=160%",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        const stepIn = (s: Element, at: number) =>
          tl
            .fromTo(s, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08, ease: "power3.out" }, at)
            .from(s.querySelector("[data-num]"), { yPercent: 35, duration: 0.1, ease: "power3.out" }, at);
        const stepOut = (s: Element, at: number) =>
          tl.to(s, { opacity: 0, y: -30, duration: 0.06, ease: "power2.in" }, at);

        // 01
        stepIn(s1, 0);

        // 01 → 02
        stepOut(s1, 0.26);
        if (desktop) tl.to(q("[data-head]"), { y: vh(-6), opacity: 0, duration: 0.08, ease: "power2.in" }, 0.26);
        tl.to(
          box,
          {
            x: desktop ? vw(-43) : vw(-5),
            y: desktop ? vh(-4) : 0,
            rotation: -5,
            scale: 1.07,
            duration: 0.16,
            ease: "power2.inOut",
          },
          0.26,
        );
        stepIn(s2, 0.34);

        // 02 → 03
        stepOut(s2, 0.56);
        tl.to(
          box,
          {
            x: desktop ? vw(4) : vw(4),
            y: desktop ? vh(5) : vh(1),
            rotation: 4,
            scale: desktop ? 1.4 : 1.14,
            duration: 0.14,
            ease: "power2.inOut",
          },
          0.56,
        );
        stepIn(s3, 0.62);

        // 03 → saída: caixa ao centro, cresce; amarelo assume
        stepOut(s3, 0.8);
        if (!desktop) tl.to(q("[data-head]"), { opacity: 0, duration: 0.06 }, 0.8);
        tl.to(
          box,
          { x: () => toCenter().x, y: () => toCenter().y, rotation: 0, scale: maxScale, duration: 0.14, ease: "power2.inOut" },
          0.8,
        )
          .fromTo(
            q("[data-fill]"),
            { clipPath: "circle(0% at 50% 50%)" },
            { clipPath: "circle(75% at 50% 50%)", duration: 0.12, ease: "power2.inOut" },
            0.84,
          )
          .to(box, { opacity: 0, duration: 0.08 }, 0.92);
      });

      return () => mm.revert();
    }),
    { scope: root },
  );

  return (
    <section ref={root} id="como-pedir" aria-labelledby="como-title" className="relative bg-cream text-ink">
      <div
        className="relative flex h-[100svh] min-h-[620px] flex-col overflow-clip gutter pt-(--header-safe-area) pb-[calc(env(safe-area-inset-bottom)+5.75rem)] sm:pb-[6svh] lg:block lg:pb-0
          motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:py-[clamp(5rem,12svh,8rem)] lg:motion-reduce:pb-[clamp(5rem,12svh,8rem)]"
      >
        {/* Abertura */}
        <div data-head className="relative z-10 lg:pt-[1svh]">
          <p data-eyebrow className="mb-2 font-hand text-[clamp(1.4rem,2vw,1.9rem)] leading-none font-bold text-tomato">
            como pedir
          </p>
          <h2
            id="como-title"
            data-title
            className="font-display max-w-[13ch] leading-[1.02] text-[clamp(2.5rem,10.5vw,4.5rem)] sm:max-w-[16ch] sm:text-[clamp(3rem,8vw,5.5rem)] lg:max-w-[14ch] lg:text-[min(7.4vw,11.5svh)]"
          >
            Pedir é mais fácil que dividir a última fatia.
          </h2>
        </div>

        {/* Caixa — fio condutor. Mobile/tablet: no fluxo; desktop: à direita, na frente do título */}
        <div
          className="relative z-20 flex min-h-0 flex-1 items-center justify-center py-[2svh]
            lg:absolute lg:left-[53vw] lg:top-[calc(var(--header-safe-area)+3svh)] lg:block lg:py-0
            motion-reduce:flex-none motion-reduce:py-10 lg:motion-reduce:static lg:motion-reduce:mx-auto lg:motion-reduce:w-fit"
        >
          <div data-box className="will-change-transform">
            <div data-box-in>
              <div className="rotate-6">
                <Image
                  src={assets.heroBox.src}
                  width={assets.heroBox.width}
                  height={assets.heroBox.height}
                  alt={assets.heroBox.alt}
                  sizes="(min-width:1024px) 40vw, (min-width:640px) 60vw, 82vw"
                  className="h-auto w-[min(84vw,36svh)] object-contain drop-shadow-[0_30px_32px_rgba(60,30,0,0.32)] sm:w-[min(72vw,42svh)] lg:w-[min(38vw,62svh)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Passos — mobile/tablet: empilhados no mesmo espaço; desktop: cada um em sua posição */}
        <ol
          className="relative z-30 grid lg:static
            motion-reduce:mt-2 motion-reduce:gap-10 sm:motion-reduce:grid-cols-3 lg:motion-reduce:relative"
        >
          {steps.map((s, i) => (
            <li
              key={s.n}
              data-step
              className={`col-start-1 row-start-1 lg:absolute ${s.pos}
                ${i > 0 ? "motion-safe:opacity-0" : ""}
                motion-reduce:col-start-auto motion-reduce:row-start-auto lg:motion-reduce:static lg:motion-reduce:w-auto`}
            >
              <div className="flex items-end gap-[clamp(0.75rem,1.6vw,1.75rem)]">
                <span className="block overflow-clip">
                  <span
                    data-num
                    className="font-display block text-[clamp(4.5rem,22vw,6.5rem)] leading-[0.8] text-tomato sm:text-[clamp(5rem,13vw,8rem)] lg:text-[min(14vw,23svh)]"
                  >
                    {s.n}
                  </span>
                </span>
                <h3 className="font-display pb-[0.06em] text-[clamp(1.9rem,8.5vw,2.6rem)] leading-[0.9] sm:text-[clamp(2.2rem,5vw,3.4rem)] lg:text-[min(3.6vw,6.5svh)]">
                  {s.title}
                </h3>
              </div>
              <p className="mt-[clamp(0.6rem,1.4svh,1.1rem)] max-w-[30ch] text-[clamp(1.05rem,1.3vw,1.35rem)] leading-snug font-semibold">
                {s.body}
              </p>

              {/* Detalhes gráficos (um por passo, discretos) */}
              {i === 0 && (
                <ul aria-label="Onde pedir" className="mt-4 flex gap-2">
                  {["WhatsApp", "iFood"].map((t) => (
                    <li key={t} className="rounded-full border-2 border-ink px-3 py-1 text-xs font-bold tracking-[0.12em] uppercase">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {i === 1 && (
                <HandArrow className="pointer-events-none absolute -top-[18%] -left-[14%] hidden w-[clamp(4rem,6vw,6rem)] -scale-x-100 -rotate-12 text-tomato lg:block motion-reduce:hidden" />
              )}
              {i === 2 && (
                <p className="mt-3 inline-flex -rotate-2 items-center gap-2 font-hand text-[clamp(1.35rem,1.9vw,1.8rem)] leading-none font-bold text-tomato">
                  <Sparkle className="h-[0.6em] w-[0.6em]" />
                  cuidado: o queijo puxa.
                </p>
              )}
            </li>
          ))}
        </ol>

        {/* Amarelo que nasce da caixa e entrega para a Unidade */}
        <div
          data-fill
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-butter [clip-path:circle(0%_at_50%_50%)] motion-reduce:hidden"
        />
      </div>
    </section>
  );
}
