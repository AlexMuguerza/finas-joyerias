"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemoteImageProps {
	src: string;
	alt: string;
	/** Clases del contenedor (define el tamaño/posición: "absolute inset-0", "h-full w-full", "h-10 w-10"...). */
	containerClassName?: string;
	/** Clases extra del <img> (transformaciones, hover scale, object-contain...). */
	imgClassName?: string;
	/** Clases extra del skeleton. */
	skeletonClassName?: string;
	/** Carga sin lazy (imágenes above-the-fold). */
	eager?: boolean;
	/** Contenido alternativo si la imagen falla (por defecto: icono + texto). */
	fallback?: React.ReactNode;
}

/**
 * Imagen remota (R2 vía /api/images/...) con estado de carga y error:
 * muestra un skeleton animado mientras carga y un fallback si falla
 * (404, red, etc.), sin romper el layout del contenedor.
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
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					ref={imgRef}
					src={src}
					alt={alt}
					loading={eager ? "eager" : "lazy"}
					onLoad={() => {
						setLoaded(true);
						setFailed(false);
					}}
					onError={() => {
						setLoaded(false);
						setFailed(true);
					}}
					className={cn("h-full w-full object-cover", imgClassName)}
				/>
			)}
		</div>
	);
}
