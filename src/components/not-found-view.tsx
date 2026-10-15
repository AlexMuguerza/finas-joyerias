import Link from "next/link";

/**
 * Vista 404 reutilizable. Se usa desde `app/not-found.tsx` (URLs sin matchear,
 * fuera de cualquier layout de segmento) y desde `app/(store)/not-found.tsx`
 * (llamadas a `notFound()` dentro de la tienda, que sí heredan el header y el
 * footer del layout).
 */
export function NotFoundView() {
	return (
		<section className="flex min-h-[75vh] items-center bg-cream py-32">
			<div className="mx-auto max-w-xl px-6 text-center">
				<p className="mb-4 font-heading text-7xl font-light text-primary md:text-8xl">
					404
				</p>
				<h1 className="mb-4 font-heading text-3xl font-light text-heading md:text-4xl">
					Esta página no <span className="italic text-primary">existe</span>
				</h1>
				<p className="mb-10 font-body text-sm leading-relaxed text-text-body">
					Puede que la pieza que buscas ya no esté disponible o que el
					enlace tenga un error. Te recomendamos revisar el catálogo.
				</p>

				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<Link
						href="/shop"
						className="inline-block bg-foreground px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-white uppercase transition-colors hover:bg-foreground/85"
					>
						Ver catálogo
					</Link>
					<Link
						href="/"
						className="inline-block border border-foreground/40 px-10 py-4 font-body text-[11px] font-medium tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground/5"
					>
						Volver al inicio
					</Link>
				</div>
			</div>
		</section>
	);
}
