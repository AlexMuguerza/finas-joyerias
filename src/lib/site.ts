/**
 * Origen público del sitio.
 *
 * Única fuente de la verdad de "dónde vive Finas". La usan `metadataBase`
 * (`app/layout.tsx`), el sitemap, `imageUrl()` y `images.remotePatterns` de
 * `next.config.ts`. El literal estaba repetido en esos sitios y cambiar el
 * dominio obligaba a cazarlo todos.
 */
export const SITE_ORIGIN = "https://finasjoyerias.zfd.app";
