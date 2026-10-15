import { cn } from "@/lib/utils";

/**
 * Bloques grises que imitan la silueta del contenido mientras carga.
 *
 * Sirven de dos cosas a la vez: místican el salto de layout cuando la
 * respuesta llega y, sobre todo, evitan el pantallazo en blanco de las rutas
 * lentas. Se animan con `animate-pulse`, coherente con el skeleton que ya
 * usa `RemoteImage`.
 */
export function Skeleton({ className }: { className?: string }) {
	return <div className={cn("animate-pulse bg-foreground/10", className)} />;
}

/** Rejilla de tarjetas de producto, con la silueta del catálogo real. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="text-center">
					<Skeleton className="mb-5 aspect-square w-full" />
					<Skeleton className="mx-auto mb-2 h-3 w-16" />
					<Skeleton className="mx-auto mb-3 h-5 w-40" />
					<Skeleton className="mx-auto h-4 w-20" />
				</div>
			))}		</div>
	);
}

/** Cabecera de página con título y subtítulo centrados. */
export function PageHeadingSkeleton() {
	return (
		<div className="py-16 text-center">
			<Skeleton className="mx-auto mb-4 h-2.5 w-32" />
			<Skeleton className="mx-auto mb-4 h-10 w-72" />
			<Skeleton className="mx-auto h-3.5 w-96 max-w-full" />
		</div>
	);
}
