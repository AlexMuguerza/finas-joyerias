"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Categories, type LandingCategory } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Lifestyle } from "@/components/Lifestyle";
import { BrandStory } from "@/components/BrandStory";
import { CTA } from "@/components/CTA";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import type { ShopProduct } from "@/components/shop/product-card";

/**
 * Shell cliente de la landing. Las secciones Categories y FeaturedProducts
 * reciben los datos reales que el server component (src/app/page.tsx) consulta
 * en la BD.
 *
 * Aquí hubo un `Preloader` que montaba la landing entera en `opacity: 0` y
 * solo la revelaba cuando su contador llegaba a 100. Además de ~1.9 s de espera
 * y 440 KB de logo, era un fallo de una sola vía: si el preloader no llegaba a
 * llamar a `onComplete` —JS bloqueado, hidratación lenta en un móvil, el
 * componente desmontado antes de terminar— la página se quedaba invisible
 * entera, sin explicar por qué. Ahora el contenido se pinta siempre y las
 * animaciones de entrada son adorno.
 */
export function HomeContent({
	categories,
	products,
}: {
	categories: LandingCategory[];
	products: ShopProduct[];
}) {
	return (
		<>
			<Navbar />
			<Hero />
			<Marquee />
			<Categories categories={categories} />
			<FeaturedProducts products={products} />
			<Lifestyle />
			<BrandStory />
			<CTA />
			<Contact />
			<Footer />
		</>
	);
}
