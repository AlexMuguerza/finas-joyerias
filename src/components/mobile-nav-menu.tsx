"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import logo from "@/assets/logo-sin-fondo.png";
import { cn } from "@/lib/utils";

/**
 * Menú móvil compartido por la landing (`Navbar`) y la tienda
 * (`ShopHeader`). Antes cada uno tenía el suyo y se fueron por separado: el de
 * la landing acabó con dos botones de cerrar a la vez (el toggle del header,
 * que cambiaba a "X", más un "X" explícito en el overlay) y un orden de
 * botones invertido respecto al de la tienda.
 *
 * Extraer el overlay a un único sitio evita que eso vuelva a pasar y
 * concentra los arreglos de móvil en un solo archivo.
 *
 * Es un `Dialog` de base-ui en lugar de un overlay manual porque aporta, sin
 * código extra: portal, trampa de foco, cierre con Escape, descarte por
 * pulsación exterior, `aria-modal` y bloqueo de scroll **con compensación de
 * scrollbar** (su `useScrollLock` es global y ref-counted, y detecta si la
 * página ya está bloqueada para no pisarla).
 *
 * El overlay va a `z-60` para tapar el header (`z-50`) y traer su propio
 * cierre: así solo hay un control visible y no se solapan dos "X" en la misma
 * esquina, que es exactamente lo que pasaba antes.
 */
export function MobileNavMenu({
	open,
	onOpenChange,
	label,
	navLabel,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Nombre accesible del diálogo (se anuncia al lector de pantalla). */
	label: string;
	/** Nombre accesible de la lista de enlaces. */
	navLabel: string;
	children: React.ReactNode;
}) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Popup
					className={cn(
						"fixed inset-0 z-60 flex flex-col bg-cream lg:hidden",
						"data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
					)}
				>
					{/* Nombre accesible: visualmente el menú es una lista de
					    enlaces, pero para un lector de pantalla es un diálogo. */}
					<DialogPrimitive.Title className="sr-only">
						{label}
					</DialogPrimitive.Title>

					{/* Barra propia del overlay, con su cierre. */}
					<div className="flex items-center justify-between px-6 py-5">
						<Link href="/" aria-label="Finas Joyería - Inicio">
							<Image
								src={logo}
								alt="Finas Joyería"
								className="h-10 w-auto"
							/>
						</Link>
						<DialogPrimitive.Close
							aria-label="Cerrar menú"
							// `-mr-2` compensa la mitad del padding extra para que el
							// icono quede optically alineado con el resto del menú.
							className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-foreground transition-colors duration-300 hover:text-primary"
						>
							<X size={26} />
						</DialogPrimitive.Close>
					</div>

					{/* El <nav> es el contenedor scrolleable, así que los enlaces son
					    hijos directos del flex y el `gap` se aplica a ellos sin
					    necesitar un envoltorio con `display: contents` (que puede
					    eliminar la semántica de <nav> del árbol de accesibilidad). */}
					<nav
						aria-label={navLabel}
						className={cn(
							"flex flex-1 flex-col items-center justify-center gap-7",
							// Desplazable si el contenido no cabe (móvil pequeño o
							// tipografía grande) en lugar de recortarse.
							"overflow-y-auto px-6",
							// Respeta la barra de inicio del iPhone.
							"pb-[max(2rem,env(safe-area-inset-bottom))]"
						)}
					>
						{children}
					</nav>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

const ITEM_BASE =
	"animate-in fade-in-0 cursor-pointer py-1 font-heading text-3xl transition-colors duration-300";

/**
 * Enlace del menú a otra ruta.
 *
 * Es un `Link` normal, **no** un `Dialog.Close` con
 * `render={<Link/>}`: en ese caso base-ui marca el elemento con
 * `nativeButton={false}` para deixar de esperar un `<button>`, y a cambio le
 * aplica `role="button"` (sus props se fusionan al final, así que no se puede
 * sobrescribir). Un enlace de navegación anunciado como botón es peor
 * accesibilidad que la alternativa, y además se pierde el rol `link` para el
 * lector de pantalla. Con `nativeButton` en `true` base-ui avisa por consola.
 *
 * El cierre lo pide explícitamente `onNavigate`, que en el mismo clic dispara
 * la navegación de Next: no hace falta coordinar nada porque cerrar es un
 * `setState` síncrono y navegar es asíncrono.
 */
export function MobileNavLink({
	href,
	isActive,
	index = 0,
	onNavigate,
	children,
}: {
	href: string;
	isActive?: boolean;
	index?: number;
	onNavigate: () => void;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			onClick={onNavigate}
			aria-current={isActive ? "page" : undefined}
			style={{ animationDelay: `${100 + index * 60}ms` }}
			className={cn(
				ITEM_BASE,
				isActive ? "text-primary" : "text-foreground hover:text-primary"
			)}
		>
			{children}
		</Link>
	);
}

/**
 * Enlace del menú a una sección de la misma página (`#colecciones`): no
 * navega, hace scroll, así que es un `button` en vez de un `Link`. El
 * `Dialog.Close` hace que el menú se cierre al pulsarlo, igual que en las
 * rutas.
 *
 * El foco lo restaura base-ui con `preventScroll: true`, así que no pelea con
 * el scroll suave que dispara `onSelect`.
 */
export function MobileNavAnchorLink({
	onSelect,
	isActive,
	index = 0,
	children,
}: {
	onSelect: () => void;
	isActive?: boolean;
	index?: number;
	children: React.ReactNode;
}) {
	return (
		<DialogPrimitive.Close
			onClick={onSelect}
			style={{ animationDelay: `${100 + index * 60}ms` }}
			className={cn(
				ITEM_BASE,
				isActive ? "text-primary" : "text-foreground hover:text-primary"
			)}
		>
			{children}
		</DialogPrimitive.Close>
	);
}
