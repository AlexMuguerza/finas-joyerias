"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon, XIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CatalogCategory {
	slug: string;
	name: string;
	count: number;
}

export interface CatalogFilters {
	categoria?: string;
	q?: string;
	orden?: string;
	featured?: string;
}

/**
 * Barra de filtros del catálogo. Cada cambio reescribe la URL de /shop con
 * query params (server-side filtering): categoría, búsqueda, novedades y orden.
 */
export function CatalogToolbar({
	categories,
	filters,
	total,
}: {
	categories: CatalogCategory[];
	filters: CatalogFilters;
	total: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [query, setQuery] = useState(filters.q ?? "");
	const isFeatured = filters.featured === "1";
	const orden = filters.orden ?? "recientes";

	function buildUrl(patch: Partial<CatalogFilters>): string {
		const params = new URLSearchParams();
		const merged = { ...filters, ...patch };
		if (merged.categoria) params.set("categoria", merged.categoria);
		if (merged.q) params.set("q", merged.q);
		if (merged.featured === "1") params.set("featured", "1");
		if (merged.orden && merged.orden !== "recientes")
			params.set("orden", merged.orden);
		const qs = params.toString();
		return qs ? `${pathname}?${qs}` : pathname;
	}

	function apply(patch: Partial<CatalogFilters>) {
		router.push(buildUrl(patch), { scroll: true });
	}

	function handleSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		apply({ q: query.trim() || undefined });
	}

	const hasFilters = Boolean(filters.categoria || filters.q || isFeatured);

	return (
		<div className="space-y-6">
			{/* Fila principal: búsqueda + orden + toggle novedades */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<form
					onSubmit={handleSearch}
					className="relative w-full md:max-w-xs"
					role="search"
				>
					<SearchIcon
						size={16}
						strokeWidth={1.5}
						className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar producto…"
						aria-label="Buscar producto por nombre"
						className="h-10 w-full rounded-lg border border-border bg-background pr-9 pl-9 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
					/>
					{query && (
						<button
							type="button"
							onClick={() => {
								setQuery("");
								apply({ q: undefined });
							}}
							aria-label="Limpiar búsqueda"
							className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
						>
							<XIcon size={14} />
						</button>
					)}
				</form>

				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={() =>
							apply({ featured: isFeatured ? undefined : "1" })
						}
						aria-pressed={isFeatured}
						className={cn(
							"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 font-body text-[11px] font-medium tracking-[0.1em] uppercase transition-colors",
							isFeatured
								? "border-primary bg-primary/10 text-primary"
								: "border-border bg-background text-muted-foreground hover:text-foreground"
						)}
					>
						<SparklesIcon size={14} />
						Novedades (7 días)
					</button>

					<label className="sr-only" htmlFor="orden">
						Ordenar
					</label>
					<select
						id="orden"
						value={orden}
						onChange={(e) =>
							apply({
								orden:
									e.target.value === "recientes"
										? undefined
										: e.target.value,
							})
						}
						className="h-10 cursor-pointer rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
					>
						<option value="recientes">Más recientes</option>
						<option value="precio-asc">Precio: menor a mayor</option>
						<option value="precio-desc">Precio: mayor a menor</option>
						<option value="nombre">Nombre A–Z</option>
					</select>
				</div>
			</div>

			{/* Chips de categoría */}
			{categories.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => apply({ categoria: undefined })}
						className={cn(
							"cursor-pointer rounded-full border px-4 py-1.5 font-body text-[11px] font-medium tracking-[0.1em] uppercase transition-colors",
							!filters.categoria
								? "border-primary bg-primary text-primary-foreground"
								: "border-border bg-background text-muted-foreground hover:text-foreground"
						)}
					>
						Todas
					</button>
					{categories.map((cat) => {
						const active = filters.categoria === cat.slug;
						return (
							<button
								key={cat.slug}
								type="button"
								onClick={() =>
									apply({
										categoria: active ? undefined : cat.slug,
									})
								}
								className={cn(
									"cursor-pointer rounded-full border px-4 py-1.5 font-body text-[11px] font-medium tracking-[0.1em] uppercase transition-colors",
									active
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-background text-muted-foreground hover:text-foreground"
								)}
							>
								{cat.name} ({cat.count})
							</button>
						);
					})}
				</div>
			)}

			{/* Resultado + limpiar filtros */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="font-body text-sm text-muted-foreground">
					{total === 1 ? "1 pieza" : `${total} piezas`}
					{filters.categoria &&
						` en ${categories.find((c) => c.slug === filters.categoria)?.name ?? "categoría"}`}
				</p>
				{hasFilters && (
					<button
						type="button"
						onClick={() => apply({ categoria: undefined, q: undefined, featured: undefined, orden: undefined })}
						className="cursor-pointer font-body text-xs tracking-[0.1em] text-primary uppercase underline-offset-4 hover:underline"
					>
						Limpiar filtros
					</button>
				)}
			</div>
		</div>
	);
}
