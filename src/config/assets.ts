/**
 * Registro central de assets visuais.
 *
 * status:
 *  - "final"        → pode ser exibido no tamanho previsto.
 *  - "v1"           → asset real, recortado a partir de foto; bom para a V1,
 *                     mas idealmente substituído por versão de estúdio/transparente.
 *  - "placeholder"  → referência apenas; resolução/recorte insuficientes.
 *
 * `maxDisplay` é a maior largura (px CSS) em que o asset pode aparecer
 * sem perder nitidez perceptível. Os componentes respeitam esse limite.
 *
 * Para trocar um asset: substitua o arquivo em /public/assets (ou /assets-src
 * + `node scripts/build-assets.mjs`) e atualize width/height/status aqui.
 */

export type AssetStatus = "final" | "v1" | "placeholder";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  status: AssetStatus;
  maxDisplay: number;
  note?: string;
};

export const assets = {
  /* ── Marca ── */
  logoNavbar: {
    src: "/assets/brand/logo-navbar.png",
    width: 1536,
    height: 1024,
    alt: "Armazém da Pizza",
    status: "final",
    maxDisplay: 1536,
    note: "Conteúdo ocupa ~5%–96% da altura do PNG (margem transparente).",
  },

  /* ── Hero (assets de alta qualidade, PNG com alfa) ── */
  heroSlice: {
    src: "/assets/food/hero-pizza-slice.png",
    width: 1536,
    height: 1024,
    alt: "Fatia de pizza de calabresa com queijo derretendo e escorrendo",
    status: "final",
    maxDisplay: 1536,
  },
  heroBox: {
    src: "/assets/packaging/pizza-box.png",
    width: 1330,
    height: 1182,
    alt: "Caixa amarela do Armazém da Pizza",
    status: "final",
    maxDisplay: 1330,
    note: "Usada em 'Como pedir' (protagonista) e no Final.",
  },

  /* ── Assets V1 (recortes de fotos de celular) ── */
  pizza: {
    src: "/assets/pizza-topdown.webp",
    width: 1080,
    height: 1080,
    alt: "Pizza de calabresa com cebola e orégano, vista de cima",
    status: "v1",
    maxDisplay: 820,
    note: "Recorte elíptico da foto original (1600×1184). Ideal: PNG transparente ≥ 2400px.",
  },
} satisfies Record<string, ImageAsset>;

export const showPlaceholderBadges = process.env.NODE_ENV !== "production";
