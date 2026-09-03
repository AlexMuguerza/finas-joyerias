"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { getAdminSession } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
import {
	deleteR2Object,
	getPresignedUploadUrl,
	makeObjectKey,
	randomCode,
} from "@/lib/server/r2";
import { categories, images, products } from "@/db/schema";

export type AdminActionState = {
	error?: string;
	fieldErrors?: Record<string, string>;
} | null;

const UNAUTHORIZED: AdminActionState = { error: "No autorizado" };

function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 120);
}

function isUniqueViolation(error: unknown): boolean {
	return error instanceof Error && /duplicate key value|unique constraint/i.test(error.message);
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

	const slug = slugify(slugInput || name);
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
	// Key de la imagen ya subida por el navegador con la URL prefirmada.
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };
	if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
		return { fieldErrors: { price: "Ingresa un precio válido" } };
	}
	if (!categoryId) return { fieldErrors: { categoryId: "Selecciona una categoría" } };

	const slug = slugify(slugInput || name);

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
		await getDb().insert(products).values({
			id: v7(),
			name,
			slug,
			description: description || null,
			price,
			categoryId,
			imageId,
		});
	} catch (error) {
		if (imageId) await cleanupImage(imageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe un producto con ese nombre o slug" };
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
	// Key de una imagen nueva ya subida por el navegador (solo si se reemplazó).
	const imageKey = String(formData.get("imageKey") ?? "").trim();

	if (!id) return { error: "Producto inválido" };
	if (!name) return { fieldErrors: { name: "El nombre es obligatorio" } };
	if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
		return { fieldErrors: { price: "Ingresa un precio válido" } };
	}
	if (!categoryId) return { fieldErrors: { categoryId: "Selecciona una categoría" } };

	const slug = slugify(slugInput || name);
	const db = getDb();

	const [existing] = await db
		.select({ imageId: products.imageId })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

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
				categoryId,
				imageId: newImageId ?? existing?.imageId ?? null,
			})
			.where(eq(products.id, id));
	} catch (error) {
		if (newImageId) await cleanupImage(newImageId);
		if (isUniqueViolation(error)) {
			return { error: "Ya existe un producto con ese nombre o slug" };
		}
		return { error: "No se pudo actualizar el producto" };
	}

	// 3) Si se reemplazó la imagen, limpiar la anterior (registro + R2).
	if (newImageId && existing?.imageId) {
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

	const slug = slugify(slugInput || name);

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

	const slug = slugify(slugInput || name);
	const db = getDb();

	const [existing] = await db
		.select({ imageId: categories.imageId })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);

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
				imageId: newImageId ?? existing?.imageId ?? null,
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
	if (newImageId && existing?.imageId) {
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
