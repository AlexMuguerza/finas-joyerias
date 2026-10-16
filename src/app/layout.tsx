import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_ORIGIN } from "@/lib/site";
import { Providers } from "@/components/providers";

/**
 * Las dos únicas familias del proyecto.
 *
 * Antes se enlazaban a mano en el `<head>`: 3 familias (Cormorant Garamond,
 * Great Vibes y Montserrat) y 13 ficheros, de los que solo se usaban cuatro
 * pesos. Great Vibes no la usaba ningún componente — era una descarga entera
 * por nada — y el `<link>` a `fonts.googleapis.com` era un request a un tercero
 * en el camino crítico, que es justo lo que `next/font` evita sirviendo los
 * ficheros desde el propio dominio (y de paso quita el aviso de
 * `@next/next/no-page-custom-font`).
 *
 * Los pesos son los que aparecen en el markup: `font-light`, `font-normal`,
 * `font-medium` y `font-semibold`. Cormorant además en itálica, que usan los
 * títulos de sección.
 *
 * `variable` publica el nombre en `:root`; `globals.css` lo consume en
 * `--font-heading` y `--font-body` del `@theme`.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finas | Joyería Exclusiva y Elegante",
  description:
    "Descubre nuestra colección de joyería fina y exclusiva. Cada joya cuenta una historia. Haz que la tuya brille. Collares, anillos, aretes y pulseras en Perú.",
  keywords: [
    "joyería",
    "finas",
    "elegante",
    "oro",
    "diamantes",
    "collares",
    "anillos",
    "pulseras",
    "aretes",
    "Perú",
    "joyería fina",
    "accesorios",
  ],
  authors: [{ name: "Finas Joyería" }],
  creator: "Finas Joyería",
  publisher: "Finas Joyería",
  metadataBase: new URL(SITE_ORIGIN),
  alternates: {
    canonical: SITE_ORIGIN,
  },
  icons: {
    icon: "/logo-sin-fondo.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_ORIGIN,
    siteName: "Finas Joyería",
    title: "Finas | Joyería Exclusiva y Elegante",
    description:
      "Descubre nuestra colección de joyería fina y exclusiva. Cada joya cuenta una historia. Haz que la tuya brille.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Finas Joyería - Colección Exclusiva",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finas | Joyería Exclusiva y Elegante",
    description:
      "Descubre nuestra colección de joyería fina y exclusiva. Cada joya cuenta una historia.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={cn("antialiased", cormorant.variable, montserrat.variable)}
    >
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
