"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/Preloader";
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
 * Shell cliente de la landing: maneja el Preloader y el fade de entrada.
 * Las secciones Categories y FeaturedProducts reciben los datos reales que
 * el server component (src/app/page.tsx) consulta en la BD.
 */
export function HomeContent({
	categories,
	products,
}: {
	categories: LandingCategory[];
	products: ShopProduct[];
}) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<>
			<AnimatePresence>
				{isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
			</AnimatePresence>

			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: isLoading ? 0 : 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
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
			</motion.main>
		</>
	);
}
