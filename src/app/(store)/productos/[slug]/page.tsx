import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
	getProductBySlug,
	listRelatedProducts,
} from "@/lib/server/products";
import { imageUrl, SEVEN_DAYS_MS } from "@/lib/server/media";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/shop/product-card";
import { ProductActions } from "@/components/shop/product-actions";
import { RemoteImage } from "@/components/remote-image";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;

	// Comparte consulta con el cuerpo de la página gracias a `cache()` en el
	// DAL: antes cada uno hacía su propio `select`, y al proyectar columnas
	// distintas React no los deduplicaba. Dos viajes a Neon para pintar un
	// `<title>`.
	const product = await getProductBySlug(slug);

	if (!product) return {};

	const url = `/productos/${slug}`;
	const description =
		product.description ??
		`Compra ${product.name} en Finas Joyería. Joyería fina y exclusiva.`;
	const image = imageUrl(product.imageKey);

	return {
		title: `${product.name} | Finas Joyería`,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "website",
			title: `${product.name} | Finas Joyería`,
			description,
			url,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	// Un único "ahora" para el badge del producto y el de los relacionados, que
	// antes comparaban contra dos instantes distintos.
	//
	// Server Component async con `dynamic = "force-dynamic"`: el HTML se genera
	// una vez por petición y `now` no se hidrata en el cliente. La regla apunta a
	// Client Components, donde un render impure sí provoca desajuste.
	// eslint-disable-next-line react-hooks/purity
	const now = Date.now();
	const since = new Date(now - SEVEN_DAYS_MS);

	let product;
	try {
		// Deduplicado por `cache()`: es la misma llamada que hace
		// `generateMetadata`, así que ambas comparten una única consulta.
		product = await getProductBySlug(slug);
	} catch (error) {
		// Aquí NO se degrada a 404, a diferencia de `/shop` y `/categorias`. Un
		// fallo de base de datos no significa que el producto no exista, y
		// devolver 404 en ese caso mentiría al cliente y podría llevar al
		// crawler a desindexar la URL. Se propaga al `error.tsx` del segmento,
		// que ofrece reintentar.
		console.error(`[producto] No se pudo cargar "${slug}":`, error);
		throw error;
	}

	if (!product) {
		// Aquí sí: la consulta funcionó y no había fila. 404 legítimo.
		notFound();
	}

	const isNew = product.createdAt.getTime() >= now - SEVEN_DAYS_MS;

	// Relacionados: primero los de la misma categoría; si faltan para llenar
	// la fila (máx. 8), se completan con los más recientes de otras
	// categorías (complementos). Máximo 2 consultas acotadas, sin N+1.
	const MAX_RELATED = 8;

	const related = await listRelatedProducts({
		categoryId: product.categoryId,
		excludeId: product.id,
		since,
		limit: MAX_RELATED,
	});

	const productUrl = `/productos/${product.slug}`;
	const productImageUrl = imageUrl(product.imageKey);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		image: productImageUrl ? [productImageUrl] : undefined,
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
					<ol className="flex flex-wrap items-center gap-2 font-body text-label tracking-widest text-muted-foreground uppercase">
						<li>
							<Link href="/" className="transition-colors hover:text-primary-strong">
								Inicio
							</Link>
						</li>
						<li aria-hidden="true">/</li>
						<li>
							<Link
								href="/categorias"
								className="transition-colors hover:text-primary-strong"
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
										className="transition-colors hover:text-primary-strong"
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
						{productImageUrl ? (
							<RemoteImage
								src={productImageUrl}
								alt={product.imageAlt ?? product.name}
								containerClassName="h-full w-full"
								sizes="(min-width: 1024px) 46vw, 92vw"
								eager
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-muted-foreground uppercase">
								Sin imagen
							</div>
						)}
						{isNew && (
							<span className="absolute top-5 left-5 bg-primary-strong px-3 py-1.5 font-body text-eyebrow font-medium tracking-label text-white uppercase">
								Nuevo
							</span>
						)}
					</div>

					{/* Información */}
					<div className="flex flex-col justify-center">
						{product.categoryName && (
							<span className="mb-3 block font-body text-label font-medium tracking-label text-primary-strong uppercase">
								{product.categoryName}
							</span>
						)}
						<h1 className="mb-4 font-heading text-4xl font-light text-heading md:text-5xl">
							{product.name}
						</h1>
						{product.sku && (
							<p className="mb-3 font-body text-label tracking-label text-muted-foreground uppercase">
								SKU: {product.sku}
							</p>
						)}
						<p className="mb-8 font-body text-2xl font-medium text-foreground">
							{formatPrice(product.price)}
						</p>

						{product.description && (
							<div className="mb-10 whitespace-pre-line font-body text-sm leading-relaxed text-text-body">
								{product.description}
							</div>
						)}

						{/* CTA: carrito local + WhatsApp */}
						<div className="flex flex-col gap-3">
							<ProductActions
								product={{
									id: product.id,
									name: product.name,
									slug: product.slug,
									sku: product.sku,
									price: Number(product.price),
									imageUrl: productImageUrl,
								}}
								variant="detail"
							/>
							<Link
								href="/carrito"
								className="px-10 py-4 text-center font-body text-label font-medium tracking-label text-foreground uppercase transition-colors duration-300 border border-foreground/40 hover:bg-foreground/5"
							>
								Ver carrito
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
							<span className="mb-3 block font-body text-eyebrow font-medium tracking-eyebrow text-primary-strong uppercase">
								Completa tu look
							</span>
							<h2 className="font-heading text-3xl font-light text-heading md:text-4xl">
								También te puede <span className="italic text-primary-strong">gustar</span>
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
							className="hidden snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:flex lg:gap-8 scrollbar-thin"
							role="region"
							aria-label="Productos relacionados, desliza horizontalmente"
						>
							{related.map((productCard) => (
								<div
									key={productCard.id}
									className="w-57.5 flex-none snap-start lg:w-65"
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
