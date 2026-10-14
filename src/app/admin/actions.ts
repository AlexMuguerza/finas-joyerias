"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { getAdminSession } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
import {
	deleteR2Object,
	getPresignedUploadUrl,
	makeObjectKey,
	randomCode,
} from "@/lib/server/r2";
import { categories, images, products, user } from "@/db/schema";
import { generateSku, isValidSku } from "@/lib/server/sku";
import { EMPTY_SLUG_ERROR, resolveSlug } from "@/lib/slug";

export type AdminActionState = {
	error?: string;
	fieldErrors?: Record<string, string>;
} | null;

const UNAUTHORIZED: AdminActionState = { error: "No autorizado" };

/**
 * Número total de administradores, contado en el servidor.
 *
 * `UsersTable` solo carga los primeros 100 usuarios, así que el cliente no
 * puede decidir de forma fiable si el usuario que va a degradar es el último
 * admin: con más de 100 cuentas vería "solo aparece uno" cuando en realidad
 * hay más. El conteo real lo hace el servidor y se pasa como prop.
 */
export async function countAdminUsers(): Promise<number> {
	if (!(await getAdminSession())) return 0;
	const [row] = await getDb()
		.select({ total: count() })
		.from(user)
		.where(eq(user.role, "admin"));
	return row?.total ?? 0;
}

function isUniqueViolation(error: unknown): boolean {
	return error instanceof Error && /duplicate key value|unique constraint/i.test(error.message);
}

/**
 * ¿La violación de unicidad la provocó la columna `sku`?
 *
 * El mismo error salta por slug o nombre duplicados, y en ese caso reintentar
 * con otro SKU no arregla nada: solo gasta los 5 intentos. Postgres incluye el
 * constraint y la columna en el mensaje, así que se puede discriminar.
 */
function isSkuUniqueViolation(error: unknown): boolean {
	if (!isUniqueViolation(error)) return false;
	const message = (error as Error).message.toLowerCase();
	return message.includes("sku");
}

export type PresignResult =
	| { presignedUrl: string; key: string; slug: string }
	| { error: string };

/**
 * Genera una URL prefirmada para que el navegador suba la imagen
 * directamente a R2.
 *
 * La key se genera en el servidor con el formato `<prefix>/<slug>.<code>.<ext>`
 * donde `<code>` es un código alfanumérico de 4 caracteres para versionar.
 */
async function createUploadUrl(
	prefix: "categories" | "products",
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	if (!(await getAdminSession())) return { error: "No autorizado" };

	if (!name || !fileName || !contentType.startsWith("image/")) {
		return { error: "El archivo debe ser una imagen" };
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { error: EMPTY_SLUG_ERROR };
	}

	const key = makeObjectKey(prefix, slug, randomCode(4), fileName);
	try {
		const presignedUrl = await getPresignedUploadUrl({ key });
		return { presignedUrl, key, slug };
	} catch (error) {
		console.error("Error al generar URL prefirmada:", error);
		return { error: "No se pudo generar la URL de subida" };
	}
}

export async function getCategoryUploadUrl(
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	return createUploadUrl("categories", name, slugInput, fileName, contentType);
}

export async function getProductUploadUrl(
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	return createUploadUrl("products", name, slugInput, fileName, contentType);
}

const SKU_MAX_ATTEMPTS = 5;

/**
 * Genera un SKU candidato a partir del nombre de la categoría.
 *
 * Esto es solo una optimización para no gastar un reintento en el caso
 * normal: la unicidad real la garantiza el constraint `products_sku_unique`.
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

type ProductInsert = typeof products.$inferInsert;

/**
 * Inserta el producto. Si el SKU es autogenerado y choca con el constraint
 * único, regenera y reintenta hasta `SKU_MAX_ATTEMPTS` veces.
 *
 * Esto es lo que hace real el contrato de `generateSku` ("quien llama debe
 * reintentar con un nuevo SKU ante colisión"): antes, la colisión se traducía
 * en un error de "Ya existe un producto con ese nombre, slug o SKU" que el
 * admin no podía interpretar. No hace falta transacción porque cada INSERT
 * fallido se revierte por completo y no deja estado parcial (patrón de
 * concurrencia optimista: el constraint decide el ganador de cada carrera).
 *
 * Un SKU escrito a mano nunca se reintenta: si está duplicado, es un error
 * real que hay que reportar tal cual.
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

/**
 * Si el registro se eliminó con imagen, borra la fila en `images` y el objeto
 * en R2. Mejor esfuerzo: los fallos de R2 no rompen la acción.
 */
async function cleanupImage(imageId: string | null | undefined): Promise<void> {
	if (!imageId) return;
	const db = getDb();
	const [image] = await db
		.select({ key: images.key })
		.from(images)
		.where(eq(images.id, imageId))
		.limit(1);
	await db.delete(images).where(eq(images.id, imageId));
	if (image?.key) {
		await deleteR2Object(image.key).catch(() => {});
	}
}

