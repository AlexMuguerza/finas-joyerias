import type { Metadata } from "next";
import "./globals.css";

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
  metadataBase: new URL("https://finasjoyeria.com"),
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://finasjoyeria.com",
    siteName: "Finas Joyería",
    title: "Finas | Joyería Exclusiva y Elegante",
    description:
      "Descubre nuestra colección de joyería fina y exclusiva. Cada joya cuenta una historia. Haz que la tuya brille.",
    images: [
      {
        url: "/og-image.jpg",
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
    images: ["/og-image.jpg"],
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
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
