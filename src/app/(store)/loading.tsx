import { PageHeadingSkeleton, ProductGridSkeleton } from "@/components/skeleton";

/**
 * Estado de carga del segmento de la tienda. Cubre `/shop`, `/categorias` y
 * `/productos/[slug]`, que son las rutas que consultan la base de datos y por
 * lo tanto las que pueden tardar.
 *
 * Se usa `PageHeadingSkeleton` en vez de la cabecera real porque la cabecera de
 * cada página depende de filtros que aún no se han resuelto.
 */
export default function StoreLoading() {
	return (
		<>
			<div className="bg-cream">
				<PageHeadingSkeleton />
			</div>
			<section className="bg-cream pb-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<ProductGridSkeleton />
				</div>
			</section>
		</>
	);
}
