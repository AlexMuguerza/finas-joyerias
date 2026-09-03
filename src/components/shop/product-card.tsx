import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { RemoteImage } from "@/components/remote-image";

export interface ShopProduct {
	id: string;
	name: string;
	slug: string;
	price: string;
	categoryName: string | null;
	imageUrl: string | null;
	imageAlt: string | null;
	isNew?: boolean;
}

/**
 * Tarjeta de producto del catálogo público. La imagen se sirve desde
 * /api/images/<key> (ruta del worker con caché) y muestra skeleton mientras
 * carga y un fallback si falla. Toda la tarjeta enlaza a /productos/<slug>.
 */
export function ProductCard({ product }: { product: ShopProduct }) {
	return (
		<Link
			href={`/productos/${product.slug}`}
			className="group block"
			aria-label={`Ver ${product.name}`}
		>
			<div className="relative mb-5 aspect-square overflow-hidden bg-soft-pink">
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

				{product.isNew && (
					<span className="absolute top-4 left-4 bg-primary px-3 py-1 font-body text-[9px] font-medium tracking-[0.15em] text-white uppercase">
						Nuevo
					</span>
				)}
			</div>

			<div className="text-center">
				{product.categoryName && (
					<span className="mb-2 block font-body text-[10px] font-medium tracking-[0.2em] text-primary uppercase">
						{product.categoryName}
					</span>
				)}
				<h3 className="mb-2 font-heading text-xl font-light text-heading transition-colors duration-300 group-hover:text-primary">
					{product.name}
				</h3>
				<p className="font-body text-base font-medium text-foreground">
					{formatPrice(product.price)}
				</p>
			</div>
		</Link>
	);
}
