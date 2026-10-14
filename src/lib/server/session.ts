// Solo servidor: lee la sesión desde `next/headers` y consulta la BD.
import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

/**
 * Sesión de la petición actual, deduplicada.
 *
 * `cache()` de React deduplica las llamadas dentro del mismo render/request.
 * Sin esto, cargar `/admin/usuarios` consultaba la sesión **tres veces**: la del
 * layout del panel, la de la propia page y la de `countAdminUsers` (que
 * revalida rol) — tres idas a la BD por una sola visita.
 *
 * El scope de `cache()` es la petición, así que no existe riesgo de que la
 * sesión de un usuario se reutilice en la de otro.
 *
 * Todos los que necesiten leer la sesión deben pasar por aquí en vez de llamar
 * a `getAuth().api.getSession()` directamente.
 */
export const getSession = cache(async () => {
	return getAuth().api.getSession({ headers: await headers() });
});

/**
 * Devuelve la sesión si el usuario autenticado tiene rol de administrador,
 * o `null` en caso contrario. Úsalo para proteger server actions y páginas.
 */
export async function getAdminSession() {
	const session = await getSession();
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
	const session = await getSession();
	if (!session) {
		return null;
	}
	return session;
}
