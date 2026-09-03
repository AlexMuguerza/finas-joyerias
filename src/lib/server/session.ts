import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

/**
 * Devuelve la sesión si el usuario autenticado tiene rol de administrador,
 * o `null` en caso contrario. Úsalo para proteger server actions y páginas.
 */
export async function getAdminSession() {
	const session = await getAuth().api.getSession({ headers: await headers() });
	if (!session || session.user.role !== "admin") {
		return null;
	}
	return session;
}

/**
 * Devuelve la sesión si hay un usuario autenticado (cualquier rol), o
 * `null` en caso contrario. Úsalo en las server actions del carrito:
 * el middleware solo comprueba la cookie; aquí se valida la sesión real.
 */
export async function getUserSession() {
	const session = await getAuth().api.getSession({ headers: await headers() });
	if (!session) {
		return null;
	}
	return session;
}