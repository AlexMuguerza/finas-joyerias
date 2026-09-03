import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq, ne, not } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/shop/product-card";
import { RemoteImage } from "@/components/remote-image";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const db = getDb();
	const row = await db
		.select({
			name: products.name,
			description: products.description,
			imageKey: images.key,
		})
		.from(products)
		.leftJoin(images, eq(images.id, products.imageId))
		.where(eq(products.slug, slug))
		.limit(1);

	if (row.length === 0) return {};

	const product = row[0];
	const url = `/productos/${slug}`;

	return {
		title: `${product.name} | Finas Joyería`,
		description:
			product.description ??
			`Compra ${product.name} en Finas Joyería. Joyería fina y exclusiva.`,
		alternates: { canonical: url },
		openGraph: {
			type: "website",
			title: `${product.name} | Finas Joyería`,
			description:
				product.description ??
				`Compra ${product.name} en Finas Joyería.`,
			url,
			images: product.imageKey
				? [{ url: `/api/images/${product.imageKey}` }]
				: undefined,
		},
	};
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const db = getDb();

	const rows = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			description: products.description,
			price: products.price,
			categoryId: products.categoryId,
			categoryName: categories.name,
			categorySlug: categories.slug,
			imageKey: images.key,
			imageAlt: images.altText,
			createdAt: products.createdAt,
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.leftJoin(images, eq(images.id, products.imageId))
		.where(eq(products.slug, slug))
		.limit(1);

	if (rows.length === 0) {
		notFound();
	}

	const product = rows[0];
	const isNew = product.createdAt.getTime() >= Date.now() - SEVEN_DAYS_MS;

	// Relacionados: primero los de la misma categoría; si faltan para llenar
	// la fila (máx. 8), se completan con los más recientes de otras
	// categorías (complementos). Máximo 2 consultas acotadas, sin N+1.
	const RELATED_COLUMNS = {
		id: products.id,
		name: products.name,
		slug: products.slug,
		price: products.price,
		categoryName: categories.name,
		imageUrl: images.key,
		imageAlt: images.altText,
		createdAt: products.createdAt,
	};

	const MAX_RELATED = 8;

	const relatedRows = await db
		.select(RELATED_COLUMNS)
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.leftJoin(images, eq(images.id, products.imageId))
		.where(
			and(eq(products.categoryId, product.categoryId), ne(products.id, product.id))
		)
		.orderBy(desc(products.createdAt))
		.limit(MAX_RELATED);

	if (relatedRows.length < MAX_RELATED) {
		const remaining = MAX_RELATED - relatedRows.length;
		const fillRows = await db
			.select(RELATED_COLUMNS)
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.leftJoin(images, eq(images.id, products.imageId))
			.where(
				and(ne(products.id, product.id), not(eq(products.categoryId, product.categoryId)))
			)
			.orderBy(desc(products.createdAt))
			.limit(remaining);
		relatedRows.push(...fillRows);
	}

	const related = relatedRows.map((p) => ({
		id: p.id,
		name: p.name,
		slug: p.slug,
		price: p.price,
		categoryName: p.categoryName,
		imageUrl: p.imageUrl ? `/api/images/${p.imageUrl}` : null,
		imageAlt: p.imageAlt,
		isNew: p.createdAt.getTime() >= Date.now() - SEVEN_DAYS_MS,
	}));

	const productUrl = `/productos/${product.slug}`;
	const imageUrl = product.imageKey
		? `/api/images/${product.imageKey}`
		: null;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		image: imageUrl ? [imageUrl] : undefined,
		description: product.description ?? undefined,
		brand: { "@type": "Brand", name: "Finas Joyería" },
		category: product.categoryName ?? undefined,
		offers: {
			"@type": "Offer",
			url: productUrl,
			priceCurrency: "PEN",
			price: product.price,
			availability: "https://schema.org/InStock",
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* Breadcrumbs */}
			<nav
				aria-label="Migas de pan"
				className="bg-cream pt-32 md:pt-36"
			>
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<ol className="flex flex-wrap items-center gap-2 font-body text-[11px] tracking-widest text-muted-foreground uppercase">
						<li>
							<Link href="/" className="transition-colors hover:text-primary">
								Inicio
							</Link>
						</li>
						<li aria-hidden="true">/</li>
						<li>
							<Link
								href="/categorias"
								className="transition-colors hover:text-primary"
							>
								Categorías
							</Link>
						</li>
						{product.categoryName && (
							<>
								<li aria-hidden="true">/</li>
								<li>
									<Link
										href={`/shop?categoria=${encodeURIComponent(product.categorySlug ?? "")}`}
										className="transition-colors hover:text-primary"
									>
										{product.categoryName}
									</Link>
								</li>
							</>
						)}
						<li aria-hidden="true">/</li>
						<li aria-current="page" className="text-foreground">
							{product.name}
						</li>
					</ol>
				</div>
			</nav>

			{/* Detalle */}
			<section className="bg-cream py-12 pb-20">
				<div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
					{/* Imagen */}
					<div className="relative aspect-square overflow-hidden bg-soft-pink">
						{imageUrl ? (
							<RemoteImage
								src={imageUrl}
								alt={product.imageAlt ?? product.name}
								containerClassName="h-full w-full"
								eager
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-muted-foreground uppercase">
								Sin imagen
							</div>
						)}
						{isNew && (
							<span className="absolute top-5 left-5 bg-primary px-3 py-1 font-body text-[9px] font-medium tracking-[0.15em] text-white uppercase">
								Nuevo
							</span>
						)}
					</div>

					{/* Información */}
					<div className="flex flex-col justify-center">
						{product.categoryName && (
							<span className="mb-3 block font-body text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
								{product.categoryName}
							</span>
						)}
						<h1 className="mb-4 font-heading text-4xl font-light text-heading md:text-5xl">
							{product.name}
						</h1>
						<p className="mb-8 font-body text-2xl font-medium text-foreground">
							{formatPrice(product.price)}
						</p>

						{product.description && (
							<div className="mb-10 whitespace-pre-line font-body text-sm leading-relaxed text-text-body">
								{product.description}
							</div>
						)}

						{/* CTA */}
						<div className="flex flex-col gap-3">
							<button
								type="button"
								disabled
								title="El carrito estará disponible próximamente"
								className="cursor-not-allowed bg-foreground px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-white uppercase opacity-50"
							>
								Agregar al carrito — Próximamente
							</button>
							<Link
								href="/shop"
								className="px-10 py-4 text-center font-body text-[11px] font-medium tracking-[0.2em] text-foreground uppercase transition-colors duration-300 border border-foreground/40 hover:bg-foreground/5"
							>
								Ver catálogo completo
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Relacionados */}
			{related.length > 0 && (
				<section className="overflow-hidden bg-cream pb-24">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="mb-12 text-center">
							<span className="mb-3 block font-body text-[10px] font-medium tracking-[0.3em] text-primary uppercase">
								Completa tu look
							</span>
							<h2 className="font-heading text-3xl font-light text-heading md:text-4xl">
								También te puede <span className="italic text-primary">gustar</span>
							</h2>
						</div>

						{/* Móvil: 2 columnas sin slide. */}
						<div className="grid grid-cols-2 gap-x-4 gap-y-12 md:hidden">
							{related.map((productCard) => (
								<ProductCard key={productCard.id} product={productCard} />
							))}
						</div>

						{/* Escritorio: slide horizontal con snap. */}
						<div
							className="hidden snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:flex lg:gap-8 [scrollbar-width:thin]"
							role="region"
							aria-label="Productos relacionados, desliza horizontalmente"
						>
							{related.map((productCard) => (
								<div
									key={productCard.id}
									className="w-[230px] flex-none snap-start lg:w-[260px]"
								>
									<ProductCard product={productCard} />
								</div>
							))}
						</div>
					</div>
				</section>
			)}
		</>
	);
}
