import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Se pasa una función diferida: `getAuth()` (que necesita el contexto de
// Cloudflare) solo se ejecuta cuando llega una petición real, manteniendo
// el módulo seguro para builds/prerenders.
export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler((request) =>
	getAuth().handler(request)
);