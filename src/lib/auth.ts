import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb } from "@/db";
import { v7 as uuidv7 } from "uuid";

export interface AuthEnv {
	DATABASE_URL: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
}

export function createAuth(env: AuthEnv) {
	return betterAuth({
		appName: "Finas Joyería",
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(createDb(env.DATABASE_URL), { provider: "pg" }),
		trustedOrigins: [
			env.BETTER_AUTH_URL,
			// Orígenes de desarrollo local (evita 403 “Invalid origin” si el
			// puerto del dev server cambia).
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		],
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false
		},
		plugins: [
			// Modelo de roles: solo "admin" y "user". El hook de creación asigna
			// "user" por defecto; el admin se crea explícitamente (seed o
			// setRole) con rol "admin".
			admin({ defaultRole: "user" }),
		],
		advanced: {
			cookiePrefix: "finas-joyeria",
			database: {
				generateId: () => uuidv7(),
			},
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;

let cachedAuth: Auth | null = null;

/**
 * Singleton de better-auth. Se crea de forma diferida para que
 * `getCloudflareContext()` solo se ejecute dentro de una petición
 * (dev con `initOpenNextCloudflareForDev` o worker en producción).
 */
export function getAuth(): Auth {
	if (!cachedAuth) {
		const env = getCloudflareContext().env;
		cachedAuth = createAuth({
			DATABASE_URL: env.DATABASE_URL,
			BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
			BETTER_AUTH_URL: env.BETTER_AUTH_URL,
		});
	}
	return cachedAuth;
}