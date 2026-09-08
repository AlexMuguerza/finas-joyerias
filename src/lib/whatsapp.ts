/**
 * Helpers para pedir por WhatsApp (https://wa.me/<número>?text=<mensaje>).
 * Formato del mensaje:
 *
 *   Hola quiero este producto            (1 ítem)
 *   Hola quiero estos productos          (varios ítems)
 *   ° Reloj clasico
 *     cantidad: 2
 *     sku: RES-8ST4
 *     total: S/129.80
 */

export const WHATSAPP_NUMBER = "51962792303";

const priceFormatter = new Intl.NumberFormat("es-PE", {
	style: "currency",
	currency: "PEN",
});

function formatPriceWa(value: number): string {
	return priceFormatter.format(value);
}

interface WhatsAppItem {
	name: string;
	price: number;
	quantity: number;
	sku?: string | null;
}

/** Abre WhatsApp con el mensaje del carrito (1 o varios productos). */
export function whatsappCartUrl(items: WhatsAppItem[]): string {
	const header =
		items.length === 1
			? "Hola quiero este producto"
			: "Hola quiero estos productos";

	const lines = items.map((item) => {
		const skuLine = item.sku ? `\n  sku: ${item.sku}` : "";
		return `° ${item.name}\n  cantidad: ${item.quantity}${skuLine}\n  total: ${formatPriceWa(item.price * item.quantity)}`;
	});

	const message = `${header}\n${lines.join("\n\n")}`;
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Abre WhatsApp con el mensaje para un solo producto. */
export function whatsappProductUrl(product: {
	name: string;
	price: number;
	sku?: string | null;
}): string {
	return whatsappCartUrl([{ ...product, quantity: 1 }]);
}
