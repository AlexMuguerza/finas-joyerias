// Alfabeto sin caracteres ambiguos (0/O, 1/I/L) para SKUs legibles.
const SKU_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * SKU con lógica: <3 letras de la categoría>-<4 caracteres aleatorios>.
 *
 * Ejemplos: categoría "Anillos" → ANI-K3F9, "Collares" → COL-7YT2,
 * categoría con menos de 3 letras (p. ej. "Oro") → ORO-xxxx (se rellena
 * con la letra siguiente; si no hay, con "X").
 *
 * La unicidad la garantiza el constraint `products_sku_unique` en la BD;
 * quien llama debe reintentar con un nuevo SKU ante colisión.
 */
export function generateSku(categoryName: string): string {
	const letters = categoryName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z]/g, "")
		.toUpperCase()
		.padEnd(3, "X")
		.slice(0, 3);

	const bytes = crypto.getRandomValues(new Uint8Array(4));
	const random = Array.from(
		bytes,
		(b) => SKU_CHARS[b % SKU_CHARS.length]
	).join("");

	return `${letters}-${random}`;
}

/**
 * Valida el formato de un SKU ingresado manualmente:
 * 3 alfanuméricos + "-" + 4 alfanuméricos (AAA-9999).
 */
export function isValidSku(sku: string): boolean {
	return /^[A-Z0-9]{3}-[A-Z0-9]{4}$/.test(sku);
}
