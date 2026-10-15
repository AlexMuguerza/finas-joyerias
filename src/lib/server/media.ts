// Solo servidor: parte del DAL de catálogo.
import "server-only";

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
 * ruta de.images habríaobligado a tocarlos todos, y el fallo silencioso sería
 * una imagen rota.
 *
 * `key` es la clave cruda de R2 (`images.key`), no una URL completa. Envuelve
 * los segmentos para que una clave con barras o espacios no rompa la ruta.
 */
export function imageUrl(key: string | null | undefined): string | null {
	if (!key) return null;
	return `/api/images/${key
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/")}`;
}