"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

/**
 * Botón de carrito con badge de cantidad. El badge solo se muestra tras
 * montar (evita parpadeo SSR: localStorage no existe en el servidor).
 */
export function CartButton({ className }: { className?: string }) {
	const items = useCart((s) => s.items);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const count = mounted ? cartCount(items) : 0;

	return (
		<Link
			href="/carrito"
			aria-label={`Carrito de compras, ${count} artículo${count === 1 ? "" : "s"}`}
			className={cn(
				"relative cursor-pointer text-text-body transition-colors duration-300 hover:text-foreground",
				className
			)}
		>
			<ShoppingBag size={18} strokeWidth={1.5} />
			{mounted && count > 0 && (
				<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-white">
					{count > 9 ? "9+" : count}
				</span>
			)}
		</Link>
	);
}
