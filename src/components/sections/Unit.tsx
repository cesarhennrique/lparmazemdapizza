"use client";

import { useRef, useSyncExternalStore } from "react";
import { gsap, mq, SplitText, useGSAP } from "@/lib/gsap";
import { site } from "@/config/site";
import { OrderButton, StickerButton } from "@/components/ui/StickerButton";
import { RoundSticker, Sparkle, WaveEdge } from "@/components/ui/Graphics";

/** Aberto 18h–22h todos os dias, horário de Recife. Só no cliente (SSR → null). */
const noop = () => () => {};
function openStatus() {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Recife" }).format(new Date()),
  );
  return hour >= 18 && hour < 22 ? "Aberto agora" : "Abre hoje às 18h";
}
function useOpenStatus() {
  return useSyncExternalStore(noop, openStatus, () => null);
}

/** Endereço em duas linhas: as duas últimas palavras ("Lucena, 189") ficam juntas embaixo. */
function addressLines(text: string) {
  const words = text.split(" ");
  if (words.length < 3) return [text];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}

/** Recortes laterais do ticket na linha picotada (--cut a partir do topo). */
const ticketMask = [
  "radial-gradient(circle at 0 var(--cut), transparent var(--notch), #000 calc(var(--notch) + 0.5px)) left / 51% 100% no-repeat",
  "radial-gradient(circle at 100% var(--cut), transparent var(--notch), #000 calc(var(--notch) + 0.5px)) right / 51% 100% no-repeat",
].join(", ");

/**
 * UNIDADE — pausa editorial: o endereço é a peça tipográfica.
 *
 *   esquerda (55%)  VEM BUSCAR. / OU A GENTE LEVA. + descrição
 *   direita  (45%)  ticket de retirada (−1.25°), selo circular sobre o canto
 *
 * Entrada curta (uma vez, ao chegar): headline por máscara → ticket sobe
 * girando 2°→0 → linhas do endereço → selo/carimbo. Depois, estável.
 * Reduced-motion: nada animado; tudo visível.
 */
