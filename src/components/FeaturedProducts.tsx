"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eye } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { RemoteImage } from "@/components/remote-image";
import { ProductActions } from "@/components/shop/product-actions";
import type { ShopProduct } from "@/components/shop/product-card";

/**
 * Sección "joyas destacadas" de la landing. Recibe 6 productos reales desde
 * la BD (los más nuevos ≤ 7 días; si faltan, se completan con piezas
 * aleatorias tratando de cubrir una por categoría). El botón de ojo enlaza
 * al detalle /productos/<slug>.
 */
export const FeaturedProducts = ({ products }: { products: ShopProduct[] }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(containerRef, { once: true, margin: "-100px" });

	return (
		<section id="productos" className="section-padding bg-white">
			<div className="max-w-7xl mx-auto px-6 lg:px-8" ref={containerRef}>
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					className="text-center mb-16"
				>
					<span className="font-body text-eyebrow font-medium tracking-eyebrow uppercase text-primary-strong block mb-4">
						Piezas Seleccionadas
					</span>
					<h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
						Nuestras <span className="italic text-primary-strong">joyas</span> destacadas
					</h2>
					<div className="w-16 h-px bg-gold mx-auto" />
				</motion.div>

				{/* Products Grid */}
				{products.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{products.map((product, index) => (
							<motion.article
								key={product.id}
								initial={{ opacity: 0, y: 40 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{
									duration: 0.6,
									delay: 0.1 + index * 0.08,
									ease: [0.16, 1, 0.3, 1],
								}}
								className="group relative"
							>
								{/* Image Container */}
								<div className="relative aspect-square bg-soft-pink mb-5 overflow-hidden">
									{product.imageUrl ? (
										<RemoteImage
											src={product.imageUrl}
											alt={`${product.name} - ${product.categoryName ?? "Finas Joyería"}`}
											containerClassName="h-full w-full"
											imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-muted-foreground uppercase">
											Sin imagen
										</div>
									)}

{/* Badge */}
								{product.isNew && (
									<div className="absolute top-4 left-4 bg-primary-strong px-3 py-1.5 font-body text-eyebrow font-medium tracking-label text-white uppercase">
										Nuevo
									</div>
								)}

								{/* Enlace al detalle. El botón con el ojo solo se ve con
								    hover en escritorio: en táctil no hay hover y el
								    enlace quedaba enfocable pero invisible. */}
								<div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-100 transition-opacity duration-500 lg:bg-black/0 lg:opacity-0 lg:group-hover:bg-black/15 lg:group-hover:opacity-100">
									<Link
										href={`/productos/${product.slug}`}
										className="flex h-12 w-12 items-center justify-center bg-white/95 text-foreground transition-all duration-300 hover:bg-white lg:translate-y-4 lg:group-hover:translate-y-0"
										aria-label={`Ver ${product.name} en detalle`}
									>
										<Eye size={18} strokeWidth={1.5} aria-hidden="true" />
									</Link>
								</div>
							</div>

								{/* Product Info */}
								<div className="text-center">
									{product.categoryName && (
										<span className="font-body text-eyebrow font-medium tracking-label uppercase text-primary-strong block mb-2">
											{product.categoryName}
										</span>
									)}
									<h3 className="font-heading text-xl font-light text-heading mb-2 group-hover:text-primary-strong transition-colors duration-300">
										{product.name}
									</h3>
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
							</motion.article>
						))}
					</div>
				) : (
					<div className="mx-auto max-w-xl rounded-xl border border-dashed bg-muted/40 px-6 py-16 text-center">
						<p className="font-heading text-2xl font-light text-heading">
							Pronto nuevas piezas
						</p>
						<p className="mt-2 font-body text-sm text-muted-foreground">
							Estamos creando joyas nuevas para ti. Vuelve en unos días.
						</p>
					</div>
				)}

				{/* View All Button */}
				{products.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ delay: 0.8, duration: 0.6 }}
						className="text-center mt-16"
					>
						<Link href="/shop" className="btn-outline inline-block">
							Ver Todo el Catálogo
						</Link>
					</motion.div>
				)}
			</div>
		</section>
	);
};
