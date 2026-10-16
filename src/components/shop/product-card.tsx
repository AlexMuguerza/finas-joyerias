import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { RemoteImage } from "@/components/remote-image";
import { ProductActions } from "@/components/shop/product-actions";

export interface ShopProduct {
	id: string;
	name: string;
	slug: string;
	price: string;
	sku?: string | null;
	categoryName: string | null;
	imageUrl: string | null;
	imageAlt: string | null;
	isNew?: boolean;
}

/**
 * Tarjeta de producto del catálogo público. La imagen se sirve desde
 * /api/images/<key> (ruta del worker con caché) y muestra skeleton mientras
 * carga y un fallback si falla. La imagen y el nombre enlazan a
 * /productos/<slug>; los botones de carrito/WhatsApp no navegan.
 */
export function ProductCard({ product }: { product: ShopProduct }) {
	return (
		<article className="group block">
			<div className="relative mb-5 aspect-square overflow-hidden bg-soft-pink">
				<Link href={`/productos/${product.slug}`} aria-label={`Ver ${product.name}`}>
					{product.imageUrl ? (
						<RemoteImage
							src={product.imageUrl}
							alt={product.imageAlt ?? product.name}
							containerClassName="h-full w-full"
							imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-muted-foreground uppercase">
							Sin imagen
						</div>
					)}
				</Link>

				{product.isNew && (
					<span className="absolute top-4 left-4 bg-primary-strong px-3 py-1.5 font-body text-eyebrow font-medium tracking-label text-white uppercase">
						Nuevo
					</span>
				)}
			</div>

			<div className="text-center">
				{product.categoryName && (
					<span className="mb-2 block font-body text-eyebrow font-medium tracking-label text-primary-strong uppercase">
						{product.categoryName}
					</span>
				)}
				<Link href={`/productos/${product.slug}`}>
					<h3 className="mb-2 font-heading text-xl font-light text-heading transition-colors duration-300 hover:text-primary-strong">
						{product.name}
				</h3>
				</Link>
				{product.sku && (
					<p className="mb-1 font-body text-eyebrow tracking-label text-muted-foreground uppercase">
						SKU: {product.sku}
					</p>
				)}
				<p className="font-body text-base font-medium text-foreground">
					{formatPrice(product.price)}
				</p>

				{/* Acciones: carrito + WhatsApp, bajo el nombre/precio */}
				<div className="mt-4 flex justify-center">
					<ProductActions
						product={{
							id: product.id,
							name: product.name,
							slug: product.slug,
							sku: product.sku ?? null,
							price: Number(product.price),
							imageUrl: product.imageUrl,
						}}
						variant="card"
					/>
				</div>
			</div>
		</article>
	);
}
