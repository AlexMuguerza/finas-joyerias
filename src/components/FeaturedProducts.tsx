"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { RemoteImage } from "@/components/remote-image";
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
					<span className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary block mb-4">
						Piezas Seleccionadas
					</span>
					<h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
						Nuestras <span className="italic text-primary">joyas</span> destacadas
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
										<div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white font-body text-[9px] font-medium tracking-[0.15em] uppercase">
											Nuevo
										</div>
									)}

									{/* Hover Actions */}
									<div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 opacity-0 group-hover:bg-black/15 group-hover:opacity-100 transition-all duration-500">
										<Link
											href={`/productos/${product.slug}`}
											className="w-12 h-12 bg-white/95 flex items-center justify-center text-foreground hover:bg-white transition-colors duration-300 translate-y-4 group-hover:translate-y-0"
											aria-label={`Ver ${product.name} en detalle`}
										>
											<Eye size={18} strokeWidth={1.5} />
										</Link>
										<button
											type="button"
											className="w-12 h-12 bg-white/95 flex items-center justify-center text-foreground hover:bg-white transition-colors duration-300 cursor-pointer translate-y-4 group-hover:translate-y-0"
											aria-label={`Agregar ${product.name} a favoritos`}
										>
											<Heart size={18} strokeWidth={1.5} />
										</button>
									</div>

									{/* Quick View Bar */}
									<div className="absolute bottom-0 left-0 right-0 bg-foreground text-white py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
										<span className="font-body text-[10px] font-medium tracking-[0.15em] uppercase">
											Vista rápida
										</span>
									</div>
								</div>

								{/* Product Info */}
								<div className="text-center">
									{product.categoryName && (
										<span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-primary block mb-2">
											{product.categoryName}
										</span>
									)}
									<h3 className="font-heading text-xl font-light text-heading mb-2 group-hover:text-primary transition-colors duration-300">
										{product.name}
									</h3>
									<p className="font-body text-base font-medium text-foreground">
										{formatPrice(product.price)}
									</p>
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
