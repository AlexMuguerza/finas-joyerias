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

/** El mismo número, formateado para mostrar en pantalla. */
export const WHATSAPP_DISPLAY = "+51 962 792 303";

const priceFormatter = new Intl.NumberFormat("es-PE", {
	style: "currency",
	currency: "PEN",
});

function formatPriceWa(value: number): string {
	return priceFormatter.format(value);
}

/**
 * URL de wa.me con un texto libre. Punto de entrada único para cualquier
 * enlace a WhatsApp: evita repetir el número a mano en distintos componentes
 * (que es como se desincronizan los datos de contacto del negocio).
 */
export function whatsappUrl(message: string): string {
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
	return whatsappUrl(message);
}

/** Abre WhatsApp con el mensaje para un solo producto. */
export function whatsappProductUrl(product: {
	name: string;
	price: number;
	sku?: string | null;
}): string {
	return whatsappCartUrl([{ ...product, quantity: 1 }]);
}

export interface WhatsAppContactData {
	name: string;
	email?: string;
	phone?: string;
	message: string;
}

/**
 * Entrega el mensaje del formulario de contacto a WhatsApp.
 *
 * La tienda vende 100% por WhatsApp (ver `whatsappCartUrl`), así que el
 * formulario de la landing no envía correo ni guarda nada: arma el mensaje y
 * abre el chat con los datos ya escritos. Sin servicios de correo
 * configurados, un `fetch` a un backend habría perdido los leads.
 */
export function whatsappContactUrl(data: WhatsAppContactData): string {
	const lines = [
		"Hola, me gustaría hacer una consulta sobre joyería.",
		"",
		`Nombre: ${data.name}`,
	];
	if (data.phone) lines.push(`Teléfono: ${data.phone}`);
	if (data.email) lines.push(`Correo: ${data.email}`);
	lines.push("", data.message);

	return whatsappUrl(lines.join("\n"));
}
