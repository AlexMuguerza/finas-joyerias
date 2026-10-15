// Solo servidor: lee el binding R2 y las credenciales S3 del contexto de
// Cloudflare, que no existen en el navegador.
import "server-only";

import { AwsClient } from "aws4fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let cachedClient: AwsClient | null = null;

/**
 * Al worker desplegado le faltan identificadores de R2.
 *
 * No es lo mismo que "R2 respondió mal": una cosa se arregla con
 * `wrangler secret put`, la otra mirando el error de red. Se distingue con un
 * tipo propio porque el síntoma en el panel —una subida que no arranca— no dice
 * ninguna de las dos cosas.
 */
export class MissingR2ConfigError extends Error {
	readonly missing: string[];

	constructor(missing: string[]) {
		super(`Faltan variables de entorno de R2: ${missing.join(", ")}`);
		this.name = "MissingR2ConfigError";
		this.missing = missing;
	}
}

type R2VarName =
	| "CLOUDFLARE_ACCOUNT_ID"
	| "R2_ACCESS_KEY_ID"
	| "R2_SECRET_ACCESS_KEY"
	| "R2_BUCKET_NAME";

function getR2Env() {
	const env = getCloudflareContext().env;
	const missing: R2VarName[] = [];

	// Se listan todas las que faltan en vez de fallar en la primera: el error
	// se lee en un log del worker y reparar de una en una cuesta un deploy cada
	// intento.
	const requireVar = (name: R2VarName): string => {
		const value = env[name];
		if (!value) missing.push(name);
		return value ?? "";
	};

	const accountId = requireVar("CLOUDFLARE_ACCOUNT_ID");
	const accessKeyId = requireVar("R2_ACCESS_KEY_ID");
	const secretAccessKey = requireVar("R2_SECRET_ACCESS_KEY");
	const bucket = requireVar("R2_BUCKET_NAME");

	if (missing.length > 0) throw new MissingR2ConfigError(missing);

	return { accountId, accessKeyId, secretAccessKey, bucket };
}

function getR2Client(): AwsClient {
	if (!cachedClient) {
		const env = getR2Env();
		cachedClient = new AwsClient({
			accessKeyId: env.accessKeyId,
			secretAccessKey: env.secretAccessKey,
			service: "s3",
			region: "auto",
		});
	}
	return cachedClient;
}

function objectUrl(key: string): string {
	const env = getR2Env();
	return `https://${env.accountId}.r2.cloudflarestorage.com/${env.bucket}/${key}`;
}

/**
 * URL prefirmada para que el navegador suba la imagen directamente a R2.
 *
 * Importante: NO se firma Content-Type (aws4fetch solo firma el host con
 * `signQuery`); el navegador envía el Content-Type automáticamente y R2 lo
 * acepta sin validarlo contra la firma.
 */
export async function getPresignedUploadUrl(params: {
	key: string;
	expiresIn?: number;
}): Promise<string> {
	const url = `${objectUrl(params.key)}?X-Amz-Expires=${params.expiresIn ?? 600}`;
	const signed = await getR2Client().sign(url, {
		method: "PUT",
		aws: { signQuery: true },
	});
	return signed.url.toString();
}

/**
 * True si el entorno actual expone credenciales S3 del bucket remoto.
 * En `next dev` (y previews locales de wrangler) vienen de `.dev.vars`;
 * en el worker desplegado hay que declararlas también (`vars` + `secret put`).
 *
 * Cuando faltan, `fetchR2Object` cae al binding `R2` y sigue leyendo; lo que
 * se rompe es la subida, que solo se puede firmar contra la API S3.
 */
function hasS3Credentials(): boolean {
	const env = getCloudflareContext().env;
	return Boolean(
		env.CLOUDFLARE_ACCOUNT_ID &&
			env.R2_ACCESS_KEY_ID &&
			env.R2_SECRET_ACCESS_KEY &&
			env.R2_BUCKET_NAME
	);
}

const MIME_BY_EXTENSION: Record<string, string> = {
	avif: "image/avif",
	gif: "image/gif",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	png: "image/png",
	svg: "image/svg+xml",
	webp: "image/webp",
};

function contentTypeFromKey(key: string): string {
	const extension = key.split(".").pop()?.toLowerCase() ?? "";
	return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

/**
 * Trae el objeto desde R2 y lo devuelve como Response.
 *
 * El binding `R2` apunta al bucket real solo en el worker desplegado. En
 * `next dev` (opennext dev proxy) y en previews locales, el binding es de
 * Miniflare y apunta a storage local vacío — las imágenes se suben al bucket
 * remoto con URLs prefirmadas. Por eso, si hay credenciales S3 disponibles
 * (`.dev.vars`), se lee el bucket remoto con una petición firmada; el binding
 * se usa únicamente cuando no hay credenciales (worker desplegado).
 */
export async function fetchR2Object(key: string): Promise<Response> {
	const bucket = getCloudflareContext().env.R2;
	if (bucket && !hasS3Credentials()) {
		const object = await bucket.get(key);
		if (!object) {
			return new Response("No encontrado", { status: 404 });
		}
		const headers = new Headers();
		headers.set(
			"Content-Type",
			object.httpMetadata?.contentType ?? contentTypeFromKey(key)
		);
		headers.set("ETag", object.httpEtag);
		return new Response(object.body, { headers });
	}

	return getR2Client().fetch(objectUrl(key), { method: "GET" });
}

/**
 * Elimina un objeto de R2 (mejor esfuerzo; usado para limpiar en caso de
 * error). Misma lógica que `fetchR2Object`: binding solo en el worker
 * desplegado (sin credenciales S3); en dev/preview se firma contra el
 * bucket remoto, que es donde realmente se subió el objeto.
 */
export async function deleteR2Object(key: string): Promise<void> {
	const bucket = getCloudflareContext().env.R2;
	if (bucket && !hasS3Credentials()) {
		await bucket.delete(key);
		return;
	}
	await getR2Client().fetch(objectUrl(key), { method: "DELETE" });
}

const EXTENSION_PATTERN = /^[a-z0-9]{1,5}$/;
const CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Código alfanumérico corto para versionar la imagen (por defecto 4 caracteres).
 */
export function randomCode(length = 4): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(
		bytes,
		(b) => CODE_CHARS[b % CODE_CHARS.length]
	).join("");
}

/**
 * Genera la key del objeto en R2: `<prefix>/<slug>.<code>.<ext>`,
 * p. ej. `categories/anillos.4f2a.jpg`. El código permite versionar la
 * imagen sin colisionar en el bucket.
 */
export function makeObjectKey(
	prefix: string,
	slug: string,
	code: string,
	fileName: string
): string {
	const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
	const safeExtension =
		extension && EXTENSION_PATTERN.test(extension) ? extension : "bin";
	return `${prefix}/${slug}.${code}.${safeExtension}`;
}