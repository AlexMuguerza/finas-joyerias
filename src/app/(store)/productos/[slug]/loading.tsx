import { Skeleton } from "@/components/skeleton";

/**
 * Estado de carga del detalle de producto: replica la rejilla de dos columnas
 * (imagen cuadrada a la izquierda, datos a la derecha) para que la transición a
 * contenido real no desplace nada.
 */
export default function ProductLoading() {
	return (
		<section className="bg-cream py-12 pb-20">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
				<Skeleton className="aspect-square w-full" />

				<div className="flex flex-col justify-center">
					<Skeleton className="mb-3 h-3 w-24" />
					<Skeleton className="mb-4 h-12 w-3/4" />
					<Skeleton className="mb-3 h-3 w-28" />
					<Skeleton className="mb-8 h-8 w-32" />
					<Skeleton className="mb-2 h-3 w-full" />
					<Skeleton className="mb-2 h-3 w-11/12" />
					<Skeleton className="mb-10 h-3 w-4/5" />
					<Skeleton className="h-14 w-full" />
					<Skeleton className="mt-3 h-14 w-full" />
				</div>
			</div>
		</section>
	);
}
