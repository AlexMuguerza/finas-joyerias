"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { RemoteImage } from "@/components/remote-image";

export interface LandingCategory {
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	productCount: number;
}

/**
 * Sección "Colecciones" de la landing. Recibe las categorías reales desde la
 * BD (server component) y cada tarjeta enlaza a /categorias. La imagen R2
 * muestra skeleton mientras carga y fallback si falla.
 */
export const Categories = ({
	categories,
}: {
	categories: LandingCategory[];
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(containerRef, { once: true, margin: "-100px" });

	return (
		<section id="colecciones" className="section-padding bg-cream">
			<div className="max-w-7xl mx-auto px-6 lg:px-8" ref={containerRef}>
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					className="text-center mb-20"
				>
					<motion.span
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary block mb-4"
					>
						Nuestras Colecciones
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ delay: 0.3, duration: 0.8 }}
						className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6"
					>
						Encuentra tu <span className="italic text-primary">estilo</span>
					</motion.h2>
					<motion.div
						initial={{ scaleX: 0 }}
						animate={isInView ? { scaleX: 1 } : {}}
						transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
						className="w-16 h-px bg-gold mx-auto"
					/>
				</motion.div>

				{/* Categories Grid */}
				{categories.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						{categories.map((category, index) => (
							<motion.div
								key={category.slug}
								initial={{ opacity: 0, y: 40 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{
									delay: 0.2 + index * 0.1,
									duration: 0.8,
									ease: [0.16, 1, 0.3, 1],
								}}
							>
								<CategoryCard category={category} />
							</motion.div>
						))}
					</div>
				) : (
					<div className="mx-auto max-w-xl rounded-xl border border-dashed bg-white/60 px-6 py-16 text-center">
						<p className="font-heading text-2xl font-light text-heading">
							Pronto abriremos nuestras colecciones
						</p>
						<p className="mt-2 font-body text-sm text-muted-foreground">
							Estamos preparando piezas únicas para ti.
						</p>
					</div>
				)}

				{/* View all button */}
				{categories.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ delay: 0.8, duration: 0.6 }}
						className="text-center mt-16"
					>
						<Link href="/categorias" className="btn-outline inline-block">
							Ver todas las colecciones
						</Link>
					</motion.div>
				)}
			</div>
		</section>
	);
};

const CategoryCard = ({ category }: { category: LandingCategory }) => {
	return (
		<Link
			href={"/shop?categoria=" + category.slug}
			className="group relative block aspect-4/5 overflow-hidden cursor-pointer bg-soft-pink"
			aria-label={`Explorar colección de ${category.name}`}
		>
			{/* Image */}
			{category.imageUrl ? (
				<RemoteImage
					src={category.imageUrl}
					alt={`Colección de ${category.name} - Finas Joyería`}
					containerClassName="absolute inset-0"
					imgClassName="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
				/>
			) : (
				<div className="absolute inset-0 flex items-center justify-center font-heading text-6xl font-light text-primary">
					{category.name.charAt(0)}
				</div>
			)}

			{/* Overlay Gradient */}
			<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

			{/* Content */}
			<div className="absolute inset-0 flex flex-col justify-end p-8">
				<div className="transform transition-all duration-500 group-hover:-translate-y-2">
					<span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-white/70 block mb-2">
						{category.productCount === 1
							? "1 pieza"
							: `${category.productCount} piezas`}
					</span>
					<h3 className="font-heading text-3xl md:text-4xl font-light text-white mb-3">
						{category.name}
					</h3>
					<div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
						<span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-white/90">
							Explorar
						</span>
						<svg width="24" height="1" viewBox="0 0 24 1" className="text-white/50">
							<line x1="0" y1="0.5" x2="24" y2="0.5" stroke="currentColor" strokeWidth="1" />
						</svg>
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							className="text-white/70 transform group-hover:translate-x-1 transition-transform duration-300"
						>
							<path
								d="M1 6H11M11 6L6 1M11 6L6 11"
								stroke="currentColor"
								strokeWidth="1"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Decorative Corner */}
			<div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
		</Link>
	);
};
