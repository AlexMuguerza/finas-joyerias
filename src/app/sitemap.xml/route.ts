import { getDb } from "@/lib/server/db";
import { SITE_ORIGIN } from "@/lib/site";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

const BASE_URL = SITE_ORIGIN;

function xmlDate(date: Date): string {
	return date.toISOString();
}

/**
 * Sitemap dinámico servido como Route Handler (/sitemap.xml).
 *
 * A diferencia del archivo especial `sitemap.ts` (que Next prerenderiza en
 * `next build` y por eso fallaba al llamar `getCloudflareContext`), este
 * handler corre en cada request dentro del worker: consulta la BD para
 * listar categorías y productos reales. Se deja cacheable en el edge.
 */
export async function GET() {
	const entries: {
		url: string;
		lastModified: string;
		changeFrequency: string;
		priority: string;
	}[] = [
		{
			url: BASE_URL,
			lastModified: xmlDate(new Date()),
			changeFrequency: "weekly",
			priority: "1.0",
		},
		{
			url: `${BASE_URL}/categorias`,
			lastModified: xmlDate(new Date()),
			changeFrequency: "weekly",
			priority: "0.9",
		},
		{
			url: `${BASE_URL}/shop`,
			lastModified: xmlDate(new Date()),
			changeFrequency: "daily",
			priority: "0.9",
		},
	];

	// Dinámicas: si la BD falla, el sitemap base sigue respondiendo.
	//
	// Nota: no se emiten las variantes `/shop?categoria=<slug>`. La página de
	// catálogo declara `alternates.canonical` a `/shop`, así que Google
	// canonicaliza todas las variantes a la misma URL y las entradas con query
	// solo serían ruido en Search Console. Si algún día se decide indexar cada
	// categoría por separado, hay que quitar ese canonical y usar rutas
	// propias (`/categorias/<slug>`) en lugar de query params.
	try {
		const db = getDb();
		const productRows = await db
			.select({ slug: products.slug, updatedAt: products.updatedAt })
			.from(products);

		for (const p of productRows) {
			entries.push({
				url: `${BASE_URL}/productos/${p.slug}`,
				lastModified: xmlDate(p.updatedAt ?? new Date()),
				changeFrequency: "weekly",
				priority: "0.9",
			});
		}
	} catch (error) {
		console.error("[sitemap] No se pudieron cargar los productos:", error);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
