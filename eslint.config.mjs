// ESLint flat config.
//
// `eslint-config-next@16` ya exporta arrays de flat config nativos (no un
// shareable config de eslintrc), así que se importan directamente. Usar
// `FlatCompat` sobre ellos rompía ESLint con
// "TypeError: Converting circular structure to JSON" (los plugins ya
// resueltos contienen referencias circulares que `Compat` no sabe aplanar).
//
// Nota: `next lint` se eliminó en Next.js 16; el script `lint` invoca
// `eslint .` directamente.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
	{
		ignores: [
			// Carpetas de skills/agentes: plantillas y ejemplos de terceros que
			// no forman parte de la app (evitan ~115 falsos positivos).
			".agents/**",
			".freebuff/**",
			".next/**",
			".open-next/**",
			".wrangler/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
			"cloudflare-env.d.ts",
			"drizzle.config.ts",
			"open-next.config.ts",
			"next.config.ts",
		],
	},
	...nextCoreWebVitals,
	...nextTypeScript,
];

export default eslintConfig;
