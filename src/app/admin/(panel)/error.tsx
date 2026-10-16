"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlertIcon, RotateCcwIcon } from "lucide-react";

/**
 * Frontera de error del panel.
 *
 * En el admin NO se degradan las consultas a un estado vacío, al contrario que
 * en la tienda: una tabla sin filas se lee como "no tienes productos" y desde
 * ahí el primer impulso es borrar catálogo. Aquí el fallo se muestra explícito.
 */
export default function AdminError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("[admin] error en el panel:", error);
	}, [error]);

	return (
		<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
			<div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10">
				<TriangleAlertIcon className="size-6 text-destructive" strokeWidth={1.5} />
			</div>

			<h2 className="mb-2 font-heading text-xl font-light text-heading">
				No pudimos cargar los datos
			</h2>
			<p className="mx-auto mb-6 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
				Los datos <strong className="font-medium text-foreground">siguen
				intactos</strong>: esto es un problema de conexión con la base de
				datos, no un fallo del panel. No borres ni guardes nada hasta que se
				resuelva.
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
					className="inline-flex cursor-pointer items-center justify-center gap-2 bg-foreground px-6 py-3 font-body text-label font-medium tracking-label text-white uppercase transition-colors hover:bg-foreground/85"
				>
					<RotateCcwIcon size={14} strokeWidth={1.5} />
					Reintentar
				</button>
				<Link
					href="/admin"
					className="inline-block border border-foreground/40 px-6 py-3 font-body text-label font-medium tracking-label text-foreground uppercase transition-colors hover:bg-foreground/5"
				>
					Volver al panel
				</Link>
			</div>
		</div>
	);
}