import { and, asc, count, desc, eq, gte, notInArray, sql } from "drizzle-orm";
import { HomeContent } from "@/components/home-content";
import type { LandingCategory } from "@/components/Categories";
import type { ShopProduct } from "@/components/shop/product-card";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_HOME_PRODUCTS = 6;

const PRODUCT_SELECT = {
	id: products.id,
	name: products.name,
	slug: products.slug,
	price: products.price,
	categoryId: products.categoryId,
	categoryName: categories.name,
	imageKey: images.key,
	imageAlt: images.altText,
	createdAt: products.createdAt,
} as const;

type HomeProductRow = {
	id: string;
	name: string;
	slug: string;
	price: string;
	categoryId: string;
	categoryName: string | null;
	imageKey: string | null;
	imageAlt: string | null;
	createdAt: Date;
};

function toShopProduct(row: HomeProductRow, since: Date): ShopProduct {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		price: String(row.price),
		categoryName: row.categoryName,
		imageUrl: row.imageKey ? `/api/images/${row.imageKey}` : null,
		imageAlt: row.imageAlt,
		isNew: row.createdAt.getTime() >= since.getTime(),
	};
}

/**
 * Productos de la landing: siempre los 6 más nuevos creados hace menos de
 * una semana; si no hay suficientes (o ninguno), se completan con piezas
 * aleatorias procurando cubrir una por categoría para tener diversidad.
 * Nunca lanza: si la BD falla devuelve [] para que la landing no tire 500.
 */
async function loadHomeProducts(): Promise<ShopProduct[]> {
	try {
		const db = getDb();
		const since = new Date(Date.now() - SEVEN_DAYS_MS);

		// 1) Los más nuevos con menos de 7 días.
		const recent = await db
			.select(PRODUCT_SELECT)
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.leftJoin(images, eq(images.id, products.imageId))
			.where(gte(products.createdAt, since))
			.orderBy(desc(products.createdAt))
			.limit(MAX_HOME_PRODUCTS);

		const chosen = [...recent];
		const chosenIds = new Set(chosen.map((p) => p.id));

		// 2) Relleno por diversidad: 1 producto aleatorio por cada categoría
		// que todavía no esté representada (selectDistinctOn + random()).
		if (chosen.length < MAX_HOME_PRODUCTS) {
			const whereClause =
				chosenIds.size > 0
					? and(notInArray(products.id, [...chosenIds]))
					: undefined;

			const perCategory = await db
				.selectDistinctOn([products.categoryId], PRODUCT_SELECT)
				.from(products)
				.leftJoin(categories, eq(products.categoryId, categories.id))
				.leftJoin(images, eq(images.id, products.imageId))
				.where(whereClause)
				.orderBy(products.categoryId, sql`random()`)
				.limit(MAX_HOME_PRODUCTS - chosen.length);

			for (const row of perCategory) {
				if (!chosenIds.has(row.id)) {
					chosen.push(row);
					chosenIds.add(row.id);
					if (chosen.length >= MAX_HOME_PRODUCTS) break;
				}
			}
		}

		// 3) Último relleno: cualquier producto al azar si aún faltan piezas.
		if (chosen.length < MAX_HOME_PRODUCTS) {
			const whereClause =
				chosenIds.size > 0
					? and(notInArray(products.id, [...chosenIds]))
					: undefined;

			const extra = await db
				.select(PRODUCT_SELECT)
				.from(products)
				.leftJoin(categories, eq(products.categoryId, categories.id))
				.leftJoin(images, eq(images.id, products.imageId))
				.where(whereClause)
				.orderBy(sql`random()`)
				.limit(MAX_HOME_PRODUCTS - chosen.length);

			chosen.push(...extra);
		}

		return chosen.slice(0, MAX_HOME_PRODUCTS).map((p) =>
			toShopProduct(p, since)
		);
	} catch (error) {
		console.error("[home] No se pudieron cargar los productos:", error);
		return [];
	}
}

async function loadHomeCategories(): Promise<LandingCategory[]> {
	try {
		const db = getDb();

		const rows = await db
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

		return rows.map((row) => ({
			name: row.name,
			slug: row.slug,
			description: row.description,
			imageUrl: row.imageKey ? `/api/images/${row.imageKey}` : null,
			productCount: row.productCount,
		}));
	} catch (error) {
		console.error("[home] No se pudieron cargar las categorías:", error);
		return [];
	}
}

export default async function Home() {
	const [homeCategories, homeProducts] = await Promise.all([
		loadHomeCategories(),
		loadHomeProducts(),
	]);

	return <HomeContent categories={homeCategories} products={homeProducts} />;
}
