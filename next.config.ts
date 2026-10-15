import type { NextConfig } from "next";
import { SITE_ORIGIN } from "./src/lib/site";

const { hostname } = new URL(SITE_ORIGIN);

const nextConfig: NextConfig = {
	images: {
		// Las fotos del catálogo llegan por `/api/images/<key>` (R2 a través del
		// worker) y `imageUrl()` las devuelve **absolutas**: el optimizador de
		// Cloudflare solo resuelve rutas relativas contra el binding `ASSETS`
		// (ficheros estáticos), así que una route handler en relativo daba 404
		// en producción. Al ser absolutas pasan por `remotePatterns`, que se
		// evalúa en cada request del optimizador: sin esta entrada el worker
		// responde 400.
		//
		// El único patrón es el propio `/api/images`; no hay orígenes externos.
		remotePatterns: [
			{ protocol: "https", hostname, pathname: "/api/images/**" },
		],
		formats: ["image/avif", "image/webp"],
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
