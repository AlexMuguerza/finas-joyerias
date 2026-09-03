/**
 * Helper puro para decidir el destino post-autenticación por rol.
 * Se usa tanto en el servidor (páginas) como en el cliente (formulario).
 *
 * Reglas:
 * - `next` solo se respeta si es una ruta interna (empieza con "/", no "//",
 *   y no apunta a /auth para evitar ciclos).
 * - Un usuario con rol "user" nunca puede aterrizar en /admin/* aunque el
 *   `next` lo pida: en ese caso cae en "/".
 * - Sin `next` seguro: admin → /admin, cualquier otro → /.
 */
export function resolvePostAuth(
	role: string | null | undefined,
	next?: string | null
): string {
	const safeNext =
		next &&
		next.startsWith("/") &&
		!next.startsWith("//") &&
		!next.startsWith("/auth")
			? next
			: null;

	if (role === "admin") return safeNext ?? "/admin";
	if (safeNext && !safeNext.startsWith("/admin")) return safeNext;
	return "/";
}
