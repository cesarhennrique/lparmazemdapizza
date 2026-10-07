/**
 * Configuração central do site.
 * Tudo que ainda é provisório está marcado com `placeholder: true`
 * e deve ser substituído antes de publicar.
 */

export type OrderLink = {
  id: "whatsapp" | "ifood" | "retirada";
  label: string;
  url: string;
  placeholder: boolean;
};

const address = "Rua José da Silva Lucena, 189";

/** Loja oficial no iFood — atende entrega e retirada no local. */
const IFOOD_URL =
  "https://www.ifood.com.br/delivery/recife-pe/armazem-da-pizza-imbiribeira/453eaa84-993d-488a-b11d-49c8c3ebaa42?utm_medium=share";

/** WhatsApp oficial (link fornecido pelo Armazém) com mensagem inicial pré-preenchida. */
const WHATSAPP_PHONE = "8195815125";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site do Armazém da Pizza e gostaria de fazer um pedido.";
const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}&type=phone_number&app_absent=0`;

export const site = {
  name: "Armazém da Pizza",
  tagline: "Pizza Entrega Rápida",
  instagram: {
    handle: "@armazemdapizza_",
    url: "https://www.instagram.com/armazemdapizza_/",
  },

  unit: {
    address,
    hours: "18h às 22h",
    days: "Domingo a domingo",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${address}, Armazém da Pizza`,
    )}`,
  },

  order: {
    whatsapp: {
      id: "whatsapp",
      label: "Pedir no WhatsApp",
      url: WHATSAPP_URL,
      placeholder: false,
    },
    ifood: {
      id: "ifood",
      label: "Pedir no iFood",
      url: IFOOD_URL,
      placeholder: false,
    },
    // Retirada é feita pelo próprio iFood (opção "retirar no local").
    retirada: {
      id: "retirada",
      label: "Retirar na loja",
      url: IFOOD_URL,
      placeholder: false,
    },
  } satisfies Record<string, OrderLink>,

  /**
   * Menu: destinos reais da landing.
   * `progress`: em seções pinadas, ponto do pin onde a composição já está montada.
   */
  nav: [
    { id: "inicio", label: "Início", progress: 0 },
    { id: "a-pizza", label: "A pizza", progress: 0.15 },
    { id: "como-pedir", label: "Como pedir", progress: 0.1 },
    { id: "onde-estamos", label: "Onde estamos", progress: 0 },
  ],
} as const;

/**
 * CTA principal (header, menu, botão flutuante, hero).
 * Enquanto o WhatsApp for provisório, usa o iFood para nunca apontar para "#".
 */
export const primaryOrder: OrderLink = site.order.whatsapp.placeholder ? site.order.ifood : site.order.whatsapp;
