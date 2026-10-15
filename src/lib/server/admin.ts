// Capa de acceso a datos del panel (escrituras + autorización).
// Solo servidor: depende de la sesión, de Neon y de R2.
import "server-only";

import { count, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { getDb } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/session";
import {
	deleteR2Object,
	getPresignedUploadUrl,
	makeObjectKey,
	randomCode,
} from "@/lib/server/r2";
import { categories, images, products, user } from "@/db/schema";
import { generateSku } from "@/lib/server/sku";

/**
 * Resultado de una mutación.
 *
 * Se usa un resultado discriminado en lugar de excepciones porque el
 * llamador necesita distinguir causas que llevan mensajes distintos: una
 * violación de unicidad ("ya existe un producto con ese nombre") no es un
 * fallo genérico, y el admin tiene que poder corregirla. Con `throw` +
 * `catch` en cada acción, ese mapeo quedaba duplicado ocho veces.
 */
export type MutationResult =
	| { ok: true }
	| {
			ok: false;
			reason:
				| "unauthorized"
				| "not-found"
				| "duplicate"
				| "image"
				| "unknown";
	  };

const OK: MutationResult = { ok: true };

const fail = (
	reason: Extract<MutationResult, { ok: false }>["reason"]
): MutationResult => ({ ok: false, reason });

/**
 * Puerta de autorización de todo el panel.
 *
 * Antes cada acción repetía `if (!(await getAdminSession())) return
 * UNAUTHORIZED;`, ocho veces. Concentrarlo aquí sigue el patrón de la guía de
 * seguridad de Next.js: la comprobación vive junto al dato, no en el borde.
 */
async function requireAdmin(): Promise<boolean> {
	return (await getAdminSession()) != null;
}

// ============================================
// Utilidades de error
// ============================================

function isUniqueViolation(error: unknown): boolean {
	return (
		error instanceof Error &&
		/duplicate key value|unique constraint/i.test(error.message)
	);
}

/**
 * El `insert` de producto puede fallar por colisión de SKU (constraint
 * `products_sku_unique`) y eso es reintentable, a diferencia de una colisión
 * de slug o nombre, que es un error real del admin.
 */
function isSkuUniqueViolation(error: unknown): boolean {
	return (
		error instanceof Error &&
		/products_sku_unique/i.test(error.message)
	);
}

// ============================================
// Imágenes
// ============================================

/**
 * Registra una imagen ya subida a R2 por el navegador.
 *
 * Devuelve el id nuevo, o `"image-error"` si la fila no se pudo insertar. El
 * objeto de R2 ya está subido en ese punto, así que quien llama debe borrarlo
 * para no dejar huérfano.
 */
async function insertImageRow(
	imageKey: string
): Promise<string | "image-error"> {
	try {
		// `v7` y no `crypto.randomUUID()`: los ids deben seguir siendo
		// ordenables por tiempo, que es lo que espera el resto del esquema.
		const id = v7();
		await getDb().insert(images).values({ id, key: imageKey });
		return id;
	} catch (error) {
		console.error("Error al registrar imagen:", error);
		return "image-error";
	}
}

/**
 * Borra la fila de `images` y el objeto de R2.
 *
 * Mejor esfuerzo: un fallo al borrar en R2 no debe tumbar la acción, porque la
 * fila en SQL sí se pudo eliminar y el usuario ya recibió el éxito.
 */
async function removeImage(imageId: string | null | undefined): Promise<void> {
	if (!imageId) return;

	const [image] = await getDb()
		.select({ key: images.key })
		.from(images)
		.where(eq(images.id, imageId))
		.limit(1);

	await getDb().delete(images).where(eq(images.id, imageId));

	if (image?.key) {
		await deleteR2Object(image.key).catch(() => {});
	}
}

// ============================================
// Autorización
// ============================================

/**
 * Número total de administradores, contado en el servidor.
 *
 * `UsersTable` solo carga una página de usuarios, así que el cliente no puede
 * decidir de forma fiable si quien va a degradar es el último admin. El
 * recuento real lo hace el servidor y se pasa como prop.
 */
export async function countAdminUsers(): Promise<number> {
	if (!(await getAdminSession())) return 0;

	const [row] = await getDb()
		.select({ total: count() })
		.from(user)
		.where(eq(user.role, "admin"));

	return row?.total ?? 0;
}

/**
 * URL prefirmada para subir una imagen de R2 desde el navegador.
 *
 * El resultado distingue "no autorizado" de "R2 falló": colapsarlos en `null`
 * haría que un fallo de infraestructura se leera al admin como un problema de
 * permisos, que es justo la clase de mentira que hay que evitar en un panel.
 */
export async function createUploadUrl(
	prefix: "categories" | "products",
	slug: string,
	fileName: string
): Promise<
	| { ok: true; presignedUrl: string; key: string }
	| { ok: false; reason: "unauthorized" | "presign" }
> {
	if (!(await requireAdmin())) return { ok: false, reason: "unauthorized" };

	// El código aleatorio versiona el objeto para no pisar la imagen anterior.
	const key = makeObjectKey(prefix, slug, randomCode(4), fileName);

	try {
		const presignedUrl = await getPresignedUploadUrl({ key });
		return { ok: true, presignedUrl, key };
	} catch (error) {
		console.error("Error al generar URL prefirmada:", error);
		return { ok: false, reason: "presign" };
	}
}

// ============================================
// Productos
// ============================================

const SKU_MAX_ATTEMPTS = 5;

type ProductInsert = typeof products.$inferInsert;

/**
 * Genera un SKU candidato a partir del nombre de la categoría.
 *
 * Es una optimización para no gastar un reintento en el caso normal: la
 * unicidad real la garantiza el constraint, no esta consulta.
 */
async function generateAvailableSku(categoryId: string): Promise<string> {
	const db = getDb();
	const [category] = await db
		.select({ name: categories.name })
		.from(categories)
		.where(eq(categories.id, categoryId))
		.limit(1);
	const categoryName = category?.name ?? "";

	let lastError: unknown;
	for (let attempt = 0; attempt < SKU_MAX_ATTEMPTS; attempt++) {
		const sku = generateSku(categoryName);
		const [taken] = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.sku, sku))
			.limit(1);

		if (!taken) return sku;
		lastError = new Error(`SKU duplicado: ${sku}`);
	}
	throw lastError ?? new Error("No se pudo generar un SKU único");
}

