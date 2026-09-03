import type { Metadata } from "next";
import { and, asc, count, desc, eq, gte, ilike } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { ProductCard } from "@/components/shop/product-card";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Catálogo | Finas Joyería",
	description:
		"Explora el catálogo de joyería fina de Finas: collares, anillos, aretes, pulseras y más. Filtra por categoría, precio y novedades.",
	alternates: {
		canonical: "https://finasjoyerias.zfd.app/shop",
	},
	openGraph: {
		type: "website",
		title: "Catálogo | Finas Joyería",
		description:
			"Explora el catálogo de joyería fina de Finas: collares, anillos, aretes, pulseras y más.",
		url: "https://finasjoyerias.zfd.app/shop",
	},
};

interface SearchParams {
	categoria?: string;
	q?: string;
	featured?: string;
	orden?: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function ShopPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const { categoria, q, featured, orden } = await searchParams;
	const db = getDb();

	// Conteo de productos por categoría (independiente del filtro activo).
	const countsByCategory = await db
		.select({ categoryId: products.categoryId, total: count(products.id) })
		.from(products)
		.groupBy(products.categoryId);

	const countMap = new Map(
		countsByCategory.map((c) => [c.categoryId, c.total])
	);

	const categoryRows = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
		})
		.from(categories)
		.orderBy(asc(categories.name));

	// Filtros server-side.
	const conditions = [];

	if (categoria) {
		const found = categoryRows.find((c) => c.slug === categoria);
		if (found) {
			conditions.push(eq(products.categoryId, found.id));
		} else {
			// Categoría inexistente → sin resultados.
			conditions.push(eq(products.id, ""));
		}
	}

	if (q && q.trim()) {
		conditions.push(ilike(products.name, `%${q.trim()}%`));
	}

	// "featured": por ahora = piezas creadas hace menos de 7 días
	// (decisión de producto: no tocar el schema todavía).
	if (featured === "1") {
		conditions.push(
			gte(products.createdAt, new Date(Date.now() - SEVEN_DAYS_MS))
		);
	}

	const orderBy =
		orden === "precio-asc"
			? [asc(products.price)]
			: orden === "precio-desc"
				? [desc(products.price)]
				: orden === "nombre"
					? [asc(products.name)]
					: [desc(products.createdAt)];

	const rows = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			price: products.price,
			categoryId: products.categoryId,
			categoryName: categories.name,
			imageUrl: images.key,
			imageAlt: images.altText,
			createdAt: products.createdAt,
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.leftJoin(images, eq(images.id, products.imageId))
		.where(and(...conditions))
		.orderBy(...orderBy);

	const productCards = rows.map((p) => ({
		id: p.id,
		name: p.name,
		slug: p.slug,
		price: p.price,
		categoryName: p.categoryName,
		imageUrl: p.imageUrl ? `/api/images/${p.imageUrl}` : null,
		imageAlt: p.imageAlt,
		isNew: p.createdAt.getTime() >= Date.now() - SEVEN_DAYS_MS,
	}));

	const chips = categoryRows.map((c) => ({
		slug: c.slug,
		name: c.name,
		count: countMap.get(c.id) ?? 0,
	}));

	return (
		<>
			{/* Header del catálogo */}
			<section className="bg-cream pt-36 pb-10 md:pt-44">
				<div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
					<span className="mb-4 block font-body text-[10px] font-medium tracking-[0.3em] text-primary uppercase">
						Joyería Fina
					</span>
					<h1 className="font-heading text-4xl font-light text-heading md:text-5xl">
						Nuestro <span className="italic text-primary">catálogo</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl font-body text-sm text-text-body">
						Cada pieza es diseñada con pasión y creada con los
						materiales más finos del mundo.
					</p>
				</div>
			</section>

			{/* Contenido */}
			<section className="bg-cream pb-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<CatalogToolbar
						categories={chips}
						filters={{ categoria, q, featured, orden }}
						total={rows.length}
					/>

					{/* Grid de productos */}
					{productCards.length > 0 ? (
						<div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{productCards.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					) : (
						<div className="mt-12 rounded-xl border border-dashed bg-white/60 px-6 py-20 text-center">
							<p className="font-heading text-2xl font-light text-heading">
								No encontramos piezas
							</p>
							<p className="mt-2 font-body text-sm text-muted-foreground">
								Prueba con otros filtros o vuelve a intentar más
								tarde.
							</p>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
