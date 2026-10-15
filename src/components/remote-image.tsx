"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemoteImageProps {
	src: string;
	alt: string;
	/** Clases del contenedor (define el tamaño/posición: "absolute inset-0", "h-10 w-10"...). */
	containerClassName?: string;
	/** Clases extra de la imagen (transformaciones, hover scale, object-contain...). */
	imgClassName?: string;
	/** Clases extra del skeleton. */
	skeletonClassName?: string;
	/** Carga sin lazy (imágenes above-the-fold). */
	eager?: boolean;
	/** Contenido alternativo si la imagen falla (por defecto: icono + texto). */
	fallback?: React.ReactNode;
	/**
	 * Ancho mostrado, para que el navegador elija la variante correcta del
	 * `srcset`. Sin esto, `fill` asume el ancho completo del viewport y Next
	 * genera (y sirve) candidatos para tamaños que ninguna pantalla usa.
	 */
	sizes?: string;
}

/**
 * Imagen del catálogo (R2 vía /api/images/...) con estado de carga y error:
 * skeleton animado mientras carga y fallback si falla (404, red, etc.), sin
 * romper el layout del contenedor.
 *
 * Va sobre `next/image` y no sobre un `<img>` nativo para obtener el `srcset`
 * responsive y la conversión de formato del optimizador: una foto de producto
 * de 2000px servida tal cual a un móvil de 390px es ~5x el peso necesario. El
 * binding `IMAGES` de `wrangler.jsonc` es lo que hace ese trabajo en Workers.
 *
 * No depende solo del evento `load`: si la imagen ya estaba en caché y el
 * navegador la cargó antes de que React adjuntara el listener (por ejemplo
 * durante la hidratación), el evento se pierde y el skeleton quedaría
 * visible para siempre. Por eso, tras el montaje y ante cada cambio de
 * `src`, se reconcilia el estado con `img.complete` / `img.naturalWidth`.
 */
export function RemoteImage({
	src,
	alt,
	containerClassName,
	imgClassName,
	skeletonClassName,
	eager = false,
	fallback,
	sizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw",
}: RemoteImageProps) {
	const [loaded, setLoaded] = useState(false);
	const [failed, setFailed] = useState(false);
	const imgRef = useRef<HTMLImageElement | null>(null);

	useEffect(() => {
		const img = imgRef.current;
		if (!img) return;

		if (img.complete) {
			// Ya terminó (caché o falló antes de hidratar): resolvemos con
			// naturalWidth para distinguir éxito de error.
			setLoaded(img.naturalWidth > 0);
			setFailed(img.naturalWidth === 0);
		} else {
			// Nueva fuente aún en carga → skeleton hasta que dispare load/error.
			setLoaded(false);
			setFailed(false);
		}
	}, [src]);

	return (
		<div className={cn("relative overflow-hidden", containerClassName)}>
			{!loaded && !failed && (
				<div
					aria-hidden="true"
					className={cn(
						"absolute inset-0 animate-pulse bg-soft-pink/70",
						skeletonClassName
					)}
				/>
			)}

			{failed ? (
				fallback ?? (
					<div
						role="img"
						aria-label={alt}
						className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-1.5 bg-soft-pink text-muted-foreground"
					>
						<ImageOffIcon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
						<span className="px-2 text-center font-body text-[9px] font-medium leading-tight tracking-[0.15em] uppercase">
							Imagen no disponible
						</span>
					</div>
				)
			) : (
				<Image
					ref={imgRef}
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					loading={eager ? "eager" : "lazy"}
					onLoad={() => {
						setLoaded(true);
						setFailed(false);
					}}
					onError={() => {
						setLoaded(false);
						setFailed(true);
					}}
					className={cn("object-cover", imgClassName)}
				/>
			)}
		</div>
	);
}