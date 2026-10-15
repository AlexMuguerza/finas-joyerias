// Capa de acceso a datos de producto (lecturas).
// Solo servidor: depende del cliente de Neon a través de `getDb()`.
import "server-only";

import { cache } from "react";
import {
	and,
	asc,
	desc,
	eq,
	gte,
	ilike,
	ne,
	not,
	notInArray,
	sql,
} from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { imageUrl } from "@/lib/server/media";
import type { ShopProduct } from "@/components/shop/product-card";

/**
 * Proyección canónica de producto.
 *
 * Estaba replicada en cinco rutas (landing, catálogo, detalle, panel de
 * productos y dashboard). Cada copia listsaba sus propias columnas, así que
 * añadir un campo obligaba a recordar los cinco sitios y el olvido no daba
 * error de tipos: solo un `undefined` en tiempo de render.
 */
export const PRODUCT_SELECT = {
	id: products.id,
	name: products.name,
	slug: products.slug,
	// La consume el detalle de producto y el JSON-LD. El catálogo no la
	// muestra, pero es una columna de la misma fila: projectionarla aquí sale
	// más barato que mantener una segunda proyección para el detalle.
	description: products.description,
	price: products.price,
	sku: products.sku,
	categoryId: products.categoryId,
	categoryName: categories.name,
	// La usa el detalle de producto para el enlace "ver toda la categoría".
	// Viene gratis: `categories` ya está en el `leftJoin`.
	categorySlug: categories.slug,
	imageKey: images.key,
	imageAlt: images.altText,
	createdAt: products.createdAt,
} as const;

/**
 * Consulta base de producto con sus dos uniones.
 *
 * `images` va en `leftJoin` porque una ficha puede no tener foto, y
 * `categories` también: aunque `categoryId` es `NOT NULL` con borrado en
 * cascada, un `leftJoin` evita que un borrado concurrente convierta la página
 * entera en un error.
 */
function productQuery() {
	return getDb()
		.select(PRODUCT_SELECT)
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.leftJoin(images, eq(images.id, products.imageId));
}

/**
 * Fila devuelta por `productQuery()`.
 *
 * Se infiere de la propia consulta. La versión anterior (`HomeProductRow`, en
 * `app/page.tsx`) era un tipo escrito a mano que podía quedarse desfasado
 * respecto a la proyección real sin que el compilador se enterara.
 */
export type ProductRow = Awaited<ReturnType<typeof productQuery>>[number];

/**
 * Proyecta una fila al tipo que consume la UI del catálogo.
 *
 * `since` llega como parámetro a propósito: la marca de "Nuevo" se calcula con
 * un único `Date.now()` por render (el motivo está documentado en las páginas).
 * Si la ventana se calculara aquí, cada producto recibiría un instante
 * distinto y en el borde de los 7 días uno podría entrar en el filtro y salir
 * sin la etiqueta dentro de la misma respuesta.
 */
export function toShopProduct(row: ProductRow, since: Date): ShopProduct {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		price: String(row.price),
		sku: row.sku,
		categoryName: row.categoryName,
		imageUrl: imageUrl(row.imageKey),
		imageAlt: row.imageAlt,
		isNew: row.createdAt.getTime() >= since.getTime(),
	};
}

/**
 * Producto por slug, deduplicado por petición.
 *
 * Antes, `generateMetadata()` y el cuerpo de la página en
 * `productos/[slug]/page.tsx` ejecutaban cada uno su propia consulta sobre el
 * mismo producto, y al proyectar columnas distintas React no las
 * deduplicaba: dos viajes a la base de datos para pintar un `<title>`. Con
 * `cache()` ambos comparten una única consulta durante la misma petición.
 *
 * Se proyecta la fila completa porque `generateMetadata` necesita `name`,
 * `description` e `imageKey`; devolverlas todas sale más barato que la
 * segunda ida al servidor.
 */
export const getProductBySlug = cache(
	async (slug: string): Promise<ProductRow | null> => {
		const rows = await productQuery()
			.where(eq(products.slug, slug))
			.limit(1);

		return rows[0] ?? null;
	}
);

/** Categorías que el catálogo necesita para resolver el filtro `categoria`. */
export async function resolveCategoryId(
	slug: string | undefined
): Promise<string | null> {
	if (!slug) return null;

	const rows = await getDb()
		.select({ id: categories.id })
		.from(categories)
		.where(eq(categories.slug, slug))
		.limit(1);

	return rows[0]?.id ?? null;
}

/**
 * Listado del catálogo con los filtros de la tienda.
 *
 * Las condiciones y el orden se construyen aquí porque son parte de la
 * consulta, no de la presentación: la página solo decide cómo mostrar un
 * resultado vacío (y si fue un vacío real o un fallo de base de datos).
 */
