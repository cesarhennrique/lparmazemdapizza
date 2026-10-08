"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, mq, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { assets } from "@/config/assets";
import { primaryOrder, site } from "@/config/site";
import { goHome } from "@/lib/scrollToSection";
import { Sparkle } from "@/components/ui/Graphics";

/**
 * Zonas em que o fundo sob o logo é claro/fotográfico.
 * `from`: fração do pin a partir da qual a zona começa (seções pinadas).
 */
const LIGHT_ZONES: { id: string; from?: number }[] = [
  { id: "inicio", from: 0.35 }, // Hero: fatia ocupa o centro e o amarelo cresce
  { id: "manifesto" },
  { id: "a-pizza", from: 0.77 }, // Signature: onda creme no fim
  { id: "como-pedir" },
  { id: "onde-estamos" },
];
import { OrderButton, StickerButton } from "@/components/ui/StickerButton";

/**
 * NAVBAR — barra preta compacta + logo central que VAZA da barra.
 *
 *   ┌ ☰ ──────────────── LOGO ──────────────── PEDIR AGORA ┐  ← --header-height
 *   └──────────────⌒⌒⌒⌒  LOGO  ⌒⌒⌒⌒───────────────────────┘
 *                  extensão rasa (só em fundos claros)
 *
 * Contraste ADAPTATIVO: sobre vermelho/preto o logo amarelo vaza livre.
 * Quando o que passa sob o logo é claro ou fotográfico (Manifesto, Como
 * pedir, Unidade, fim do Hero/Signature), a barra "derrete" uma extensão
 * larga e rasa (sino suave, sem contorno) atrás da parte que ultrapassa.
 * As zonas são medidas no refresh do ScrollTrigger (pins incluídos).
 *
 * - Fixed, fora do <main>: pins do ScrollTrigger não afetam o header.
 * - Camada global única: z-index = --z-header (seções são isoladas).
 * - Logo + aba centralizados na VIEWPORT (camada absoluta inset-x-0).
 * - Sem hide-on-scroll. Depois do topo, logo + aba reduzem juntos (scale .86).
 *
 * MENU fullscreen (#site-menu): overlay preto sob a barra/logo (z: overlay 10 <
 * barra 20 < logo 30). Abre por clip-path (~0.85s), fecha invertendo (~0.45s).
 * Trava o scroll (Lenis.stop + overflow), deixa <main>/<footer> inertes,
 * prende o foco (botão + menu), ESC fecha e o foco volta ao botão.
 * Links (#id) navegam via SmoothScroll/scrollToSection (ciente dos pins).
 */
