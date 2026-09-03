/**
 * Slugify compartido entre el admin (creación de categorías/productos) y la
 * tienda (links a /shop?categoria=<slug>). Debe coincidir exactamente con lo
 * que guarda el admin para que los links de la landing filtren correctamente.
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
