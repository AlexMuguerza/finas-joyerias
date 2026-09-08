"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import logo from "@/assets/logo-sin-fondo.png";
import { AccountNav } from "@/components/account-nav";
import { CartButton } from "@/components/cart-button";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/", label: "Inicio" },
	{ href: "/categorias", label: "Categorías" },
	{ href: "/shop", label: "Catálogo" },
	{ href: "/#contacto", label: "Contacto" },
];

/**
 * Barra de navegación de la tienda (/shop). Es una variante del Navbar de
 * la landing adaptada a rutas internas: usa Link en vez de scroll de anclas
 * y convive con rutas como /auth/login.
 *
 * El menú móvil se renderiza con createPortal en <body>: si vive dentro del
 * <header>, el `backdrop-blur` del header scrolleado se vuelve el containing
 * block del overlay `fixed inset-0` y el menú queda recortado al tamaño del
 * header (bug visible al scrollear y abrir el menú).
 */
export function ShopHeader() {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => setIsMounted(true), []);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		// Bloquea el scroll del body cuando el menú móvil está abierto.
		document.body.style.overflow = isMenuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMenuOpen]);

	const isActive = (href: string) =>
		href === "/shop" || href === "/categorias"
			? pathname.startsWith(href)
			: pathname === href;

	const mobileMenu = isMounted && isMenuOpen ? createPortal(
		<div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 bg-cream lg:hidden">
			{/* Botón explícito para cerrar el menú móvil */}
			<button
				onClick={() => setIsMenuOpen(false)}
				className="absolute top-6 right-6 cursor-pointer text-foreground transition-colors duration-300 hover:text-primary"
				aria-label="Cerrar menú"
			>
				<X size={26} />
			</button>
			{links.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					onClick={() => setIsMenuOpen(false)}
					className={cn(
						"font-heading text-3xl transition-colors duration-300",
						isActive(link.href)
							? "text-primary"
							: "text-foreground hover:text-primary"
					)}
				>
					{link.label}
				</Link>
			))}
			<div className="mt-4 flex flex-col items-center gap-8">
				<AccountNav
					variant="mobile"
					onNavigate={() => setIsMenuOpen(false)}
				/>
				<Link
					href="/carrito"
					onClick={() => setIsMenuOpen(false)}
					className="font-heading text-2xl text-foreground transition-colors duration-300 hover:text-primary"
				>
					Carrito
				</Link>
			</div>
		</div>,
		document.body
	) : null;

	return (
		<>
			<header
				className={cn(
					"fixed top-0 right-0 left-0 z-50 transition-all duration-500",
					isScrolled
						? "glass bg-background/80 py-3 shadow-soft backdrop-blur"
						: "bg-transparent py-5"
				)}
			>
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
					<Link href="/" aria-label="Finas Joyería - Inicio">
						<Image
							src={logo}
							alt="Finas Joyería"
							className="h-10 w-auto md:h-11"
						/>
					</Link>

					{/* Desktop nav */}
					<nav
						className="hidden items-center gap-8 lg:flex"
						aria-label="Navegación de tienda"
					>
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"font-body text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-300",
									isActive(link.href)
										? "text-primary"
										: "text-text-body hover:text-foreground"
								)}
							>
								{link.label}
							</Link>
						))}
					</nav>

					<div className="hidden items-center gap-6 lg:flex">
						<AccountNav />
						<CartButton />
					</div>

					{/* Mobile toggle */}
					<div className="relative z-10 flex items-center gap-4 lg:hidden">
						<CartButton className="text-foreground" />
						<button
							className="cursor-pointer text-foreground"
							onClick={() => setIsMenuOpen((v) => !v)}
							aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</header>

			{/* Menú móvil fuera del <header>, montado en <body> vía portal */}
			{mobileMenu}
		</>
	);
}
