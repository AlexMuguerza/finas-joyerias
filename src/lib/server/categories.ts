// Capa de acceso a datos de categorías (lecturas).
// Solo servidor: depende del cliente de Neon a través de `getDb()`.
import "server-only";

import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { imageUrl } from "@/lib/server/media";

export type CategoryWithImage = Awaited<ReturnType<typeof queryCategories>>[number];

/**
 * Consulta canónica de categoría: imagen y número de piezas.
 *
 * Se conserva el `groupBy` explícito en lugar de confiar en que Postgres
 * permita seleccionar columnas funcionalmente dependientes del `GROUP BY`: la
 * forma corta funciona hoy, pero se rompe en cuanto alguien sube el motor o
 * toca el plan de consulta.
 */
function queryCategories() {
	return getDb()
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			description: categories.description,
			imageKey: images.key,
			productCount: count(products.id),
		})
		.from(categories)
		.leftJoin(images, eq(images.id, categories.imageId))
		.leftJoin(products, eq(products.categoryId, categories.id))
		.groupBy(
			categories.id,
			categories.name,
			categories.slug,
			categories.description,
			images.id,
			images.key
		)
		.orderBy(asc(categories.name));
}

/** Categorías con imagen y recuento, para la landing y `/categorias`. */
export async function listCategoriesWithImages() {
	return queryCategories();
}

/**
 * Chips de filtro del catálogo: nombre, slug y número de piezas.
 *
 * El recuento sale del mismo `leftJoin` que el listado, así que la barra de
 * filtros y la rejilla nunca pueden discrepar: si el total fuera de otra
 * consulta, un producto creado entre ambas mostraría un filtro que ya no
 * cuadra.
 */
export async function listCategoryChips() {
	const rows = await queryCategories();

	return rows.map((row) => ({
		slug: row.slug,
		name: row.name,
		count: row.productCount,
	}));
}

/** Filas de categoría ya aplanadas para las vistas de la tienda. */
export function toCategoryCards(rows: CategoryWithImage[]) {
	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		description: row.description,
		imageUrl: imageUrl(row.imageKey),
		productCount: row.productCount,
	}));
}

export type CategoryCard = ReturnType<typeof toCategoryCards>[number];