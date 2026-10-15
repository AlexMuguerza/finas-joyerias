import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración de las pruebas de interfaz.
 *
 * `webServer` apunta al servidor ya levantado en el puerto 3000 y no lo
 * reinicia (`reuseExistingServer`), que es lo cómodo al desarrollar. En CI,
 * donde no hay servidor, Playwright arranca `pnpm dev` él mismo.
 *
 * El proyecto es `server-only` en casi todo lo que toca la base de datos, así
 * que las pruebas son de caja negra contra el HTML renderizado: no hay forma
 * razonable de instanciar el DAL fuera de un request de Next.
 */
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "line" : [["list"]],

	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "mobile",
			// El menú móvil y el badge del carrito son superficies críticas en
			// móvil: la mayoría de las visitas llegan desde un teléfono.
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: "pnpm dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});