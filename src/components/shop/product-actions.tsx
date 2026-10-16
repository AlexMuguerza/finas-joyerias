"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { whatsappProductUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface CartProductData {
	id: string;
	name: string;
	slug: string;
	sku: string | null;
	price: number; // ya parseado a número
	imageUrl: string | null;
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
		</svg>
	);
}

/**
 * Botones de acción de producto: "Agregar al carrito" (store local con
 * toast de confirmación) y "Pedir por WhatsApp" (abre wa.me con el mensaje
 * del producto). Variante compacta para tarjetas y normal para el detalle.
 */
export function ProductActions({
	product,
	variant = "card",
	className,
}: {
	product: CartProductData;
	variant?: "card" | "detail";
	className?: string;
}) {
	const addItem = useCart((s) => s.addItem);
	const [added, setAdded] = useState(false);
	// Sin ref + cleanup, cada clic dejaba un `setTimeout` vivo: al navegar
	// durante la confirmación se llamaba `setAdded` sobre un componente
	// desmontado, y los clics rápidos apilaban timers que lo apagaban antes
	// de tiempo.
	const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (addedTimer.current) clearTimeout(addedTimer.current);
		};
	}, []);

	function handleAdd() {
		addItem({
			id: product.id,
			name: product.name,
			slug: product.slug,
			sku: product.sku,
			price: product.price,
			imageUrl: product.imageUrl,
		});
		setAdded(true);
		if (addedTimer.current) clearTimeout(addedTimer.current);
		addedTimer.current = setTimeout(() => setAdded(false), 1600);
		toast.success(`Producto "${product.name.slice(0, 20)}${product.name.length > 20 ? "..." : ""}" agregado al carrito`);
	}

	if (variant === "detail") {
		return (
			<div className={cn("flex flex-col gap-3", className)}>
				<button
					type="button"
					onClick={handleAdd}
					className="cursor-pointer bg-foreground px-10 py-4 font-body text-label font-medium tracking-label text-white uppercase transition-colors duration-300 hover:bg-foreground/85"
				>
					{added ? "✓ Agregado al carrito" : "Agregar al carrito"}
				</button>
				<a
					href={whatsappProductUrl(product)}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-2 border border-[#25D366]/60 px-10 py-4 font-body text-label font-medium tracking-label uppercase transition-colors duration-300 text-[#128C4A] hover:bg-[#25D366]/10"
				>
					<WhatsAppIcon size={16} />
					Pedir por WhatsApp
				</a>
			</div>
		);
	}

	// Variante compacta para tarjetas.
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<button
				type="button"
				onClick={handleAdd}
				aria-label={`Agregar ${product.name} al carrito`}
				title="Agregar al carrito"
				className={cn(
					"flex h-9 w-9 cursor-pointer items-center justify-center transition-all duration-300",
					added
						? "bg-primary-strong text-white"
						: "bg-white/95 text-foreground hover:bg-primary-strong hover:text-white"
				)}
			>
				<ShoppingBag size={15} strokeWidth={1.5} />
			</button>
			<a
				href={whatsappProductUrl(product)}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`Pedir ${product.name} por WhatsApp`}
				title="Pedir por WhatsApp"
				className="flex h-9 w-9 items-center justify-center bg-white/95 text-[#128C4A] transition-all duration-300 hover:bg-[#25D366] hover:text-white"
			>
				<WhatsAppIcon size={15} />
			</a>
		</div>
	);
}

/** Enlace interno reutilizable (por si se necesita en otros lugares). */
export { Link as CartLink };
