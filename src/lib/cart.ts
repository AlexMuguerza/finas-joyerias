/**
 * Carrito local del usuario (client-side): persiste en localStorage vía
 * zustand/persist. No requiere sesión ni backend.
 */

// Solo cliente: el store rehidrata desde `localStorage`, que no existe en el
// servidor. Marcado para que un Server Component que intente leer el carrito
// falle al compilar en lugar de rehidratar con datos vacíos.
import "client-only";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SITE_ORIGIN } from "@/lib/site";

export interface CartItem {
	id: string; // id del producto en la BD
	name: string;
	slug: string;
	sku: string | null;
	price: number; // en soles
	imageUrl: string | null;
	quantity: number;
}

/**
 * Tope por producto. No hay control de stock en el schema, así que sin este
 * límite el carrito aceptaba cantidades arbitrarias y generaba pedidos por
 * WhatsApp imposibles de cumplir (y totales absurdos).
 */
export const MAX_QUANTITY_PER_ITEM = 10;

export const CART_STORAGE_KEY = "finas-joyeria-cart";
const CART_STORAGE_VERSION = 2;

interface CartState {
	items: CartItem[];
	addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
	removeItem: (id: string) => void;
	setQuantity: (id: string, quantity: number) => void;
	clear: () => void;
}

function toFiniteNumber(value: unknown, fallback: number): number {
	const parsed = typeof value === "number" ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function clampQuantity(value: unknown): number {
	const quantity = Math.trunc(toFiniteNumber(value, 1));
	if (quantity < 1) return 1;
	return Math.min(quantity, MAX_QUANTITY_PER_ITEM);
}

/**
 * Deja la URL de la imagen en absoluta.
 *
 * El carrito es el único sitio donde la URL de una imagen **no viene del
 * servidor en cada render**: se serializa en `localStorage` el día que el
 * usuario añade el producto y se reutiliza tal cual días después. Ese día
 * `imageUrl()` devolvía `/api/images/<key>` (relativa), y el optimizador de
 * `/_next/image` en el worker resuelve las relativas contra el binding
 * `ASSETS`, que no tiene route handlers: devolvía 404 y el carrito mostraba
 * "Imagen no disponible" para productos que en la ficha se veían bien.
 *
 * Las fichas se.relenaban desde la BD en cada visita, así que el síntoma era
 * solo en el carrito — y por eso parece un fallo del carrito y no de las
 * imágenes.
 */
function normalizeImageUrl(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const raw = value.trim();
	if (!raw) return null;
	if (/^https?:\/\//i.test(raw)) return raw;
	if (raw.startsWith("/")) return `${SITE_ORIGIN}${raw}`;
	return raw;
}

/**
 * Valida y normaliza un item leído de localStorage, devolviendo `null` si no
 * es recuperable.
 *
 * Hace falta porque `persist` rehidrata sin pasar por los reducers: un
 * carrito guardado antes de que existiera `sku`, o manipulado a mano, llegaba
 * al render con `price: undefined` y hacía que `cartTotal` devolviera `NaN`
 * (el total se veía "—") y el badge del navbar mostrara "NaN".
 */
export function normalizeCartItem(raw: unknown): CartItem | null {
	if (!raw || typeof raw !== "object") return null;
	const item = raw as Partial<CartItem>;

	const id = typeof item.id === "string" ? item.id.trim() : "";
	if (!id) return null;

	const price = toFiniteNumber(item.price, Number.NaN);
	if (!Number.isFinite(price) || price < 0) return null;

	return {
		id,
		name: typeof item.name === "string" ? item.name : "",
		slug: typeof item.slug === "string" && item.slug ? item.slug : id,
		sku: typeof item.sku === "string" && item.sku ? item.sku : null,
		price,
		imageUrl: normalizeImageUrl(item.imageUrl),
		quantity: clampQuantity(item.quantity),
	};
}

function normalizeCart(raw: unknown): CartItem[] {
	if (!Array.isArray(raw)) return [];
	const items: CartItem[] = [];
	for (const entry of raw) {
		const item = normalizeCartItem(entry);
		if (!item) continue;
		// Fusiona duplicados por id (posible tras una migración o edición manual).
		const existing = items.find((i) => i.id === item.id);
		if (existing) {
			existing.quantity = clampQuantity(existing.quantity + item.quantity);
		} else {
			items.push(item);
		}
	}
	return items;
}

export const useCart = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			addItem: (item, quantity = 1) =>
				set((state) => {
					const candidate = normalizeCartItem({ ...item, quantity: 1 });
					if (!candidate) return state;

					const delta = clampQuantity(quantity);
					const existing = state.items.find((i) => i.id === candidate.id);
					if (existing) {
						return {
							items: state.items.map((i) =>
								i.id === candidate.id
									? {
											...i,
											// Se conservan nombre/precio/imagen del carrito: el
											// catálogo refleja el último guardado, no el del alta.
											quantity: clampQuantity(i.quantity + delta),
										}
									: i
							),
						};
					}
					return { items: [...state.items, { ...candidate, quantity: delta }] };
				}),
			removeItem: (id) =>
				set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
			setQuantity: (id, quantity) =>
				set((state) => {
					if (quantity <= 0) {
						return { items: state.items.filter((i) => i.id !== id) };
					}
					return {
						items: state.items.map((i) =>
							i.id === id ? { ...i, quantity: clampQuantity(quantity) } : i
						),
					};
				}),
			clear: () => set({ items: [] }),
		}),
		{
			name: CART_STORAGE_KEY,
			version: CART_STORAGE_VERSION,
			// El store solo guarda `items`: las acciones son funciones y no deben
			// intentar serializarse.
			partialize: (state) => ({ items: state.items }),
			// Sin `version`, cambiar la forma de `CartItem` (como pasó al añadir
			// `sku`) dejaba carritos viejos con campos ausentes y sin ruta de
			// recuperación. `migrate` normaliza cualquier estado previo.
			//
			// El bump a v2 es lo que hace que `migrate` corra sobre los carritos
			// ya guardados: es la única vía por la que un `imageUrl` relativo
			// escrito antes del cambio llega ya absoluto a la interfaz.
			migrate: (persisted) => ({
				items: normalizeCart(
					(persisted as { items?: unknown } | undefined)?.items
				),
			}),
		}
	)
);

export function cartTotal(items: CartItem[]): number {
	return items.reduce((sum, item) => {
		const price = toFiniteNumber(item.price, 0);
		const quantity = toFiniteNumber(item.quantity, 0);
		const line = price * quantity;
		return Number.isFinite(line) ? sum + line : sum;
	}, 0);
}

export function cartCount(items: CartItem[]): number {
	return items.reduce((sum, item) => {
		const quantity = toFiniteNumber(item.quantity, 0);
		return quantity > 0 ? sum + quantity : sum;
	}, 0);
}
