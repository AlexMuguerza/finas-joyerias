"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboardIcon,
	UsersIcon,
	PackageIcon,
	TagsIcon,
	StoreIcon,
	LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Toaster } from "@/components/ui/sonner";

const NAV_ITEMS = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
	{ href: "/admin/usuarios", label: "Usuarios", icon: UsersIcon },
	{ href: "/admin/categorias", label: "Categorías", icon: TagsIcon },
	{ href: "/admin/productos", label: "Productos", icon: PackageIcon },
];

export function AdminShell({
	user,
	children,
}: {
	user: { name: string; email: string };
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/auth/login");
		router.refresh();
	}

	const navLinks = (
		<nav className="flex flex-col gap-1">
			{NAV_ITEMS.map((item) => {
				const active =
					pathname === item.href || pathname.startsWith(item.href + "/");
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
							active
								? "bg-primary/10 font-medium text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground"
						)}
					>
						<item.icon className="size-4" />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);

	const sidebar = (
		<div className="flex h-full flex-col gap-6 p-5">
			<Link href="/admin" className="flex items-center gap-2 px-3">
				<span className="font-heading text-lg font-semibold tracking-tight">
					Finas <span className="text-primary">Admin</span>
				</span>
			</Link>
			{navLinks}
			<div className="mt-auto flex flex-col gap-3">
				<Link
					href="/"
					target="_blank"
					className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<StoreIcon className="size-4" />
					Ver tienda
				</Link>
				<div className="rounded-lg border bg-card p-3">
					<p className="truncate text-sm font-medium">{user.name}</p>
					<p className="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleSignOut}
					className="w-full"
				>
					<LogOutIcon />
					Cerrar sesión
				</Button>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-muted/40">
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card md:block">
				{sidebar}
			</aside>
			<div className="md:pl-64">
				<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur md:hidden">
					<div className="flex items-center gap-1 overflow-x-auto p-2">
						{NAV_ITEMS.map((item) => {
							const active =
								pathname === item.href || pathname.startsWith(item.href + "/");
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
										active
											? "bg-primary/10 font-medium text-primary"
											: "text-muted-foreground hover:bg-muted"
									)}
								>
									<item.icon className="size-3.5" />
									{item.label}
								</Link>
							);
						})}
					</div>
				</header>
				<main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
			</div>
			<Toaster />
		</div>
	);
}