"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import logo from "@/assets/logo-sin-fondo.png";
import { AccountNav } from "@/components/account-nav";
import { CartButton } from "@/components/cart-button";
import {
	MobileNavLink,
	MobileNavMenu,
} from "@/components/mobile-nav-menu";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/", label: "Inicio" },
	{ href: "/categorias", label: "Categorías" },
	{ href: "/shop", label: "Catálogo" },
	{ href: "/#contacto", label: "Contacto" },
];

// `lg` es el breakpoint del `lg:hidden` del overlay: al cruzarlo hay que
// cerrar el menú (ver el efecto de `matchMedia`).
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Barra de navegación de la tienda (/shop). Comparte el overlay móvil con la
 * landing a través de `MobileNavMenu`; lo propio de esta barra son los enlaces
 * de ruta (no anclas), el resaltado de la sección activa y el fondo `glass` al
 * hacer scroll.
 */
export function ShopHeader() {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);

	// El estado de apertura se guarda junto a la ruta en la que se abrió y se
	// *deriva* en el render. Al cambiar de ruta, `menuState.pathname` deja de
	// coincidir y el menú se cierra solo, sin `useEffect` ni `setState` en un
	// efecto (que provoca un render extra y además dispara la regla
	// `react-hooks/set-state-in-effect`). Cubre lo que los `onClick` de cada
	// enlace no capturan: navegación con teclado y "atrás"/"adelante" del
	// navegador, que antes dejaban el menú y su bloqueo de scroll abiertos
	// encima de la página nueva.
	const [menuState, setMenuState] = useState({ pathname, open: false });
	const isMenuOpen = menuState.pathname === pathname && menuState.open;
	const setIsMenuOpen = (open: boolean) => setMenuState({ pathname, open });

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Cierra al cruzar a escritorio. El overlay es `lg:hidden`, así que al
	// rotar el móvil o redimensionar la ventana el menú se volvía invisible
	// pero `modal` seguía bloqueando el scroll (y base-ui lo re-aplica en cada
	// `resize`): la página quedaba sin poder desplazarse, sin ninguna pista
	// visual de por qué.
	useEffect(() => {
		const query = window.matchMedia(DESKTOP_QUERY);
		const handleChange = (event: MediaQueryListEvent) => {
			// Actualización funcional: no depende de `pathname` y por eso el
			// efecto no necesita re-suscribirse en cada render.
			if (event.matches) setMenuState((prev) => ({ ...prev, open: false }));
		};
		query.addEventListener("change", handleChange);
		return () => query.removeEventListener("change", handleChange);
	}, []);

	const isActive = (href: string) => {
		// Los enlaces con ancla (`/#contacto`) apuntan a la landing, no a una
		// ruta de la tienda: comparar `pathname` con ellos nunca daba true
		// (antes `pathname === "/#contacto"` era literalmente imposible), así
		// que quedaban como enlaces inertes en el resaltado.
		if (href.includes("#")) return false;
		return href === "/" ? pathname === "/" : pathname.startsWith(href);
	};

	return (
		<>
			<header
				className={cn(
					"fixed top-0 right-0 left-0 z-50",
					// `transition-all` animaba también `padding`, que provoca
					// reflow en cada cruce del umbral de 50px al hacer scroll.
					"transition-[background-color,box-shadow,padding] duration-300",
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
								aria-current={isActive(link.href) ? "page" : undefined}
								className={cn(
									"font-body text-label font-medium tracking-label uppercase transition-colors duration-300",
									isActive(link.href)
										? "text-primary-strong"
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
					<div className="flex items-center gap-2 lg:hidden">
						<CartButton className="text-foreground" />
						<button
							type="button"
							onClick={() => setIsMenuOpen(true)}
							aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
							aria-expanded={isMenuOpen}
							className="flex h-11 w-11 cursor-pointer items-center justify-center text-foreground transition-colors duration-300 hover:text-primary-strong"
						>
							{/* Solo el icono de "hamburguesa": con el menú abierto el
							    overlay (z-60) tapa el header, así que aquí nunca se ve
							    el estado "cerrando". El cierre vive en el propio overlay,
							    en `MobileNavMenu`. */}
							<Menu size={24} />
						</button>
					</div>
				</div>
			</header>

			<MobileNavMenu
				open={isMenuOpen}
				onOpenChange={setIsMenuOpen}
				label="Menú de la tienda"
				navLabel="Navegación móvil"
			>
				{links.map((link, index) => (
					<MobileNavLink
						key={link.href}
						href={link.href}
						index={index}
						isActive={isActive(link.href)}
						onNavigate={() => setIsMenuOpen(false)}
					>
						{link.label}
					</MobileNavLink>
				))}

				<div className="mt-6 flex flex-col items-center gap-6">
					<AccountNav
						variant="mobile"
						onNavigate={() => setIsMenuOpen(false)}
					/>
					<CartButton
						className="py-2 text-foreground"
						onNavigate={() => setIsMenuOpen(false)}
					/>
				</div>
			</MobileNavMenu>
		</>
	);
}