export function Header() {
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  /** Trava/destrava o scroll da página imediatamente (antes do re-render). */
  const lock = useCallback((on: boolean) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    if (on) window.__lenis?.stop();
    else window.__lenis?.start();
    for (const el of document.querySelectorAll("main, footer")) el.toggleAttribute("inert", on);
  }, []);

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      lock(false);
      setOpen(false);
      if (restoreFocus) menuBtn.current?.focus({ preventScroll: true });
    },
    [lock],
  );

  useEffect(() => {
    const tl = menuTl.current;
    if (open) {
      lock(true);
      // visível já agora, para o foco poder entrar no menu
      if (menu.current) menu.current.style.visibility = "visible";
      tl?.timeScale(1).play();
      menu.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    } else {
      tl?.timeScale(1.9).reverse();
    }
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      // Foco preso: botão do menu + itens do overlay.
      const items = [menuBtn.current, ...(menu.current?.querySelectorAll<HTMLElement>("a, button") ?? [])].filter(
        Boolean,
      ) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, lock, closeMenu]);

  /** HOME — logo e item "Início": fecha o menu (se aberto) e volta ao scroll 0. */
  const onHome = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (open) closeMenu(false);
      goHome();
    },
    [open, closeMenu],
  );

  // Garantia: nunca deixar a página travada se o Header desmontar.
  useEffect(() => () => lock(false), [lock]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Menu: timeline pausada (play = abre, reverse = fecha).
      mm.add({ motion: mq.motion, reduced: mq.reduced }, (ctx) => {
        const overlay = menu.current!;
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onStart: () => void gsap.set(overlay, { visibility: "visible" }),
          onReverseComplete: () => void gsap.set(overlay, { visibility: "hidden" }),
        });
        if (ctx.conditions?.reduced) {
          tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" });
        } else {
          tl.fromTo(overlay, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" })
            .from(q("[data-menu-num]"), { autoAlpha: 0, x: -10, duration: 0.25, stagger: 0.05 }, 0.22)
            .from(q("[data-menu-word]"), { yPercent: 110, duration: 0.45, stagger: 0.06 }, 0.27)
            .from(q("[data-menu-foot]"), { autoAlpha: 0, y: 14, duration: 0.3, stagger: 0.06 }, 0.52);
        }
        menuTl.current = tl;
        return () => {
          menuTl.current = null;
        };
      });

      mm.add(mq.motion, () => {
        // Entrada curta: barra → logo → menu/CTA.
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(q("[data-nav-bar]"), { yPercent: -100, duration: 0.55 }, 0)
          .from(q("[data-nav-logo]"), { y: -16, autoAlpha: 0, duration: 0.7 }, 0.2)
          .from(q("[data-nav-side]"), { autoAlpha: 0, duration: 0.45, stagger: 0.08 }, 0.4);

        // Redução sutil de presença ao sair do topo (a marca continua visível).
        // quickTo não aceita o atalho "scale" (warning do GSAP): eixos separados.
        const shrinkX = gsap.quickTo(q("[data-nav-logo]"), "scaleX", { duration: 0.5, ease: "power3.out" });
        const shrinkY = gsap.quickTo(q("[data-nav-logo]"), "scaleY", { duration: 0.5, ease: "power3.out" });
        ScrollTrigger.create({
          start: 120,
          end: "max",
          onToggle: (self) => {
            const s = self.isActive ? 0.86 : 1;
            shrinkX(s);
            shrinkY(s);
          },
        });
      });

      // Contraste adaptativo da extensão atrás do logo.
      const ext = q("[data-nav-ext]")[0] as HTMLElement;
      const logoLink = q("[data-nav-logo] a")[0] as HTMLElement;
      const bar = q("[data-nav-bar]")[0] as HTMLElement;
      const fade = gsap.quickTo(ext, "opacity", { duration: 0.35, ease: "power2.out" });
      gsap.set(ext, { opacity: 0 });
      let ranges: [number, number][] = [];
      let light: boolean | null = null;
      const measure = () => {
        // linha média da parte do logo que ultrapassa a barra (sem transforms)
        const mid = (bar.offsetHeight + logoLink.offsetHeight * 0.963) / 2;
        ranges = LIGHT_ZONES.flatMap(({ id, from = 0 }) => {
          const section = document.getElementById(id);
          if (!section) return [];
          const box = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
          const top = box.getBoundingClientRect().top + window.scrollY;
          // seção pinada: fração do pin; sem pin (reduced-motion): fração da seção
          const pinLen = Math.max(0, box.offsetHeight - section.offsetHeight) || section.offsetHeight;
          return [[top + pinLen * from - mid, top + box.offsetHeight - mid] as [number, number]];
        });
      };
      const update = (y: number) => {
        const next = ranges.some(([a, b]) => y >= a && y <= b);
        if (next !== light) fade((light = next) ? 1 : 0);
      };
      const onRefresh = () => {
        measure();
        update(window.scrollY);
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.create({ start: 0, end: "max", refreshPriority: -10, onUpdate: (self) => update(self.scroll()) });
      onRefresh();

      // Dock de pedido (mobile): do Manifesto até antes do Final.
      gsap.set(dock.current, { yPercent: 160 });
      const dockTo = gsap.quickTo(dock.current, "yPercent", { duration: 0.5, ease: "back.out(1.6)" });
      // Elementos (não seletores): o scope do useGSAP limitaria a busca ao header.
      ScrollTrigger.create({
        trigger: document.getElementById("manifesto"),
        start: "top 60%",
        endTrigger: document.getElementById("pedir"),
        end: "top 70%",
        refreshPriority: -10, // calcula depois dos pins das seções
        onToggle: (self) => dockTo(self.isActive ? 0 : 160),
      });

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-(--z-header)">
      {/* Barra */}
      <div data-nav-bar className="relative z-20 bg-ink pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-(--header-height) items-center justify-between gutter">
          <button
            ref={menuBtn}
            data-nav-side
            data-open={open}
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => (open ? closeMenu() : setOpen(true))}
            className="group -ml-2 grid h-11 w-11 place-items-center rounded-full text-cream transition-colors hover:text-butter"
          >
            {/* ☰ → ✕ */}
            <span aria-hidden className="flex w-6 flex-col items-start gap-1.25">
              <span className="h-[2.5px] w-6 rounded-full bg-current transition-transform duration-300 ease-back group-hover:translate-x-1 group-data-[open=true]:translate-x-0 group-data-[open=true]:translate-y-[7.5px] group-data-[open=true]:rotate-45" />
              <span className="h-[2.5px] w-6 rounded-full bg-current transition-[transform,opacity] duration-300 ease-back group-hover:-translate-x-0.5 group-data-[open=true]:opacity-0" />
              <span className="h-[2.5px] w-4 rounded-full bg-current transition-[transform,width] duration-300 ease-back group-hover:translate-x-2 group-data-[open=true]:w-6 group-data-[open=true]:translate-x-0 group-data-[open=true]:-translate-y-[7.5px] group-data-[open=true]:-rotate-45" />
            </span>
          </button>

          <div data-nav-side>
            <StickerButton
              href={primaryOrder.url}
              placeholder={primaryOrder.placeholder}
              hideBadge
              tone="butter"
              size="sm"
              ariaLabel="Pedir agora"
              className="border-2! border-butter! px-3.5! py-1.5! shadow-none! hover:shadow-none! sm:px-4! sm:py-2!"
            >
              <span className="sm:hidden">Pedir</span>
              <span className="hidden sm:inline">Pedir agora</span>
            </StickerButton>
          </div>
        </div>
      </div>

      {/* Logo (+ extensão adaptativa) — camada própria, centralizada na viewport */}
      <div className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] z-30 flex justify-center">
        <div data-nav-logo className="relative origin-top">
          {/* Extensão da barra: larga e rasa, laterais em curva suave (sino),
              sem contorno. Opacidade controlada pelo contraste adaptativo. */}
          <svg
            data-nav-ext
            aria-hidden
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="absolute left-1/2 top-[calc(var(--header-height)-1px)] h-[calc(var(--header-logo-overlap)+var(--header-tab-pad)+1px)] w-[calc(var(--header-logo-h)*2.7)] -translate-x-1/2 opacity-0"
          >
            <path d="M0 0H400C328 0 318 100 262 100H138C82 100 72 0 0 0Z" className="fill-ink" />
          </svg>
          <a
            href="#"
            onClick={onHome}
            aria-label="Voltar ao início"
            className="pointer-events-auto relative block h-(--header-logo-h) rounded-md"
          >
            <Image
              src={assets.logoNavbar.src}
              width={assets.logoNavbar.width}
              height={assets.logoNavbar.height}
              alt={assets.logoNavbar.alt}
              preload
              sizes="(min-width:1024px) 180px, (min-width:640px) 140px, 112px"
              className="h-full w-auto object-contain"
            />
          </a>
        </div>
      </div>

      {/* Menu fullscreen */}
      <div
        ref={menu}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="invisible fixed inset-0 z-10 flex h-dvh flex-col bg-ink gutter pt-[calc(var(--header-safe-area)+2dvh)] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-cream lg:pl-[4vw] lg:pb-[5dvh]"
      >
        <nav aria-label="Seções">
          <ol className="flex flex-col gap-[clamp(0.15rem,0.8dvh,0.6rem)]">
            {site.nav.map((item, i) => (
              <li key={item.id}>
                <a
                  href={item.id === "inicio" ? "#" : `#${item.id}`}
                  data-scroll-progress={item.progress}
                  onClick={item.id === "inicio" ? onHome : () => closeMenu(false)}
                  className="group flex items-start gap-[clamp(0.75rem,1.6vw,1.5rem)] rounded-md focus-visible:outline-offset-4"
                >
                  <span data-menu-num className="mt-[0.55em] w-[2.5ch] shrink-0 font-display text-[clamp(0.9rem,1.3vw,1.2rem)] tracking-[0.14em] text-tomato">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="-mt-[0.24em] block overflow-clip pt-[0.24em] transition-transform duration-300 ease-back group-hover:translate-x-3 group-focus-visible:translate-x-3">
                    <span
                      data-menu-word
                      className="font-display block text-[clamp(2.9rem,14.4vw,4.75rem)] leading-[0.95] transition-colors duration-200 group-hover:text-butter group-focus-visible:text-butter sm:text-[clamp(4rem,10.5vw,7rem)] lg:text-[min(8.4vw,14dvh)]"
                    >
                      {item.label}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 48 24"
                    className="hidden w-[clamp(2rem,3.4vw,3.5rem)] shrink-0 -translate-x-3 self-center text-butter opacity-0 transition-[opacity,transform] duration-300 ease-back group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12h42M34 3l10 9-10 9" />
                  </svg>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-auto flex flex-col gap-5 pt-6 lg:flex-row-reverse lg:items-end lg:justify-between">
          <div data-menu-foot>
            <StickerButton
              href={primaryOrder.url}
              placeholder={primaryOrder.placeholder}
              tone="butter"
              size="lg"
              className="w-full lg:w-auto"
            >
              Pedir agora →
            </StickerButton>
          </div>
          <p data-menu-foot className="flex items-center gap-2.5 font-display text-[clamp(1rem,1.5vw,1.4rem)] tracking-[0.16em] text-cream/55">
            <Sparkle className="h-[0.7em] w-[0.7em] text-tomato" />
            Uma fatia? Duvido.
          </p>
        </div>
      </div>

      {/* Dock de pedido — mobile (escondido com o menu aberto) */}
      <div
        ref={dock}
        className={`fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:hidden ${open ? "invisible" : ""}`}
      >
        <OrderButton link={primaryOrder} tone="butter" size="md" className="w-full" />
      </div>
    </header>
  );
}
