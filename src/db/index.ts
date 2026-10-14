// Solo servidor: abre la conexión a Neon con la URL de la BD, que llega del
// contexto de Cloudflare.
import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle({ client: sql, schema });
}

export type Database = ReturnType<typeof createDb>;
