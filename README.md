# Armazém da Pizza — Homepage

Next.js 16 · TypeScript · Tailwind v4 · GSAP (ScrollTrigger + SplitText) · Lenis

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Onde trocar o que é provisório

| O quê | Arquivo |
|---|---|
| Links de pedido (WhatsApp / iFood / retirada) | `src/config/site.ts` → `order` (`placeholder: true` mostra o selo "LINK PROVISÓRIO" fora de produção) |
| Endereço, horário, Instagram | `src/config/site.ts` |
| Imagens (status, tamanho máximo de exibição) | `src/config/assets.ts` |
| Logo (vetorizado do raster — provisório) | `src/assets/logo-paths.json` |
| Nome do sabor do Signature | `src/components/sections/Signature.tsx` → `flavor` |

### Pipeline de assets
Originais em `assets-src/`. `node scripts/build-assets.mjs` gera:
- `public/assets/pizza-topdown.webp`: recorte elíptico normalizado para 1080×1080;
- `src/assets/logo-paths.json`: trace vetorial do logo.

Quando chegar um PNG transparente definitivo, salve-o direto em `public/assets/`, remova a etapa correspondente do script e atualize `width/height/status/maxDisplay` em `assets.ts`.

## Estrutura da página
1. **Header**: barra fixa + logo central (extensão adaptativa de contraste) + menu fullscreen (`#site-menu`).
2. **Hero** `#inicio` (pin + scrub): "UMA FATIA? / DUVIDO." com a fatia entre as camadas da palavra.
3. **Manifesto** `#manifesto`: palavras acendem com o scroll + marquee.
4. **Signature** `#a-pizza` (pin + scrub): pizza em 8 fatias via `clip-path`, callouts com conectores.
5. **Como pedir** `#como-pedir` (pin + scrub): a caixa conduz os 3 passos.
6. **Unidade** `#onde-estamos`: ticket de retirada (entrada única).
7. **Final** `#pedir`: CTAs + caixa chegando pela borda inferior.

Navegação interna ciente dos pins: `src/lib/scrollToSection.ts` (`goHome`, `scrollToSection`).
SEO: defina `NEXT_PUBLIC_SITE_URL` (domínio de produção) para gerar canonical e og:url.

Comportamentos por breakpoint via `gsap.matchMedia` (`src/lib/gsap.ts`). `prefers-reduced-motion` desliga pins, scrubs e Lenis.

## QA visual
`node scripts/shot.mjs <pastaSaida> 390x844,1440x900 0,1vh,2vh` gera screenshots com o Edge instalado (`REDUCED=1` emula reduced motion).
