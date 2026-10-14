"use client";

// Solo cliente: usa `useSyncExternalStore` para distinguir el render del
// servidor del primer render hidratado, que es una distinción que solo
// tiene sentido en el navegador.
import "client-only";

import { useSyncExternalStore } from "react";

/**
 * `true` solo después de hidratar en el cliente.
 *
 * Sustituye al clásico `const [mounted, setMounted] = useState(false)` +
 * `useEffect(() => setMounted(true), [])`. Ese patrón provocaba un render
 * adicional en cascada en cada componente que lo usaba (el badge del carrito,
 * el carrito completo, el menú móvil del header) y eslint lo marca como
 * `react-hooks/set-state-in-effect`.
 *
 * `useSyncExternalStore` es la primitiva que React recomienda para leer un
 * estado externo que solo existe en el cliente: durante el render del servidor
 * devuelve `getServerSnapshot()` y en el cliente `getSnapshot()`, sin efectos
 * ni setState.
 *
 * Úsalo para leer `localStorage` o cualquier valor que no exista en SSR y
 * solo cuando renderizarlo en el servidor produciría un desajuste de
 * hidratación.
 */

// Nunca hay cambios: la suscripción existe solo para cumplir el contrato de
// `useSyncExternalStore`.
const subscribe = () => () => {};

export function useIsMounted(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false
	);
}