// ============================================
// Productos
// ============================================

export async function createProduct(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
	if (!(await getAdminSession())) return UNAUTHORIZED;

	const name = String(formData.get("name") ?? "").trim();
	const slugInput = String(formData.get("slug") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	const price = String(formData.get("price") ?? "").trim();
	const categoryId = String(formData.get("categoryId") ?? "").trim();
	// SKU opcional: si no viene, se autogenera desde la categoría.
	const skuInput = String(formData.get("sku") ?? "").trim().toUpperCase();
	// Key de la imagen ya subida por el navegador con la URL prefirmada.
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };
	if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
		return { fieldErrors: { price: "Ingresa un precio válido" } };
	}
	if (!categoryId) return { fieldErrors: { categoryId: "Selecciona una categoría" } };
	if (skuInput && !isValidSku(skuInput)) {
		return { fieldErrors: { sku: "El SKU debe tener el formato AAA-9999 (3 caracteres, guion, 4 caracteres)" } };
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	// 1) Registrar la imagen en `images` (la subida a R2 ya ocurrió).
	let imageId: string | null = null;
	if (imageKey) {
		imageId = v7();
		try {
			await getDb().insert(images).values({ id: imageId, key: imageKey });
		} catch (error) {
			// La imagen quedó huérfana en R2: eliminarla y fallar sin crear nada.
			await deleteR2Object(imageKey).catch(() => {});
			console.error("Error al registrar imagen:", error);
			return { error: "No se pudo registrar la imagen" };
		}
	}

	// 2) Crear el producto; si falla, deshacer todo (imagen en BD y en R2).
	try {
		await insertProductWithSkuRetry({
			id: v7(),
			name,
			slug,
			description: description || null,
			price,
			sku: skuInput || null,
			categoryId,
			imageId,
		});
	} catch (error) {
		if (imageId) await cleanupImage(imageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe un producto con ese nombre, slug o SKU" };
		}
		return { error: "No se pudo crear el producto" };
	}

	revalidatePath("/admin/productos");
	redirect("/admin/productos");
}

export async function updateProduct(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
	if (!(await getAdminSession())) return UNAUTHORIZED;

	const id = String(formData.get("id") ?? "").trim();
	const name = String(formData.get("name") ?? "").trim();
	const slugInput = String(formData.get("slug") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	const price = String(formData.get("price") ?? "").trim();
	const categoryId = String(formData.get("categoryId") ?? "").trim();
	// SKU editable; obligatorio en edición (todo producto ya tiene uno).
	const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
	// Key de una imagen nueva ya subida por el navegador (solo si se reemplazó).
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!id) return { error: "Producto inválido" };
	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };
	if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
		return { fieldErrors: { price: "Ingresa un precio válido" } };
	}
	if (!categoryId) return { fieldErrors: { categoryId: "Selecciona una categoría" } };
	// El SKU solo se valida si viene informado: `products.sku` admite NULL
	// (columna nullable) y hay registros previos a la migración que lo tienen.
	// Si se envía vacío, se conserva el SKU ya generado en vez de fallar.
	if (sku && !isValidSku(sku)) {
		return { fieldErrors: { sku: "El SKU debe tener el formato AAA-9999 (3 caracteres, guion, 4 caracteres)" } };
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	const db = getDb();

	const [existing] = await db
		.select({ imageId: products.imageId, sku: products.sku })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

	// Sin `returning`, un UPDATE sobre un id inexistente no da error: afecta 0
	// filas y la acción reportaba éxito. Con `returning` comprobamos que la
	// fila realmente existía y existía antes de subir la imagen nueva.
	if (!existing) {
		return { error: "El producto ya no existe. Recarga la página." };
	}

	// 1) Si hay imagen nueva, registrarla en `images`.
	let newImageId: string | null = null;
	if (imageKey) {
		newImageId = v7();
		try {
			await db.insert(images).values({ id: newImageId, key: imageKey });
		} catch (error) {
			// La imagen quedó huérfana en R2: eliminarla y fallar sin cambiar nada.
			await deleteR2Object(imageKey).catch(() => {});
			console.error("Error al registrar imagen:", error);
			return { error: "No se pudo registrar la imagen" };
		}
	}

	// 2) Actualizar el producto; si falla, deshacer la imagen nueva.
	try {
		await db
			.update(products)
			.set({
				name,
				slug,
				description: description || null,
				price,
				sku: sku || existing.sku,
				categoryId,
				imageId: newImageId ?? existing.imageId ?? null,
			})
			.where(eq(products.id, id));
	} catch (error) {
		if (newImageId) await cleanupImage(newImageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe un producto con ese nombre, slug o SKU" };
		}
		return { error: "No se pudo actualizar el producto" };
	}

	// 3) Si se reemplazó la imagen, limpiar la anterior (registro + R2).
	if (newImageId && existing.imageId) {
		await cleanupImage(existing.imageId);
	}

	revalidatePath("/admin/productos");
	redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData): Promise<void> {
	if (!(await getAdminSession())) return;
	const id = String(formData.get("id") ?? "").trim();
	if (!id) return;
	const db = getDb();
	const [product] = await db
		.select({ imageId: products.imageId })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);
	await db.delete(products).where(eq(products.id, id));
	await cleanupImage(product?.imageId);
	revalidatePath("/admin/productos");
}

