// Solo servidor: parte del DAL de catálogo.
import "server-only";

import { SITE_ORIGIN } from "@/lib/site";

/**
 * Ventana de "novedad". Antes se repetía en tres páginas y cada copia podía
 * divergir sin que nada lo delatara.
 */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * URL pública de una imagen de R2.
 *
 * R2 no tiene dominio público: las imágenes salen por `/api/images/<key>` a
 * través del worker, que además es la ruta que consume el optimizador de
 * `next/image`. Esta cadena se construía a mano en nueve sitios; cambiar la
 * ruta de imágenes habría obligado a tocarlos todos, y el fallo silencioso
 * sería una imagen rota.
 *
 * `key` es la clave cruda de R2 (`images.key`), no una URL completa. Envuelve
 * los segmentos para que una clave con barras o espacios no rompa la ruta.
 *
 * La URL es **absoluta**, y esa es la parte que no es obvia: en el worker
 * desplegado el optimizador (`/_next/image`) resuelve las rutas relativas
 * contra el binding `ASSETS`, que solo sirve ficheros estáticos de
 * `.open-next/assets`. `/api/images/[...key]` es una route handler, no un
 * fichero estático, así que `ASSETS` respondía 404 y ninguna foto se veía en
 * producción mientras `next dev` funcionaba (allí el optimizador le pide la
 * imagen al servidor de Next, que sí ejecuta el handler). Con una URL
 * absoluta OpenNext la pide por el `fetch()` global, y la bandera
 * `global_fetch_strictly_public` de `wrangler.jsonc` hace que ese fetch salga a
 * internet y vuelva a entrar por la puerta de delante del propio worker.
 */
export function imageUrl(key: string | null | undefined): string | null {
	if (!key) return null;
	const path = key
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	return `${SITE_ORIGIN}/api/images/${path}`;
}