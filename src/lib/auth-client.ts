"use client";

// Solo cliente: contraparte de `lib/auth.ts`. Este módulo habla con
// `/api/auth/*` desde el navegador, así que importarlo desde un Server
// Component sería un error (y arrastraría el cliente de better-auth al grafo
// del servidor). Este import hace que falle el build en ese caso.
import "client-only";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [adminClient()],
});