// ============================================
// Categorías
// ============================================

export async function createCategory(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
	if (!(await getAdminSession())) return UNAUTHORIZED;

	const name = String(formData.get("name") ?? "").trim();
	const slugInput = String(formData.get("slug") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	// Key de la imagen ya subida por el navegador con la URL prefirmada.
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	// 1) Registrar la imagen en la tabla `images` (la subida a R2 ya ocurrió).
	let imageId: string | null = null;
	if (imageKey) {
		imageId = v7();
		try {
			await getDb().insert(images).values({ id: imageId, key: imageKey });
		} catch (error) {
			// La imagen quedó huérfana en R2: eliminarla y fallar sin crear nada.
			await deleteR2Object(imageKey).catch(() => {});
			console.error("Error al registrar imagen:", error);
			return { error: "No se pudo registrar la imagen" };
		}
	}

	// 2) Crear la categoría; si falla, deshacer todo (imagen en BD y en R2).
	try {
		await getDb().insert(categories).values({
			id: v7(),
			name,
			slug,
			description: description || null,
			imageId,
		});
	} catch (error) {
		if (imageId) await cleanupImage(imageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe una categoría con ese nombre o slug" };
		}
		return { error: "No se pudo crear la categoría" };
	}

	revalidatePath("/admin/categorias");
	redirect("/admin/categorias");
}

export async function updateCategory(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
	if (!(await getAdminSession())) return UNAUTHORIZED;

	const id = String(formData.get("id") ?? "").trim();
	const name = String(formData.get("name") ?? "").trim();
	const slugInput = String(formData.get("slug") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	// Key de una imagen nueva ya subida por el navegador (solo si se reemplazó).
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!id) return { error: "Categoría inválida" };
	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	const db = getDb();

	const [existing] = await db
		.select({ imageId: categories.imageId })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);

	// Ver `updateProduct`: un UPDATE sin `returning` sobre un id inexistente
	// no falla, y la acción terminaba reportando un guardado exitoso.
	if (!existing) {
		return { error: "La categoría ya no existe. Recarga la página." };
	}

	// 1) Si hay imagen nueva, registrarla en `images`.
	let newImageId: string | null = null;
	if (imageKey) {
		newImageId = v7();
		try {
			await db.insert(images).values({ id: newImageId, key: imageKey });
		} catch (error) {
			// La imagen quedó huérfana en R2: eliminarla y fallar sin cambiar nada.
			await deleteR2Object(imageKey).catch(() => {});
			console.error("Error al registrar imagen:", error);
			return { error: "No se pudo registrar la imagen" };
		}
	}

	// 2) Actualizar la categoría; si falla, deshacer la imagen nueva.
	try {
		await db
			.update(categories)
			.set({
				name,
				slug,
				description: description || null,
				imageId: newImageId ?? existing.imageId ?? null,
			})
			.where(eq(categories.id, id));
	} catch (error) {
		if (newImageId) await cleanupImage(newImageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe una categoría con ese nombre o slug" };
		}
		return { error: "No se pudo actualizar la categoría" };
	}

	// 3) Si se reemplazó la imagen, limpiar la anterior (registro + R2).
	if (newImageId && existing.imageId) {
		await cleanupImage(existing.imageId);
	}

	revalidatePath("/admin/categorias");
	redirect("/admin/categorias");
}

export async function deleteCategory(formData: FormData): Promise<void> {
	if (!(await getAdminSession())) return;
	const id = String(formData.get("id") ?? "").trim();
	if (!id) return;
	const db = getDb();
	const [category] = await db
		.select({ imageId: categories.imageId })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);

	// Las imágenes de los productos de la categoría también se limpian:
	// el borrado en cascada elimina los productos pero deja sus imágenes.
	const productImageIds = await db
		.select({ imageId: products.imageId })
		.from(products)
		.where(eq(products.categoryId, id));

	await db.delete(categories).where(eq(categories.id, id));
	await cleanupImage(category?.imageId);
	for (const row of productImageIds) {
		await cleanupImage(row.imageId);
	}
	revalidatePath("/admin/categorias");
	revalidatePath("/admin/productos");
}
