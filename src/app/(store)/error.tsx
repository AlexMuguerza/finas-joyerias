"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlertIcon, RotateCcwIcon } from "lucide-react";

/**
 * Frontera de error de la tienda.
 *
 * Sin este archivo, cualquier excepción de un Server Component (una caída de
 * Neon es el caso realisticamente probable en un plan gratuito) devolvía el
 * error genérico de Next. Aquí se explica qué pasó y se ofrece reintentar,
 * que en un fallo transitorio de base de datos suele bastar.
 */
export default function StoreError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	// `console.error` quita el mensaje del overlay de desarrollo, pero lo deja
	// en el log del worker, que es donde se consulta con `observability`.
	useEffect(() => {
		console.error("[tienda] error en el render:", error);
	}, [error]);

	return (
		<section className="flex min-h-[70vh] items-center bg-cream py-32">
			<div className="mx-auto max-w-xl px-6 text-center">
				<div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-destructive/10">
					<TriangleAlertIcon className="size-6 text-destructive" strokeWidth={1.5} />
				</div>

				<h1 className="mb-3 font-heading text-3xl font-light text-heading md:text-4xl">
					No pudimos cargar esta página
				</h1>
				<p className="mb-8 font-body text-sm leading-relaxed text-text-body">
					Puede ser un problema puntual de conexión con nuestro servidor.
					Inténtalo de nuevo en unos segundos; si persiste, escríbenos y lo
					revisamos.
				</p>

				{error.digest && (
					<p className="mb-6 font-mono text-label text-muted-foreground">
						Referencia: {error.digest}
					</p>
				)}

				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<button
						type="button"
						onClick={reset}
						className="inline-flex cursor-pointer items-center justify-center gap-2 bg-foreground px-8 py-3.5 font-body text-label font-medium tracking-label text-white uppercase transition-colors hover:bg-foreground/85"
					>
						<RotateCcwIcon size={14} strokeWidth={1.5} />
						Reintentar
					</button>
					<Link
						href="/"
						className="inline-block border border-foreground/40 px-8 py-3.5 font-body text-label font-medium tracking-label text-foreground uppercase transition-colors hover:bg-foreground/5"
					>
						Volver al inicio
					</Link>
				</div>
			</div>
		</section>
	);
}