/**
 * Inserta el producto resolviendo el SKU autogenerado, y reintentando si
 * choca con el constraint único.
 *
 * Esto es lo que hace real el contrato de `generateSku` ("quien llama debe
 * reintentar con un nuevo SKU ante colisión"): antes la colisión se traducía
 * en un error de "Ya existe un producto con ese nombre, slug o SKU" que el
 * admin no podía interpretar.
 *
 * No hace falta transacción porque cada INSERT fallido se revierte por
 * completo y no deja estado parcial (concurrencia optimista: el constraint
 * decide el ganador de cada carrera).
 *
 * Un SKU escrito a mano nunca se reintenta: si está duplicado, es un error
 * real que hay que reportar tal cual.
 *
 * `sku` es NOT NULL en el schema: el `null` de la entrada significa
 * "autogenera uno", nunca "escribe null".
 */
async function insertProductWithSkuRetry(
	values: Omit<ProductInsert, "sku"> & { sku?: string | null }
): Promise<void> {
	const db = getDb();
	const manualSku = values.sku ? values.sku : null;
	const maxAttempts = manualSku ? 1 : SKU_MAX_ATTEMPTS;
	let lastError: unknown;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const sku = manualSku ?? (await generateAvailableSku(values.categoryId));
		try {
			await db.insert(products).values({ ...values, sku });
			return;
		} catch (error) {
			lastError = error;
			if (manualSku || !isSkuUniqueViolation(error)) throw error;
			console.warn(
				`[sku] Colisión en "${sku}", reintentando (${attempt + 1}/${maxAttempts})`
			);
		}
	}
	throw lastError;
}

export async function createProduct(
	values: Omit<ProductInsert, "sku" | "imageId"> & {
		sku?: string | null;
		imageKey?: string;
	}
): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	// 1) Registrar la imagen (la subida a R2 ya ocurrió).
	let imageId: string | null = null;
	if (values.imageKey) {
		const inserted = await insertImageRow(values.imageKey);
		if (inserted === "image-error") {
			// La imagen quedó huérfana en R2: eliminarla y no crear nada.
			await deleteR2Object(values.imageKey).catch(() => {});
			return fail("image");
		}
		imageId = inserted;
	}

	// 2) Crear el producto; si falla, deshacer la imagen.
	try {
		await insertProductWithSkuRetry({ ...values, imageId });
		return OK;
	} catch (error) {
		if (imageId) await removeImage(imageId);
		return isUniqueViolation(error) ? fail("duplicate") : fail("unknown");
	}
}

