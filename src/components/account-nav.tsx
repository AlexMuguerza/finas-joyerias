"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	UserRoundIcon,
	ChevronDownIcon,
	LogOutIcon,
	LayoutDashboardIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Zona de cuenta del Navbar de la tienda:
 * - Sin sesión: enlace para iniciar sesión (o crear cuenta en móvil).
 * - Con sesión: en desktop un dropdown con nombre, acceso al panel de
 *   administración (solo rol admin) y cerrar sesión; en móvil se muestra
 *   en línea dentro del overlay del menú.
 */
export function AccountNav({
	variant = "desktop",
	className,
	onNavigate,
}: {
	variant?: "desktop" | "mobile";
	className?: string;
	onNavigate?: () => void;
}) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user;

	const isAdmin = user?.role === "admin";

	async function handleSignOut() {
		await authClient.signOut();
		onNavigate?.();
		router.push("/");
		router.refresh();
	}

	// ---- Variante móvil: items en línea dentro del overlay ----
	if (variant === "mobile") {
		if (isPending) {
			return (
				<span className="inline-flex h-9 items-center text-text-body">
					<UserRoundIcon size={20} strokeWidth={1.5} />
				</span>
			);
		}

		if (!user) {
			return (
				<div className="flex items-center gap-8">
					<Link
						href="/auth/login"
						onClick={onNavigate}
						className="font-heading text-2xl text-foreground transition-colors duration-300 hover:text-primary"
					>
						Ingresar
					</Link>
					<Link
						href="/auth/register"
						onClick={onNavigate}
						className="font-heading text-2xl text-foreground transition-colors duration-300 hover:text-primary"
					>
						Crear cuenta
					</Link>
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center gap-3">
				<p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
					{user.email}
				</p>
				{isAdmin && (
					<Link
						href="/admin"
						onClick={onNavigate}
						className="flex items-center gap-2 font-heading text-2xl text-foreground transition-colors duration-300 hover:text-primary"
					>
						<LayoutDashboardIcon size={20} strokeWidth={1.5} />
						Panel de administración
					</Link>
				)}
				<button
					type="button"
					onClick={handleSignOut}
					className="flex cursor-pointer items-center gap-2 font-heading text-2xl text-foreground transition-colors duration-300 hover:text-primary"
				>
					<LogOutIcon size={20} strokeWidth={1.5} />
					Cerrar sesión
				</button>
			</div>
		);
	}

	// ---- Variante desktop ----
	if (isPending) {
		return (
			<span
				className={cn(
					"inline-flex h-8 items-center text-text-body",
					className
				)}
			>
				<UserRoundIcon size={18} strokeWidth={1.5} />
			</span>
		);
	}

	if (!user) {
		return (
			<Link
				href="/auth/login"
				className={cn(
					"font-body text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-300",
					"text-text-body hover:text-foreground",
					className
				)}
				aria-label="Iniciar sesión"
			>
				Ingresar
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"inline-flex cursor-pointer items-center gap-1.5 text-text-body transition-colors duration-300 outline-none hover:text-foreground",
					className
				)}
				aria-label="Menú de cuenta"
			>
				<UserRoundIcon size={18} strokeWidth={1.5} />
				<ChevronDownIcon size={12} strokeWidth={2} className="opacity-60" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup className="grid gap-0.5">
					<DropdownMenuLabel>
						<span className="truncate font-medium text-foreground">
							{user.name}
						</span>
						<span className="truncate font-normal text-muted-foreground">
							{user.email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				{isAdmin && (
					<DropdownMenuItem render={<Link href="/admin" />}>
						<LayoutDashboardIcon />
						Panel de administración
					</DropdownMenuItem>
				)}
				<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
					<LogOutIcon />
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
