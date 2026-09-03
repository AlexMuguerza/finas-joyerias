import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { RemoteImage } from "@/components/remote-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Categorías | Finas Joyería",
	description:
		"Explora nuestras colecciones de joyería fina: collares, anillos, aretes, pulseras y más.",
	alternates: {
		canonical: "https://finasjoyerias.zfd.app/categorias",
	},
	openGraph: {
		type: "website",
		title: "Categorías | Finas Joyería",
		description:
			"Explora nuestras colecciones de joyería fina: collares, anillos, aretes, pulseras y más.",
		url: "https://finasjoyerias.zfd.app/categorias",
	},
};

export default async function CategoriasPage() {
	const db = getDb();

	// Una sola consulta: categoría + su imagen + conteo de productos.
	const rows = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			description: categories.description,
			imageKey: images.key,
			productCount: count(products.id),
		})
		.from(categories)
		.leftJoin(images, eq(images.id, categories.imageId))
		.leftJoin(products, eq(products.categoryId, categories.id))
		.groupBy(categories.id, categories.name, categories.slug, categories.description, images.id, images.key)
		.orderBy(asc(categories.name));

	return (
		<>
			<section className="bg-cream pt-36 pb-10 md:pt-44">
				<div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
					<span className="mb-4 block font-body text-[10px] font-medium tracking-[0.3em] text-primary uppercase">
						Nuestras Colecciones
					</span>
					<h1 className="font-heading text-4xl font-light text-heading md:text-5xl">
						Encuentra tu <span className="italic text-primary">estilo</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl font-body text-sm text-text-body">
						Cada colección está curada con piezas únicas. Pasa el cursor
						para conocer más y haz clic para explorar.
					</p>
				</div>
			</section>

			<section className="bg-cream pb-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					{rows.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
							{rows.map((cat) => (
								<Link
									key={cat.id}
									href={`/shop?categoria=${encodeURIComponent(cat.slug)}`}
									className="group relative block aspect-[4/5] overflow-hidden bg-soft-pink"
								>
									{cat.imageKey ? (
										<RemoteImage
											src={`/api/images/${cat.imageKey}`}
											alt={`Colección de ${cat.name} - Finas Joyería`}
											containerClassName="absolute inset-0"
											imgClassName="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center font-heading text-3xl font-light text-primary">
											{cat.name.charAt(0)}
										</div>
									)}

									{/* Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

									{/* Contenido */}
									<div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-8">
										<div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
											<span className="mb-2 block font-body text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase">
												{cat.productCount === 1
													? "1 pieza"
													: `${cat.productCount} piezas`}
											</span>
											<h2 className="mb-3 font-heading text-3xl font-light text-white md:text-4xl">
												{cat.name}
											</h2>
											<p className="max-h-0 overflow-hidden font-body text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
												{cat.description || "Explora esta colección."}
											</p>
											<span className="mt-4 inline-block font-body text-[10px] font-medium tracking-[0.2em] text-white/90 uppercase transition-colors duration-300 group-hover:text-primary-light">
												Ver colección →
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="rounded-xl border border-dashed bg-white/60 px-6 py-20 text-center">
							<p className="font-heading text-2xl font-light text-heading">
								Aún no hay colecciones
							</p>
							<p className="mt-2 font-body text-sm text-muted-foreground">
								Vuelve pronto: estamos preparando nuevas piezas.
							</p>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
