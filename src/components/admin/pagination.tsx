import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Paginador server-side por search params.
 *
 * Solo aporta la lógica (qué páginas existen, cómo se construye la URL); el
 * marcado y el ARIA salen del componente de shadcn `ui/pagination.tsx`.
 *
 * No usa estado de cliente: cada página es un enlace con `?page=N`, así que el
 * estado vive en la URL (compartible, recargable y navegable con el botón
 * atrás) y la tabla se renderiza en el servidor.
 *
 * `PaginationLink` renderiza un `<a>` nativo, no un `<Link>` de Next, así que
 * el salto es una navegación completa. En el panel es aceptable e incluso
 * conveniente: tras una edición evita que el router cache de Next sirviera una
 * tabla obsoleta al volver atrás.
 *
 * Espera los `searchParams` vigentes y los reemite todos menos `page`, de modo
 * que los filtros activos no se pierden al cambiar de página.
 */
export function AdminPagination({
	basePath,
	searchParams,
	page,
	totalItems,
	pageSize,
	className,
}: {
	basePath: string;
	/** Search params vigentes de la ruta (sin `page`). */
	searchParams: Record<string, string | string[] | undefined>;
	page: number;
	totalItems: number;
	pageSize: number;
	className?: string;
}) {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	if (totalPages <= 1) return null;

	const href = (target: number) => {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(searchParams)) {
			if (key === "page" || value == null) continue;
			params.set(key, Array.isArray(value) ? value[0] : value);
		}
		if (target > 1) params.set("page", String(target));
		const qs = params.toString();
		return qs ? `${basePath}?${qs}` : basePath;
	};

	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalItems);

	// Ventana alrededor de la actual, con la primera y la última siempre
	// visibles para no perder la referencia de dónde estás dentro del catálogo.
	const windowSize = 1;
	const shown = new Set<number>([1, totalPages]);
	for (let p = page - windowSize; p <= page + windowSize; p++) {
		if (p >= 1 && p <= totalPages) shown.add(p);
	}
	const pages = [...shown].sort((a, b) => a - b);

	return (
		<Pagination className={className}>
			<div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					Mostrando <span className="text-foreground">{from}</span>–
					<span className="text-foreground">{to}</span> de{" "}
					<span className="text-foreground">{totalItems}</span>
				</p>

				<PaginationContent>
					<PaginationItem>
						{page > 1 ? (
							<PaginationPrevious href={href(page - 1)} text="Anterior" />
						) : (
							/* shadcn no tiene estado "disabled": se retira el enlace
							   en lugar de deixar un botón muerto enfocable. */
							<span
								aria-disabled="true"
								className="pointer-events-none inline-flex h-9 items-center gap-1 px-3 text-sm text-muted-foreground opacity-40"
							>
								Anterior
							</span>
						)}
					</PaginationItem>

					{pages.map((p, i) => {
						const gap = i > 0 && p - pages[i - 1] > 1;
						return (
							<PaginationItem key={p}>
								{gap && <PaginationEllipsis />}
								<PaginationLink href={href(p)} isActive={p === page}>
									{p}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					<PaginationItem>
						{page < totalPages ? (
							<PaginationNext href={href(page + 1)} text="Siguiente" />
						) : (
							<span
								aria-disabled="true"
								className="pointer-events-none inline-flex h-9 items-center gap-1 px-3 text-sm text-muted-foreground opacity-40"
							>
								Siguiente
							</span>
						)}
					</PaginationItem>
				</PaginationContent>
			</div>
		</Pagination>
	);
}