export function Unit() {
  const root = useRef<HTMLElement>(null);
  const status = useOpenStatus();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const head = SplitText.create(q("[data-head-lines]"), { type: "words", mask: "words", wordsClass: "sw" });
        const addr = SplitText.create(q("[data-address]"), { type: "lines", mask: "lines", linesClass: "sl", aria: "none" });
        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
          })
          .from(head.words, { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0)
          .from(q("[data-lead]"), { y: 16, autoAlpha: 0, duration: 0.7 }, 0.3)
          .from(q("[data-ticket]"), { y: 48, x: 24, rotation: 2, autoAlpha: 0, duration: 1, ease: "power4.out" }, 0.2)
          .from(addr.lines, { yPercent: 105, duration: 0.8, stagger: 0.08 }, 0.5)
          .from(q("[data-ticket-meta]"), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.06 }, 0.75)
          .from(q("[data-stamp]"), { scale: 1.6, rotation: -16, autoAlpha: 0, duration: 0.45, ease: "back.out(2)" }, 0.95)
          .from(q("[data-seal]"), { scale: 0, rotation: -120, duration: 0.7, ease: "back.out(1.8)" }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="onde-estamos" aria-labelledby="unidade-title" className="relative overflow-x-clip bg-butter text-ink">
      <WaveEdge className="absolute inset-x-0 -top-px h-[clamp(1.5rem,3vw,3rem)] -translate-y-[calc(100%-2px)] text-butter" />

      <div
        className="mx-auto grid max-w-[92rem] gap-[clamp(2.25rem,5vw,3rem)] gutter pt-[clamp(4.5rem,11svh,7rem)] pb-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:pb-[clamp(5rem,13svh,9rem)]
          lg:grid-cols-[1.12fr_0.88fr] lg:items-end lg:gap-0"
      >
        {/* ── Headline ── */}
        <div className="relative z-10 lg:pb-[9svh]">
          <h2 id="unidade-title" data-head-lines className="font-display text-[clamp(2.75rem,12.6vw,5.25rem)] leading-[0.9] sm:text-[clamp(4rem,11vw,7rem)] lg:text-[min(7.2vw,13svh,6.6rem)]">
            <span className="block">Vem buscar.</span>
            <span className="block text-tomato">Ou a gente leva.</span>
          </h2>
          <p data-lead className="mt-[clamp(1rem,2.5svh,1.75rem)] max-w-[26ch] text-[clamp(1.1rem,1.4vw,1.4rem)] leading-snug font-semibold">
            Retira por aqui ou pede pra entregar. Quentinha dos dois jeitos.
          </p>
        </div>

        {/* ── Ticket de retirada ── */}
        <div className="relative lg:-ml-[3vw] lg:-rotate-[1.25deg]">
          {/* Selo: ponte entre as colunas, sobre o canto do ticket */}
          <div
            data-seal
            className="absolute -top-[clamp(2.2rem,5vw,3.25rem)] right-3 z-20 max-sm:hidden w-[clamp(5rem,9vw,7.5rem)] sm:-top-[5.5rem] sm:right-[6%] lg:right-auto lg:-left-[clamp(3rem,5vw,4.5rem)] lg:-top-[clamp(3rem,5.5vw,4.75rem)]"
          >
            <RoundSticker
              text="Retirada • Delivery • Retirada • "
              className="rounded-full bg-tomato text-cream shadow-[0.2rem_0.25rem_0_var(--color-ink)]"
              center={<Sparkle className="w-[28%] text-butter" />}
            />
          </div>

          <div data-ticket className="relative [--cut:3.6rem] [--notch:0.85rem] sm:[--cut:4rem] sm:[--notch:1rem]">
            {/* Sombra sólida com o mesmo recorte */}
            <div
              aria-hidden
              className="absolute inset-0 translate-x-[0.45rem] translate-y-[0.5rem] bg-ink"
              style={{ mask: ticketMask, WebkitMask: ticketMask }}
            />
            <address
              className="@container relative block bg-cream not-italic"
              style={{ mask: ticketMask, WebkitMask: ticketMask }}
            >
              {/* Canhoto */}
              <div className="flex h-(--cut) items-center justify-between gap-3 px-[clamp(1.1rem,3vw,2.25rem)] lg:pl-[clamp(3rem,4.5vw,4.25rem)]">
                <span data-ticket-meta className="font-display whitespace-nowrap text-[0.8rem] tracking-[0.22em] text-ink/70 sm:text-[0.9rem]">
                  <span className="sm:hidden">Ticket nº 189</span>
                  <span className="hidden sm:inline">Ticket de retirada</span>
                  <span className="hidden xl:inline"> · nº 189</span>
                </span>
                <span
                  data-stamp
                  className="inline-flex shrink-0 -rotate-3 items-center gap-1.5 rounded-[3px] border-2 border-tomato px-2 py-0.5 font-display text-[0.8rem] tracking-[0.12em] text-tomato sm:text-[0.9rem]"
                >
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status === "Aberto agora" ? "bg-[#1fae5b]" : "bg-tomato"}`} />
                  {status ?? site.unit.days}
                </span>
              </div>
              <div aria-hidden className="mx-[var(--notch)] border-t-2 border-dashed border-ink/35" />

              {/* Corpo */}
              <div className="px-[clamp(1.1rem,3vw,2.25rem)] pt-[clamp(1.1rem,2.6svh,1.75rem)] pb-[clamp(1.25rem,3svh,2.25rem)]">
                <p data-ticket-meta className="flex items-center gap-2 font-display text-[clamp(0.95rem,1.2vw,1.1rem)] tracking-[0.18em] text-tomato">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
                    <circle cx="12" cy="10" r="2.3" />
                  </svg>
                  Retirada
                </p>
                <p data-address className="font-display mt-2 text-[10.6cqi] leading-[0.92]">
                  {addressLines(site.unit.address).map((l) => (
                    <span key={l} className="block whitespace-nowrap">
                      {l}
                    </span>
                  ))}
                </p>

                <dl data-ticket-meta className="mt-[clamp(1rem,2.4svh,1.5rem)] flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t-2 border-ink pt-3 font-display text-[clamp(1.2rem,5.5cqi,1.75rem)] leading-none">
                  <div>
                    <dt className="sr-only">Dias</dt>
                    <dd>{site.unit.days}</dd>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Sparkle className="h-[0.5em] w-[0.5em] self-center text-tomato" />
                    <dt className="sr-only">Horário</dt>
                    <dd>{site.unit.hours}</dd>
                  </div>
                </dl>

                <div data-ticket-meta className="mt-[clamp(1.25rem,3svh,1.75rem)] flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <StickerButton href={site.unit.mapsUrl} external tone="ink" size="md" className="w-full sm:w-auto">
                    Como chegar →
                  </StickerButton>
                  <OrderButton link={site.order.retirada} tone="butter" size="md" className="w-full sm:w-auto" />
                </div>
              </div>
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}
