"use client";

import Link from "next/link";
import Image from "next/image";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cartTotal, useCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { whatsappCartUrl } from "@/lib/whatsapp";

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

function CartRow({ item }: { item: CartItem }) {
	const setQuantity = useCart((s) => s.setQuantity);
	const removeItem = useCart((s) => s.removeItem);

	return (
		<div className="flex gap-4 border-b border-foreground/10 py-6">
			<Link
				href={`/productos/${item.slug}`}
				className="relative h-24 w-24 flex-none overflow-hidden bg-soft-pink"
			>
				{item.imageUrl ? (
					<Image
						src={item.imageUrl}
						alt={item.name}
						fill
						sizes="96px"
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-[9px] tracking-widest text-muted-foreground uppercase">
						Sin imagen
					</div>
				)}
			</Link>

			<div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<Link
							href={`/productos/${item.slug}`}
							className="block truncate font-heading text-base font-light text-heading hover:text-primary"
						>
							{item.name}
						</Link>
						{item.sku && (
							<p className="mt-0.5 font-body text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
								SKU: {item.sku}
							</p>
						)}
						<p className="mt-1 font-body text-sm font-medium text-foreground">
							{formatPrice(item.price)}
						</p>
					</div>
					<button
						type="button"
						onClick={() => removeItem(item.id)}
						aria-label={`Eliminar ${item.name} del carrito`}
						className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-destructive"
					>
						<TrashIcon size={16} />
					</button>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center border border-foreground/20">
						<button
							type="button"
							onClick={() => setQuantity(item.id, item.quantity - 1)}
							aria-label="Disminuir cantidad"
							className="flex h-8 w-8 cursor-pointer items-center justify-center transition-colors hover:bg-foreground/5"
						>
							<MinusIcon size={13} />
						</button>
						<span className="w-8 text-center font-body text-sm">
							{item.quantity}
						</span>
						<button
							type="button"
							onClick={() => setQuantity(item.id, item.quantity + 1)}
							aria-label="Aumentar cantidad"
							className="flex h-8 w-8 cursor-pointer items-center justify-center transition-colors hover:bg-foreground/5"
						>
							<PlusIcon size={13} />
						</button>
					</div>
					<p className="font-body text-sm font-semibold text-heading">
						{formatPrice(item.price * item.quantity)}
					</p>
				</div>
			</div>
		</div>
	);
}

export function CartView() {
	const items = useCart((s) => s.items);
	const clear = useCart((s) => s.clear);
	// localStorage solo existe en el cliente: evita parpadeo de SSR.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<section className="min-h-[60vh] bg-cream pt-32 pb-24 md:pt-40">
				<div className="mx-auto max-w-3xl px-6 lg:px-8">
					<div className="h-8 w-40 animate-pulse rounded bg-foreground/10" />
				</div>
			</section>
		);
	}

	if (items.length === 0) {
		return (
			<section className="min-h-[60vh] bg-cream pt-32 pb-24 md:pt-40">
				<div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
					<h1 className="mb-4 font-heading text-4xl font-light text-heading">
						Tu carrito está <span className="italic text-primary">vacío</span>
					</h1>
					<p className="mb-10 font-body text-sm text-muted-foreground">
						Explora nuestras colecciones y encuentra la pieza perfecta.
					</p>
					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Link
							href="/shop"
							className="inline-block bg-foreground px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-white uppercase transition-colors hover:bg-foreground/85"
						>
							Ver catálogo
						</Link>
						<Link
							href="/categorias"
							className="inline-block border border-foreground/40 px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground/5"
						>
							Ver categorías
						</Link>
					</div>
				</div>
			</section>
		);
	}

	const total = cartTotal(items);

	return (
		<section className="min-h-screen bg-cream pt-28 pb-24 md:pt-36">
			<div className="mx-auto max-w-3xl px-6 lg:px-8">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-heading text-3xl font-light text-heading md:text-4xl">
						Tu <span className="italic text-primary">carrito</span>
					</h1>
					<button
						type="button"
						onClick={clear}
						className="cursor-pointer font-body text-[11px] tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-destructive"
					>
						Vaciar carrito
					</button>
				</div>

				<div>
					{items.map((item) => (
						<CartRow key={item.id} item={item} />
					))}
				</div>

				<div className="mt-8 flex items-center justify-between">
					<p className="font-body text-sm tracking-[0.15em] text-muted-foreground uppercase">
						Total
					</p>
					<p className="font-heading text-2xl font-light text-heading">
						{formatPrice(total)}
					</p>
				</div>

				<div className="mt-10 flex flex-col gap-3">
					<a
						href={whatsappCartUrl(items)}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 bg-[#25D366] px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-[#1EB85A]"
					>
						<WhatsAppIcon size={16} />
						Pedir todo por WhatsApp
					</a>
					<Link
						href="/shop"
						className="px-10 py-4 text-center font-body text-[11px] font-medium tracking-[0.2em] text-foreground uppercase transition-colors duration-300 border border-foreground/40 hover:bg-foreground/5"
					>
						Seguir comprando
					</Link>
				</div>

				<p className="mt-6 text-center font-body text-xs text-muted-foreground">
					Al pedir por WhatsApp te responderemos personalmente para confirmar
					disponibilidad, pago y entrega.
				</p>
			</div>
		</section>
	);
}
