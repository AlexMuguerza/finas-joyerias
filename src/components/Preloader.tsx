"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Logo from "@/assets/logo-sin-fondo.png";

/**
 * Pantalla de carga de la landing. Se muestra **una sola vez por sesión** del
 * navegador.
 *
 * Antes se reproducía en cada visita a `/`: `HomeContent` es el componente de
 * esa página, así que al navegar a `/carrito` y volver se desmontaba y se
 * montaba de nuevo, devolviendo `isLoading` a `true`. El contador vive en
 * `sessionStorage`, que sobrevive a la navegación del cliente y se reinicia al
 * cerrar la pestaña.
 *
 * Sobre la detección: durante el render del servidor y el de la hidratación
 * `getServerSnapshot` devuelve `false` (el preloader se pinta, igual que
 * siempre) y solo después de hidratar React relee con `getSnapshot`, que ya
 * puede consultar `sessionStorage`. Así el HTML del servidor y el primer render
 * del cliente coinciden y no hay desajuste de hidratación.
 */
const PRELOADER_STORAGE_KEY = "finas-joyeria-preloader";

// Suscripción no-op: la bandera solo cambia cuando este mismo componente la
// escribe, y para entonces ya no hace falta volver a leerla.
const subscribe = () => () => {};

function hasAlreadyPlayed(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.sessionStorage.getItem(PRELOADER_STORAGE_KEY) === "done";
	} catch {
		// Modo privado o almacenamiento bloqueado: se muestra siempre, que es
		// el fallo degradado aceptable.
		return false;
	}
}

function markAsPlayed(): void {
	try {
		window.sessionStorage.setItem(PRELOADER_STORAGE_KEY, "done");
	} catch {
		// Sin persistencia se volverá a mostrar en la próxima visita.
	}
}

const EXIT_DURATION_MS = 600;

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
	const alreadyPlayed = useSyncExternalStore(
		subscribe,
		hasAlreadyPlayed,
		() => false
	);
	const [phase, setPhase] = useState<"playing" | "exiting" | "done">("playing");
	const [progress, setProgress] = useState(0);

	// `onComplete` se guarda en un ref para no depender de su identidad: quien
	// lo pasa suele crear la función en línea (`() => setIsLoading(false)`),
	// y si fuera una dependencia del efecto, un rerender cualquiera reiniciaría
	// el progreso a 0.
	const onCompleteRef = useRef(onComplete);
	useEffect(() => {
		onCompleteRef.current = onComplete;
	});

	// El progreso vive en un ref y el estado solo guarda el valor pintado:
	// avanzar el contador desde dentro de un updater de `setState` programa
	// temporizadores como efecto secundario, y en StrictMode el updater se
	// invoca dos veces (duplicando temporizadores).
	const progressRef = useRef(0);

	// `onComplete` se llama una sola vez aunque el efecto vuelva a dispararse:
	// al terminar se escribe la bandera, así que en el render siguiente
	// `alreadyPlayed` pasa a `true` y el efecto se ejecuta otra vez.
	const notifiedRef = useRef(false);
	const notify = () => {
		if (notifiedRef.current) return;
		notifiedRef.current = true;
		onCompleteRef.current();
	};

	useEffect(() => {
		if (alreadyPlayed) {
			// Ya se vio en esta sesión: salir de inmediato, sin animación. Sin
			// esto la navegación de vuelta a `/` reproducía el preloader entero.
			notify();
			return;
		}

		const timers: Array<ReturnType<typeof setTimeout>> = [];

		const finish = () => {
			markAsPlayed();
			setPhase("done");
			notify();
		};

		const step = () => {
			progressRef.current = Math.min(progressRef.current + 2, 100);
			setProgress(progressRef.current);

			if (progressRef.current < 100) {
				timers.push(setTimeout(step, 30));
				return;
			}
			timers.push(
				setTimeout(() => {
					setPhase("exiting");
					timers.push(setTimeout(finish, EXIT_DURATION_MS));
				}, 300)
			);
		};

		timers.push(setTimeout(step, 30));

		// Se limpian también los temporizadores anidados: si el usuario navega
		// durante la carga, `setState` ya no debe ejecutarse sobre un
		// componente desmontado.
		return () => {
			for (const timer of timers) clearTimeout(timer);
		};
		}, [alreadyPlayed]);

	// La visibilidad se deriva en vez de guardarse en estado: cuando el
	// preloader ya se mostró en esta sesión, `alreadyPlayed` basta para
	// mantenerlo fuera sin necesidad de un `setPhase("done")` en el efecto.
	const showPreloader = !alreadyPlayed && phase !== "done";

	return (
		<AnimatePresence>
			{showPreloader && (
				<motion.div
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: EXIT_DURATION_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
					className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
					role="status"
					aria-live="polite"
					aria-label="Cargando página"
				>
					{/* Logo */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
						className="text-center"
					>
						<Image
							src={Logo}
							alt="Finas Joyería"
							width={150}
							height={150}
							className="h-37 w-auto"
							priority
						/>
					</motion.div>

					{/* Progress Line */}
					<div className="w-40 h-px bg-border/50 overflow-hidden mt-10">
						<motion.div
							initial={{ width: "0%" }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.1, ease: "linear" }}
							className="h-full bg-primary"
						/>
					</div>

					{/* Loading Text */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.5 }}
						transition={{ delay: 0.5 }}
						className="mt-6 text-[10px] text-text-body font-light tracking-[0.2em] uppercase"
					>
						Cargando
					</motion.p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