export async function listCatalog({
	categoria,
	q,
	featured,
	orden,
	since,
}: {
	categoria?: string;
	q?: string;
	featured?: string;
	orden?: string;
	since: Date;
}): Promise<ShopProduct[]> {
	const conditions = [];
	const categoryId = await resolveCategoryId(categoria);

	if (categoria) {
		conditions.push(
			// Slug sin categoría detrás: condición imposible en vez de una
			// consulta vacía, que devolvería el catálogo entero.
			categoryId ? eq(products.categoryId, categoryId) : eq(products.id, "")
		);
	}

	if (q && q.trim()) {
		conditions.push(ilike(products.name, `%${q.trim()}%`));
	}

	// "featured": piezas creadas en la última semana (decisión de producto:
	// todavía no hay columna de destaque).
	if (featured === "1") {
		conditions.push(gte(products.createdAt, since));
	}

	const orderBy =
		orden === "precio-asc"
			? [asc(products.price)]
			: orden === "precio-desc"
				? [desc(products.price)]
				: orden === "nombre"
					? [asc(products.name)]
					: [desc(products.createdAt)];

	const rows = await productQuery()
		.where(and(...conditions))
		.orderBy(...orderBy);

	return rows.map((row) => toShopProduct(row, since));
}

/**
 * Productos de la landing: los más nuevos dentro de la ventana de novedad; si
 * no alcanzan, se rellena con piezas al azar procurando una por categoría
 * para que la rejilla tenga variedad.
 *
 * No captura errores: la landing decide degradar a lista vacía. Esa decisión
 * es de presentación, y el DAL debe seguir lanzando para que cada ruta pueda
 * elegir su propia política.
 */
export async function listHomeProducts(since: Date): Promise<ShopProduct[]> {
	const limit = 6;

	const recent = await productQuery()
		.where(gte(products.createdAt, since))
		.orderBy(desc(products.createdAt))
		.limit(limit);

	const chosen = [...recent];
	const chosenIds = new Set(chosen.map((p) => p.id));

	const excludeChosen = () =>
		chosenIds.size > 0
			? and(notInArray(products.id, [...chosenIds]))
			: undefined;

	// Relleno por diversidad: un producto aleatorio por cada categoría que
	// todavía no esté representada (`DISTINCT ON` + `random()`).
	if (chosen.length < limit) {
		const perCategory = await getDb()
			.selectDistinctOn([products.categoryId], PRODUCT_SELECT)
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.leftJoin(images, eq(images.id, products.imageId))
			.where(excludeChosen())
			.orderBy(products.categoryId, sql`random()`)
			.limit(limit - chosen.length);

		for (const row of perCategory) {
			if (chosenIds.has(row.id)) continue;
			chosen.push(row);
			chosenIds.add(row.id);
			if (chosen.length >= limit) break;
		}
	}

	// Último relleno: cualquier producto al azar si aún faltan piezas.
	if (chosen.length < limit) {
		const extra = await productQuery()
			.where(excludeChosen())
			.orderBy(sql`random()`)
			.limit(limit - chosen.length);

		chosen.push(...extra);
	}

	return chosen.slice(0, limit).map((row) => toShopProduct(row, since));
}

/**
 * Relacionados: primero los de la misma categoría; si faltan para llenar la
 * fila, se completan con los más recientes de otras categorías.
 */
export async function listRelatedProducts({
	categoryId,
	excludeId,
	since,
	limit,
}: {
	categoryId: string;
	excludeId: string;
	since: Date;
	limit: number;
}): Promise<ShopProduct[]> {
	const sameCategory = await productQuery()
		.where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
		.orderBy(desc(products.createdAt))
		.limit(limit);

	if (sameCategory.length >= limit) {
		return sameCategory.map((row) => toShopProduct(row, since));
	}

	const seen = new Set(sameCategory.map((row) => row.id));
	seen.add(excludeId);

	const others = await productQuery()
		.where(
			and(
				not(eq(products.categoryId, categoryId)),
				notInArray(products.id, [...seen])
			)
		)
		.orderBy(desc(products.createdAt))
		.limit(limit - sameCategory.length);

	return [...sameCategory, ...others].map((row) => toShopProduct(row, since));
}

/** Los más recientes, para el dashboard del panel. */
export async function listRecentProducts(limit: number) {
	return getDb()
		.select({
			id: products.id,
			name: products.name,
			price: products.price,
			categoryName: categories.name,
			createdAt: products.createdAt,
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.orderBy(desc(products.createdAt))
		.limit(limit);
}