/**
 * Actualiza el producto.
 *
 * Se comprueba la existencia con un SELECT antes del UPDATE porque un UPDATE
 * sobre un id inexistente no da error: afecta 0 filas y la acción reportaba
 * éxito. Antes el comentario de aquí mencionaba `returning`, pero lo que había
 * era esta consulta previa; el comportamiento es el que importa.
 */
export async function updateProduct(
	id: string,
	values: Omit<ProductInsert, "id" | "imageId"> & {
		sku?: string;
		imageKey?: string;
	}
): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	const db = getDb();
	const [existing] = await db
		.select({ imageId: products.imageId, sku: products.sku })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

	if (!existing) return fail("not-found");

	// 1) Si hay imagen nueva, registrarla.
	let newImageId: string | null = null;
	if (values.imageKey) {
		const inserted = await insertImageRow(values.imageKey);
		if (inserted === "image-error") {
			await deleteR2Object(values.imageKey).catch(() => {});
			return fail("image");
		}
		newImageId = inserted;
	}

	// 2) Actualizar; si falla, deshacer la imagen nueva.
	try {
		await db
			.update(products)
			.set({
				name: values.name,
				slug: values.slug,
				description: values.description ?? null,
				price: values.price,
				// El campo vacío en la edición conserva el SKU existente: la
				// columna es NOT NULL, pero no obliga a reescribirlo cada vez.
				sku: values.sku || existing.sku,
				categoryId: values.categoryId,
				imageId: newImageId ?? existing.imageId ?? null,
			})
			.where(eq(products.id, id));
	} catch (error) {
		if (newImageId) await removeImage(newImageId);
		return isUniqueViolation(error) ? fail("duplicate") : fail("unknown");
	}

	// 3) Si se reemplazó la imagen, limpiar la anterior (registro + R2).
	if (newImageId && existing.imageId) {
		await removeImage(existing.imageId);
	}

	return OK;
}

export async function deleteProduct(id: string): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	const db = getDb();
	const [product] = await db
		.select({ imageId: products.imageId })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

	await db.delete(products).where(eq(products.id, id));
	await removeImage(product?.imageId);

	return OK;
}

// ============================================
// Categorías
// ============================================

type CategoryInsert = typeof categories.$inferInsert;

export async function createCategory(
	values: Omit<CategoryInsert, "imageId"> & { imageKey?: string }
): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	let imageId: string | null = null;
	if (values.imageKey) {
		const inserted = await insertImageRow(values.imageKey);
		if (inserted === "image-error") {
			await deleteR2Object(values.imageKey).catch(() => {});
			return fail("image");
		}
		imageId = inserted;
	}

	try {
		await getDb().insert(categories).values({ ...values, imageId });
		return OK;
	} catch (error) {
		if (imageId) await removeImage(imageId);
		return isUniqueViolation(error) ? fail("duplicate") : fail("unknown");
	}
}

export async function updateCategory(
	id: string,
	values: Omit<CategoryInsert, "id" | "imageId"> & { imageKey?: string }
): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	const db = getDb();
	const [existing] = await db
		.select({ imageId: categories.imageId })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);

	if (!existing) return fail("not-found");

	let newImageId: string | null = null;
	if (values.imageKey) {
		const inserted = await insertImageRow(values.imageKey);
		if (inserted === "image-error") {
			await deleteR2Object(values.imageKey).catch(() => {});
			return fail("image");
		}
		newImageId = inserted;
	}

	try {
		await db
			.update(categories)
			.set({
				name: values.name,
				slug: values.slug,
				description: values.description ?? null,
				imageId: newImageId ?? existing.imageId ?? null,
			})
			.where(eq(categories.id, id));
	} catch (error) {
		if (newImageId) await removeImage(newImageId);
		return isUniqueViolation(error) ? fail("duplicate") : fail("unknown");
	}

	if (newImageId && existing.imageId) {
		await removeImage(existing.imageId);
	}

	return OK;
}

export async function deleteCategory(id: string): Promise<MutationResult> {
	if (!(await requireAdmin())) return fail("unauthorized");

	const db = getDb();
	const [category] = await db
		.select({ imageId: categories.imageId })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);

	// Las imágenes de los productos de la categoría también se limpian: el
	// borrado en cascada elimina los productos pero deja sus imágenes.
	const productImageIds = await db
		.select({ imageId: products.imageId })
		.from(products)
		.where(eq(products.categoryId, id));

	await db.delete(categories).where(eq(categories.id, id));

	await removeImage(category?.imageId);
	for (const row of productImageIds) {
		await removeImage(row.imageId);
	}

	return OK;
}