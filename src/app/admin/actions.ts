"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v7 } from "uuid";
import {
	countAdminUsers,
	createCategory as createCategoryRow,
	createProduct as createProductRow,
	createUploadUrl as createPresignedUpload,
	deleteCategory as deleteCategoryRow,
	deleteProduct as deleteProductRow,
	updateCategory as updateCategoryRow,
	updateProduct as updateProductRow,
	type MutationResult,
} from "@/lib/server/admin";
import { isValidSku } from "@/lib/server/sku";
import { EMPTY_SLUG_ERROR, resolveSlug } from "@/lib/slug";

export type AdminActionState = {
	error?: string;
	fieldErrors?: Record<string, string>;
} | null;

const UNAUTHORIZED: AdminActionState = { error: "No autorizado" };

export { countAdminUsers };

export type PresignResult =
	| { presignedUrl: string; key: string; slug: string }
	| { error: string };

/**
 * Traduce el resultado del DAL al mensaje que ve el admin.
 *
 * Antes cada acción repetía su propio `try/catch` con la misma estructura
 * (`isUniqueViolation` → "Ya existe...", resto → "No se pudo..."). Con el
 * resultado discriminado, el mapeo está en un solo sitio y añadir una causa
 * nueva no obliga a tocar ocho acciones.
 */
function toState(
	result: MutationResult,
	duplicateMessage: string,
	genericMessage: string,
	notFoundMessage?: string
): AdminActionState {
	if (result.ok) return null;

	switch (result.reason) {
		case "unauthorized":
			return UNAUTHORIZED;
		case "duplicate":
			return { error: duplicateMessage };
		case "not-found":
			return { error: notFoundMessage ?? "El registro ya no existe. Recarga la página." };
		case "image":
			return { error: "No se pudo registrar la imagen" };
		default:
			return { error: genericMessage };
	}
}

/**
 * Genera una URL prefirmada para que el navegador suba la imagen
 * directamente a R2.
 *
 * El slug llega ya resuelto: `resolveSlug` es validación de entrada y
 * corresponde a la acción, no a la capa de datos.
 */
async function requestUploadUrl(
	prefix: "categories" | "products",
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	if (!name || !fileName || !contentType.startsWith("image/")) {
		return { error: "El archivo debe ser una imagen" };
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { error: EMPTY_SLUG_ERROR };
	}

	const upload = await createPresignedUpload(prefix, slug, fileName);

	if (!upload.ok) {
		if (upload.reason === "unauthorized") return { error: "No autorizado" };
		if (upload.reason === "config") {
			// El despliegue, no el usuario: el log del worker lleva la lista
			// exacta de variables que faltan.
			return { error: "Subida de imágenes no configurada en el servidor" };
		}
		return { error: "No se pudo generar la URL de subida" };
	}

	return {
		presignedUrl: upload.presignedUrl,
		key: upload.key,
		slug,
	};
}

export async function getCategoryUploadUrl(
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	return requestUploadUrl("categories", name, slugInput, fileName, contentType);
}

export async function getProductUploadUrl(
	name: string,
	slugInput: string,
	fileName: string,
	contentType: string
): Promise<PresignResult> {
	return requestUploadUrl("products", name, slugInput, fileName, contentType);
}

// ============================================
// Productos
// ============================================

export async function createProduct(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
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
	if (!categoryId) {
		return { fieldErrors: { categoryId: "Selecciona una categoría" } };
	}
	if (skuInput && !isValidSku(skuInput)) {
		return {
			fieldErrors: {
				sku: "El SKU debe tener el formato AAA-9999 (3 caracteres, guion, 4 caracteres)",
			},
		};
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	const result = await createProductRow({
		id: v7(),
		name,
		slug,
		description: description || null,
		price,
		// `null` = "autogenera uno" (lo resuelve el DAL), nunca escribe un SKU
		// nulo: la columna es NOT NULL.
		sku: skuInput || null,
		categoryId,
		imageKey: imageKey || undefined,
	});

	const state = toState(
		result,
		"Ya existe un producto con ese nombre, slug o SKU",
		"No se pudo crear el producto"
	);
	if (state) return state;

	revalidatePath("/admin/productos");
	redirect("/admin/productos");
}

export async function updateProduct(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
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
	if (!categoryId) {
		return { fieldErrors: { categoryId: "Selecciona una categoría" } };
	}
	// El SKU solo se valida si viene informado. `products.sku` es NOT NULL, pero
	// eso no obliga al admin a reescribirlo en cada edición: si el campo llega
	// vacío se conserva el que ya tiene la fila.
	// El autogenerado cubre la creación, donde el campo sí puede omitirse.
	if (sku && !isValidSku(sku)) {
		return {
			fieldErrors: {
				sku: "El SKU debe tener el formato AAA-9999 (3 caracteres, guion, 4 caracteres)",
			},
		};
	}

	const slug = resolveSlug(name, slugInput);
	if (!slug) {
		return { fieldErrors: { name: EMPTY_SLUG_ERROR } };
	}

	const result = await updateProductRow(id, {
		name,
		slug,
		description: description || null,
		price,
		sku,
		categoryId,
		imageKey: imageKey || undefined,
	});

	const state = toState(
		result,
		"Ya existe un producto con ese nombre, slug o SKU",
		"No se pudo actualizar el producto",
		"El producto ya no existe. Recarga la página."
	);
	if (state) return state;

	revalidatePath("/admin/productos");
	redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData): Promise<void> {
	const id = String(formData.get("id") ?? "").trim();
	if (!id) return;

	await deleteProductRow(id);
	revalidatePath("/admin/productos");
}

// ============================================
// Categorías
// ============================================

export async function createCategory(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
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

	const result = await createCategoryRow({
		id: v7(),
		name,
		slug,
		description: description || null,
		imageKey: imageKey || undefined,
	});

	const state = toState(
		result,
		"Ya existe una categoría con ese nombre o slug",
		"No se pudo crear la categoría"
	);
	if (state) return state;

	revalidatePath("/admin/categorias");
	redirect("/admin/categorias");
}

export async function updateCategory(
	_prev: AdminActionState,
	formData: FormData
): Promise<AdminActionState> {
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

	const result = await updateCategoryRow(id, {
		name,
		slug,
		description: description || null,
		imageKey: imageKey || undefined,
	});

	const state = toState(
		result,
		"Ya existe una categoría con ese nombre o slug",
		"No se pudo actualizar la categoría",
		"La categoría ya no existe. Recarga la página."
	);
	if (state) return state;

	revalidatePath("/admin/categorias");
	redirect("/admin/categorias");
}

export async function deleteCategory(formData: FormData): Promise<void> {
	const id = String(formData.get("id") ?? "").trim();
	if (!id) return;

	await deleteCategoryRow(id);
	revalidatePath("/admin/categorias");
	revalidatePath("/admin/productos");
}