import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Debe coincidir con `advanced.cookiePrefix` de src/lib/auth.ts; si no, el
// middleware nunca encuentra la cookie de sesión (busca "better-auth.session_token"
// por defecto) y redirige al login en bucle aun con sesión válida.
const COOKIE_PREFIX = "finas-joyeria";

/**
 * Protege rutas privadas en el edge (sin tocar la BD): carrito y panel de
 * admin. El catálogo y /api/images son públicos.
 *
 * Nota: Next.js 16 ejecuta `proxy.ts` en runtime Node.js, que opennext-cloudflare
 * no soporta todavía (exige Edge middleware). Por eso este archivo se llama
 * `middleware.ts` (convención legacy que sigue corriendo en Edge) con el mismo
 * comportamiento.
 *
 * Este chequeo es ligero (solo verifica que exista la cookie de sesión). La
 * validación real se hace en el servidor: el layout del panel exige rol admin
 * y cada server action usa `getUserSession()`/`getAdminSession()` — una cookie
 * presente no garantiza que la sesión siga siendo válida ni que el usuario
 * tenga el rol correcto.
 */
export function middleware(request: NextRequest) {
	if (getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX })) {
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