import { fetchR2Object } from "@/lib/server/r2";

export const dynamic = "force-dynamic";

// El código de versión (`<slug>.<code>.<ext>`) es alfanumérico mixto,
// p. ej. `anillos.VHbY.png` → se permiten mayúsculas.
const OBJECT_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/.-]*$/;

/**
 * Rutas de traversal o vacías. El patrón de arriba las admitía (`products/../x`
 * encaja: los `/` y los `.` están permitidos). R2 es un namespace plano, así
 * que hoy no hay lectura fuera del bucket, pero no queremos depender de esa
 * suposición para proteger una ruta pública.
 */
const TRAVERSAL_PATTERN = /(^|\/)\.\.?(\/|$)/;

const MAX_KEY_LENGTH = 200;

/**
 * Sirve imágenes desde R2 a través del worker.
 *
 * El bucket no es público: en el worker (producción) se lee con el binding
 * `R2` (`fetchR2Object`), y Cloudflare cachea el objeto en el edge para no
 * consultar R2 en cada request. En `next dev` cae al fallback con firma S3.
 *
 * Las claves incluyen un código de versión (`categories/<slug>.<code>.<ext>`),
 * así que el caché puede ser inmutable sin riesgo de servir contenido viejo.
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ key: string[] }> }
) {
	const { key } = await params;
	const objectKey = key.join("/");

	if (
		!objectKey ||
		objectKey.length > MAX_KEY_LENGTH ||
		!OBJECT_KEY_PATTERN.test(objectKey) ||
		TRAVERSAL_PATTERN.test(objectKey)
	) {
		console.log("Clave inválida:", objectKey);
		return new Response("Clave inválida", { status: 400 });
	}

	// Cache del worker (Cloudflare Cache API). En `next dev` (Node) `caches`
	// no existe, así que se omite y siempre se consulta R2.
	const cache =
		typeof caches !== "undefined"
			? (caches as unknown as { default: Cache }).default
			: undefined;
	const cacheKey = new Request(request.url, { method: "GET" });
	const cached = cache ? await cache.match(cacheKey) : undefined;
	if (cached) return cached;

	const r2Response = await fetchR2Object(objectKey);
	if (!r2Response.ok) {
		return new Response("No encontrado", { status: 404 });
	}

	const headers = new Headers();
	const contentType = r2Response.headers.get("content-type");
	if (contentType) headers.set("Content-Type", contentType);
	const etag = r2Response.headers.get("etag");
	if (etag) headers.set("ETag", etag);
	// `immutable` es seguro porque la clave incluye el código de versión
	// (`<slug>.<code>.<ext>`): cambiar una imagen genera una clave nueva, así
	// que esta URL nunca debe volver a servir el objeto anterior. El TTL largo
	// saca partido de la caché del edge sin volver a pedir el objeto a R2.
	headers.set("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");

	const response = new Response(r2Response.body, { headers });

	if (cache) {
		await cache.put(cacheKey, response.clone());
	}

	return response;
}
