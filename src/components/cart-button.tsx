"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import { useIsMounted } from "@/lib/use-is-mounted";
import { cn } from "@/lib/utils";

/**
 * Botón de carrito con badge de cantidad. El badge solo se muestra tras
 * hidratar (evita parpadeo SSR: localStorage no existe en el servidor).
 *
 * `onNavigate` permite cerrar el menú móvil al pulsarlo desde dentro del
 * overlay; sin eso, el menú tapaba la página de carrito al navegar.
 */
export function CartButton({
	className,
	onNavigate,
}: {
	className?: string;
	onNavigate?: () => void;
}) {
	const items = useCart((s) => s.items);
	const mounted = useIsMounted();

	const count = mounted ? cartCount(items) : 0;

	return (
		<Link
			href="/carrito"
			onClick={onNavigate}
			aria-label={`Carrito de compras, ${count} artículo${count === 1 ? "" : "s"}`}
			className={cn(
				"relative cursor-pointer text-text-body transition-colors duration-300 hover:text-foreground",
				className
			)}
		>
			<ShoppingBag size={18} strokeWidth={1.5} />
			{mounted && count > 0 && (
				<span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-white">
					{count > 99 ? "99+" : count}
				</span>
			)}
		</Link>
	);
}
