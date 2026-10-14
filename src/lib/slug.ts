/**
 * Slugify compartido entre el admin (creación de categorías/productos) y la
 * tienda (links a /shop?categoria=<slug>). Debe coincidir exactamente con lo
 * que guarda el admin para que los links de la landing filtren correctamente.
 *
 * Única fuente de verdad: no copies esta función en `app/admin/actions.ts`.
 */
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 120);
}

/**
 * `slugify` puede devolver "" si el texto no tiene ningún carácter
 * alfanumérico (p. ej. "日本語", "✦✦✦"). Como `products.slug` y
 * `categories.slug` son NOT NULL UNIQUE, un slug vacío haría que el primer
 * registro pasara y el segundo fallara con un error de duplicado engañoso,
 * además de generar una URL pública rota (`/productos/`).
 *
 * Todos los puntos que construyen un slug deben validar con `isValidSlug`.
 */
export const EMPTY_SLUG_ERROR =
	"El nombre debe incluir al menos una letra o un número";

export function isValidSlug(slug: string): boolean {
	return slug.length > 0;
}

/**
 * Slug a partir del input manual o, si está vacío, del nombre. Devuelve `null`
 * si no se puede construir uno válido, para que el llamante responda con un
 * error de validación en vez de persistir un slug roto.
 */
export function resolveSlug(name: string, slugInput: string): string | null {
	const slug = slugify(slugInput || name);
	return isValidSlug(slug) ? slug : null;
}
