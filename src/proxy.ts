import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Protege rutas privadas en el edge (sin tocar la BD): carrito y panel de
 * admin. El catálogo y /api/images son públicos.
 *
 * Nota: este chequeo es ligero (solo verifica que exista la cookie de
 * sesión). La validación real se hace en el servidor: el layout del panel
 * exige rol admin y cada server action usa `getUserSession()`/`getAdminSession()`
 * — una cookie presente no garantiza que la sesión siga siendo válida ni
 * que el usuario tenga el rol correcto.
 */
export function proxy(request: NextRequest) {
	if (getSessionCookie(request)) {
		return NextResponse.next();
	}

	// Rutas API: respondemos 401 y el cliente decide qué mostrar
	// (p. ej. abrir el login o un toast "Inicia sesión para continuar").
	if (request.nextUrl.pathname.startsWith("/api/")) {
		return NextResponse.json(
			{ error: "Se requiere iniciar sesión", code: "UNAUTHORIZED" },
			{ status: 401 }
		);
	}

	// Páginas: redirige a la ruta única de autenticación conservando el destino original.
	const loginUrl = new URL("/auth/login", request.url);
	loginUrl.searchParams.set(
		"next",
		request.nextUrl.pathname + request.nextUrl.search
	);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: ["/admin/:path*", "/api/cart/:path*", "/carrito/:path*"],
};