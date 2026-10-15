import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		// Sin `remotePatterns`: todas las imágenes del catálogo llegan por
		// `/api/images/<key>` (R2 a través del worker), que es una ruta local y
		// por tanto no necesita permiso de host externo. Los patrones de
		// unsplash/pexels que había aquí.allowlistaban dos orígenes que ninguna
		// parte del proyecto usa.
		formats: ["image/avif", "image/webp"],
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
