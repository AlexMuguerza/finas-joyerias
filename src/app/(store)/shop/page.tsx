import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/product-card";
import type { ShopProduct } from "@/components/shop/product-card";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import type { CatalogCategory } from "@/components/shop/catalog-toolbar";
import { listCatalog } from "@/lib/server/products";
import { listCategoryChips } from "@/lib/server/categories";
import { SEVEN_DAYS_MS } from "@/lib/server/media";

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

export default async function ShopPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const { categoria, q, featured, orden } = await searchParams;
	// Un único "ahora" para todo el render. Antes, el filtro de novedades y
	// cada badge "Nuevo" llamaban a `Date.now()` por separado: en el borde de
	// los 7 días un producto podía entrar en el filtro y salir sin la etiqueta
	// (o al revés) dentro de la misma respuesta.
	//
	// Server Component async con `dynamic = "force-dynamic"`: el HTML se genera
	// una vez por petición y `now` no se hidrata en el cliente, así que no hay
	// desajuste posible. La regla existe para Client Components, donde un render
	// impure sí lo produce.
	// eslint-disable-next-line react-hooks/purity
	const now = Date.now();
	const since = new Date(now - SEVEN_DAYS_MS);

	// Un fallo de la base de datos no debe dejar el catálogo entero en 500: en
	// un plan gratuito de Neon los cortes son relativamente frecuentes. Se
	// distingue "no hay productos" de "no pudimos consultar", porque un
	// catálogo vacío sin explicación se lee como una tienda vacía y hace
	// perder clientes reales.
	let productCards: ShopProduct[] = [];
	let chips: CatalogCategory[] = [];
	let dbFailed = false;

	try {
		// Listado y chips salen de consultas separadas pero paralelas: los chips
		// dependen del total por categoría, que no varía con el filtro activo.
		const [cards, categoryChips] = await Promise.all([
			listCatalog({ categoria, q, featured, orden, since }),
			listCategoryChips(),
		]);

		productCards = cards;
		chips = categoryChips;
	} catch (error) {
		dbFailed = true;
		console.error("[shop] No se pudo cargar el catálogo:", error);
	}

	return (
		<>
			{/* Header del catálogo */}
			<section className="bg-cream pt-20 pb-10 md:pt-36">
				<div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
					<span className="mb-4 block font-body text-eyebrow font-medium tracking-eyebrow text-primary-strong uppercase">
						Joyería Fina
					</span>
					<h1 className="font-heading text-4xl font-light text-heading md:text-5xl">
						Nuestro <span className="italic text-primary-strong">catálogo</span>
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
					{/* Con la base de datos caída no se muestra la barra de filtros:
					    los recuentos por categoría serían 0 y el usuario filtraría
					    sobre datos inexistentes. */}
					{!dbFailed && (
						<CatalogToolbar
							categories={chips}
							filters={{ categoria, q, featured, orden }}
							total={productCards.length}
						/>
					)}

					{/* Grid de productos */}
					{productCards.length > 0 ? (
						<div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{productCards.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					) : dbFailed ? (
						<div className="mt-12 rounded-xl border border-dashed bg-white/60 px-6 py-20 text-center">
							<p className="font-heading text-2xl font-light text-heading">
								No pudimos cargar el catálogo
							</p>
							<p className="mx-auto mt-2 max-w-md font-body text-sm text-muted-foreground">
								Es un problema puntual de conexión con nuestro servidor.
								Recarga la página en unos segundos o escríbenos por
								WhatsApp mientras tanto.
							</p>
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
