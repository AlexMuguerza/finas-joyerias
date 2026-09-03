import { MetadataRoute } from "next";
import { getDb } from "@/lib/server/db";
import { categories, products } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = "https://finasjoyerias.zfd.app";

	const db = getDb();

	const [categoryRows, productRows] = await Promise.all([
		db
			.select({ slug: categories.slug, updatedAt: categories.updatedAt })
			.from(categories),
		db
			.select({ slug: products.slug, updatedAt: products.updatedAt })
			.from(products),
	]);

	const categoryEntries: MetadataRoute.Sitemap = categoryRows.map((c) => ({
		url: `${baseUrl}/shop?categoria=${encodeURIComponent(c.slug)}`,
		lastModified: c.updatedAt ?? new Date(),
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	const productEntries: MetadataRoute.Sitemap = productRows.map((p) => ({
		url: `${baseUrl}/productos/${p.slug}`,
		lastModified: p.updatedAt ?? new Date(),
		changeFrequency: "weekly",
		priority: 0.9,
	}));

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/categorias`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/shop`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		...categoryEntries,
		...productEntries,
	];
}
