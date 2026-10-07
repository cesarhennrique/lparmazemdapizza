import type { Metadata, Viewport } from "next";
import { Anton, Bricolage_Grotesque, Caveat } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  axes: ["wdth", "opsz"],
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Domínio de produção (sem barra no fim), ex.: NEXT_PUBLIC_SITE_URL=https://www.seudominio.com.br
 * Na Vercel, sem a variável, usa o domínio de produção do projeto.
 * Sem nenhum dos dois, canonical, og:url e imagens sociais são omitidos
 * (não inventamos domínio e nunca publicamos "localhost").
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

const title = "Armazém da Pizza | Delivery de Pizza em Recife";
const description =
  "Pizza quentinha com muito queijo, para delivery ou retirada na Imbiribeira, Recife. Rua José da Silva Lucena, 189 — domingo a domingo, das 18h às 22h.";

/** Imagem de compartilhamento (/public/og-image.jpg) — dimensões reais do arquivo. */
const ogImage = {
  url: "/og-image.jpg",
  width: 1734,
  height: 907,
  alt: "Armazém da Pizza — Uma fatia? Duvido.",
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } } : {}),
  title,
  description,
  applicationName: "Armazém da Pizza",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Armazém da Pizza",
    title,
    description,
    ...(siteUrl ? { url: "/" } : {}),
    ...(siteUrl ? { images: [ogImage] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    ...(siteUrl ? { images: [ogImage.url] } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#ee2e31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${anton.variable} ${bricolage.variable} ${caveat.variable} antialiased`}
    >
      <head>
        {/* Marca o documento antes do primeiro paint para esconder elementos de intro. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-ready')" }}
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
