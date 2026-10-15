"use client";

import { useEffect } from "react";

/**
 * Frontera de error del layout raíz: sustituye al `layout.tsx` completo, así
 * que aquí no puede usarse nada del árbol de la app (ni `Providers`, ni
 * `Toaster`). Solo styles inline y sus propias `<html>`/`<body>`.
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("[app] error global:", error);
	}, [error]);

	return (
		<html lang="es">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#fdf8f9",
					color: "#2a2426",
					fontFamily: "system-ui, sans-serif",
					padding: "1.5rem",
				}}
			>
				<div style={{ maxWidth: "28rem", textAlign: "center" }}>
					<h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
						Algo se rompió por completo
					</h1>
					<p style={{ fontSize: "0.875rem", lineHeight: 1.6, opacity: 0.7, margin: 0 }}>
						Vuelve a cargar la página. Si el problema continúa, escríbenos.
					</p>
					{error.digest && (
						<p
							style={{
								fontFamily: "monospace",
								fontSize: "0.6875rem",
								opacity: 0.5,
								marginTop: "1rem",
							}}
						>
							Referencia: {error.digest}
						</p>
					)}
					<button
						type="button"
						onClick={reset}
						style={{
							marginTop: "1.5rem",
							padding: "0.625rem 1.5rem",
							fontSize: "0.6875rem",
							letterSpacing: "0.2em",
							textTransform: "uppercase",
							color: "#fff",
							background: "#2a2426",
							border: "none",
							cursor: "pointer",
						}}
					>
						Reintentar
					</button>
				</div>
			</body>
		</html>
	);
}
