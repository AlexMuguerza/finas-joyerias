import { Skeleton } from "@/components/skeleton";

/** Estado de carga del panel: cabecera + tabla, para no mostrar un salto de layout. */
export default function AdminLoading() {
	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-4 w-56" />
				</div>
				<Skeleton className="h-8 w-28" />
			</div>

			<div className="rounded-xl border bg-card p-4">
				<div className="space-y-4">
					<div className="flex gap-4">
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-4 flex-1" />
						))}
					</div>
					{Array.from({ length: 6 }).map((_, row) => (
						<div key={row} className="flex gap-4">
							{[0, 1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-6 flex-1" />
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
