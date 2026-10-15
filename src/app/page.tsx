import { HomeContent } from "@/components/home-content";
import type { LandingCategory } from "@/components/Categories";
import type { ShopProduct } from "@/components/shop/product-card";
import { listHomeProducts } from "@/lib/server/products";
import {
	listCategoriesWithImages,
	toCategoryCards,
} from "@/lib/server/categories";
import { SEVEN_DAYS_MS } from "@/lib/server/media";

export const dynamic = "force-dynamic";

/**
 * La landing nunca tira 500 por un fallo de base de datos: es la primera
 * pantalla que ve el cliente y quedarse en blanco por un hipo de Neon es peor
 * que mostrar la rejilla vacía.
 *
 * El `catch` vive aquí y no en el DAL a propósito: degradar o propagar es una
 * decisión de presentación y cada ruta tiene la suya (el detalle de producto,
 * por ejemplo, no degrada a 404 porque mentiría sobre la existencia de la
 * pieza). Si el DAL capturara, esa política quedaría enterrada en la capa de
 * datos.
 */
async function loadHomeProducts(): Promise<ShopProduct[]> {
	const since = new Date(Date.now() - SEVEN_DAYS_MS);

	try {
		return await listHomeProducts(since);
	} catch (error) {
		console.error("[home] No se pudieron cargar los productos:", error);
		return [];
	}
}

async function loadHomeCategories(): Promise<LandingCategory[]> {
	try {
		return toCategoryCards(await listCategoriesWithImages());
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