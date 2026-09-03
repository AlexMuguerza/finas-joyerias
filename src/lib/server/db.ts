import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Database } from "@/db";

let cachedDb: Database | null = null;

/**
 * Singleton de la base de datos. Se crea de forma diferida para que
 * `getCloudflareContext()` solo se ejecute dentro de una petición.
 */
export function getDb(): Database {
	if (!cachedDb) {
		cachedDb = createDb(getCloudflareContext().env.DATABASE_URL);
	}
	return cachedDb;
}