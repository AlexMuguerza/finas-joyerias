import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Debe coincidir con `advanced.cookiePrefix` de src/lib/auth.ts; si no, el
// middleware nunca encuentra la cookie de sesión (busca "better-auth.session_token"
// por defecto) y redirige al login en bucle aun con sesión válida.
const COOKIE_PREFIX = "finas-joyeria";

/**
 * Protege rutas privadas en el edge (sin tocar la BD): el panel de admin.
 * El catálogo, `/api/images` y `/carrito` son públicos — el carrito vive en
 * localStorage (`src/lib/cart.ts`), no hay API de carrito que proteger.
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
 *
 * TODO(migración a proxy.ts): Next.js 16 marca `middleware.ts` como
 * deprecado y avisa en cada `next build`. La convención nueva es `proxy.ts`,
 * pero se ejecuta en el runtime de Node.js y `@opennextjs/cloudflare` sigue
 * exigiendo Edge middleware, así que renombrarlo rompe el despliegue.
 * Revisar en https://github.com/opennextjs/opennextjs-cloudflare/issues cuando
 * haya soporte de `proxy.ts`; hasta entonces el aviso del build es esperado.
 */
export function middleware(request: NextRequest) {
	if (getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX })) {
		return NextResponse.next();
	}

	// Páginas: redirige a la ruta única de autenticación conservando el destino
	// original, para que el login devuelva al usuario donde quería ir.
	const loginUrl = new URL("/auth/login", request.url);
	loginUrl.searchParams.set(
		"next",
		request.nextUrl.pathname + request.nextUrl.search
	);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	// Solo el panel. `/api/cart/:path*` estaba aquí desde que el carrito se
	// planteó sincronizado en servidor, pero esa ruta nunca existió: el carrito
	// vive en localStorage (`src/lib/cart.ts`). Mantenerla sugería una API
	// protegida que no hay, y hacía que la rama de 401 de abajo fuera código
	// muerto.
	matcher: ["/admin/:path*"],
};
