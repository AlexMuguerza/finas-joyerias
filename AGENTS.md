# AGENTS.md

Instrucciones para cualquier agente que trabaje en este repositorio.
Léelo **antes** de tocar código.

---

## 0. Entorno: el servidor ya está corriendo

> **El proyecto se levanta en el puerto 3000 y lo mantiene el usuario.**

- **No arranques otro servidor.** No abras un `next start -p 3123`, ni un
  `next dev` en otro puerto, ni un `wrangler dev`. Choca con el suyo y deja
  procesos zombis.
- Para comprobar cualquier cosa, `curl http://localhost:3000/<ruta>`.
- El `webServer` de `playwright.config.ts` usa `reuseExistingServer`, así que
  las pruebas se conectan al 3000 sin lanzar nada.
- Si necesitas reiniciarlo, **pídelo**, no lo hagas por tu cuenta.
- **No corras `pnpm build` con el dev levantado.** Los dos escriben en
  `.next/`. El build de producción se lleva por delante `server/`, `static/` y
  los manifiestos, el dev se queda con su manifiesto de Server Actions en
  memoria, y cada acción responde `Failed to find Server Action "…"` — parece
  un bug del panel y no lo es. Se arregla reiniciando el dev.
- Para comprobar una clase nueva, **compila el CSS y mira el resultado** en vez
  de asumirlo: `pnpm build` genera `.next/static/chunks/*.css` y un `grep` del
  `.text-heading` o `.shadow-soft` dice si la utilidad existe de verdad.

---

## 1. Comandos

```bash
pnpm dev              # servidor en :3000 (ya suele estar en marcha)
pnpm lint             # eslint plano
pnpm typecheck        # tsc --noEmit
pnpm check            # lint + typecheck  -> ejecutar ANTES de dar algo por terminado
pnpm build            # build de producción
pnpm test:e2e         # Playwright (móvil + escritorio)
pnpm test:e2e:ui      # Playwright con visor interactivo
pnpm db:generate      # genera migración (NO la apliques sin permiso)
pnpm db:push          # APLICA cambios de schema. Pedir permiso explícito antes.
pnpm deploy           # build + deploy a Cloudflare
```

**Regla:** tras cualquier cambio, `pnpm check` limpio y, si tocaste rutas o
componentes visibles, `pnpm test:e2e`.

---

## 2. Despliegue

Cloudflare despliega **solo** al hacer push a `main`. La rama de trabajo es
`dev`, que **no tiene upstream**: nada llega a GitHub hasta que alguien hace
`git push -u origin dev`.

Nunca hagas `git commit` ni `git push` sin que te lo pidan.

### Variables que el worker necesita

En `next dev` vienen de `.dev.vars`. **El worker desplegado no las hereda**: las
faltan y el panel lo nota.

| Variable | Dónde | Para qué |
|---|---|---|
| `R2` (binding) | `wrangler.jsonc` | **leer** imágenes |
| `CLOUDFLARE_ACCOUNT_ID` | `wrangler.jsonc` → `vars` | firmar la subida contra la API S3 |
| `R2_BUCKET_NAME` | `wrangler.jsonc` → `vars` | ídem |
| `R2_ACCESS_KEY_ID` | `wrangler secret put` | ídem |
| `R2_SECRET_ACCESS_KEY` | `wrangler secret put` | ídem |

Leer y subir no necesitan lo mismo: la lectura va por el binding, pero la subida
**solo** se puede prefirmar contra la API S3. Con las cuatro ausente, el panel
responde "Subida de imágenes no configurada en el servidor" y el detalle de
qué falta sale en los logs del worker.

---

## 3. Arquitectura: la capa de acceso a datos

```
src/
├─ app/
│  ├─ (store)/          Rutas públicas: landing, catálogo, categorías, carrito
│  ├─ admin/            Panel
│  │  ├─ (panel)/       Layout del panel + sus error/loading
│  │  └─ actions.ts     Server Actions: SOLO validan y delegan
│  └─ sitemap.xml/      Route Handler
├─ components/          Componentes de UI
├─ db/
│  ├─ schema.ts         Definición Drizzle
│  └─ migrations/
└─ lib/
   ├─ server/           ← DAL. Solo servidor.
   │  ├─ db.ts          Singleton de Neon
   │  ├─ products.ts    Lecturas de producto
   │  ├─ categories.ts  Lecturas de categoría
   │  ├─ admin.ts       Escrituras + autorización del panel
   │  ├─ media.ts       imageUrl() y constantes compartidas
   │  ├─ r2.ts          Cliente de R2
   │  ├─ session.ts     Sesión (con cache() de React)
   │  └─ sku.ts         Generación y validación de SKU
   ├─ cart.ts           Carrito (localStorage) — client-only
   ├─ whatsapp.ts       Teléfono y enlaces de WhatsApp
   └─ slug.ts           resolveSlug()
```

### Reglas del DAL (no negociables)

1. **Una consulta compartida vive en un solo sitio.** `PRODUCT_SELECT`, el
   mapper a `ShopProduct`, `imageUrl()` y `SEVEN_DAYS_MS` están en el DAL
   porque estaban duplicados en 5, 4, 9 y 3 ficheros respectivamente. Si
   necesitas un dato que ya existe, **importa**; no lo reescribas.

2. **El DAL lanza, la página decide.** No captures errores dentro de
   `lib/server/*`. Qué hacer con un fallo de base de datos es una decisión de
   presentación, y **cambia según la ruta**:

   | Ruta | Ante un fallo de BD |
   |---|---|
   | `/shop`, `/categorias` | Degradar a lista vacía **con aviso visible** |
   | `/productos/[slug]` | **Propagar** al `error.tsx`. Nunca `notFound()` |
   | Panel admin | **Propagar**. Una tabla vacía se lee como "no tienes productos" |

   Un 404 en `/productos/[slug]` por un fallo de Neon mentiría sobre la
   existencia del producto y podría hacer que Google lo desindexe.

3. **La autorización vive en el DAL**, no en los bordes:
   `requireAdmin()` dentro de cada operación de `admin.ts`. Es el patrón de la
   [guía de seguridad de Next.js](https://nextjs.org/docs/app/guides/data-security).
   `actions.ts` no debe llamar a `getAdminSession()`.

4. **`actions.ts` es delgado.** Solo: leer `FormData` → validar → llamar al
   DAL → mapear el resultado → `revalidatePath` / `redirect`. Si metes un
   `db.select` ahí, vuelve al DAL.

5. **Nada de `try/catch` en las acciones.** El DAL devuelve
   `MutationResult` (`{ ok: true }` / `{ ok: false, reason }`). El mapeo de
   `reason` a mensaje vive en `toState()`.

6. **Las Server Actions se importan en el componente *cliente* que las usa,
   nunca en la página.** Si una Server Component las importa y se las pasa como
   prop a un Client Component, Turbopack no las mete en el grafo de cliente, no
   les genera ID y el POST responde `Failed to find Server Action "<hash>"`: el
   botón no hace nada y no sale ningún error. Se comprueba mirando
   `.next/dev/server/**/server-reference-manifest.json` — la acción que falta ahí
   es la que falla — y en `.next/dev/static/`, donde solo aparece lo que algún
   componente cliente importa. `DeleteDialog` por eso recibe `target`, no la
   acción.

7. **`import "server-only"`** en todo lo de `lib/server/`. Los marcadores
   `server-only` / `client-only` están puestos a propósito: el build falla si se
   cruza la frontera.

### Consultas de un solo uso

Se quedan inline en la página. Envolver en el DAL una consulta que solo usa
un sitio añade indirección sin reutilización. Hoy son dos: la lista paginada
del panel de productos y la proyección con `createdAt` del panel de categorías.

---

## 4. Frontmatter: proyecto base-nova de shadcn

`components.json` usa el estilo **`base-nova`**, que es `@base-ui/react`, **no
Radix**. Por eso los componentes usan `render={<Link/>}` en vez de `asChild`.

```bash
pnpm dlx shadcn@latest add <componente>
```

Dos avisos, porque ya han pasado:

- El CLI pregunta si sobrescribe archivos existentes. **Di `n`**: los del
  proyecto ya están adaptados.
- El componente descargado puede importar de un paquete homónimo (pasó con
  `cn`). Si ves `import { cn } from "cn"`, cámbialo a `@/lib/utils` y
  **desinstala el paquete** que el CLI haya añadido por error.

Los componentes de `components/ui/` son código de terceros: no los edites sin
motivo, se sobrescriben al actualizar.

---

## 5. Imágenes

- **Todas pasan por `/api/images/<key>`** (R2 no tiene dominio público).
  Construye la URL con `imageUrl()` de `lib/server/media.ts`, nunca a mano.
- **`imageUrl()` devuelve una URL ABSOLUTA, y es deliberado.** El optimizador
  (`/_next/image`) del worker resuelve las rutas relativas contra el binding
  `ASSETS`, que solo sirve ficheros estáticos de `.open-next/assets`:
  `/api/images/[...key]` es una route handler, no un fichero, así que en
  relativo daba 404 en producción y funcionaba en `next dev`. En absoluto,
  OpenNext lo pide por `fetch()` global y `global_fetch_strictly_public` lo
  reintroduce por la puerta de delante del worker. Por eso `next.config.ts`
  necesita `remotePatterns` con el propio origen.
- **El origen del sitio vive solo en `src/lib/site.ts`** (`SITE_ORIGIN`), no
  repetido en `metadataBase`, el sitemap o `remotePatterns`.
- **`RemoteImage` es el componente único.** Envuelve `next/image` y añade
  skeleton y fallback a 404, que `next/image` solo no da.
- **`fill` exige altura en el contenedor.** Un contenedor tipo `w-full` sin
  altura colapsa a 0 px y la imagen desaparece. Ya pasó en el lightbox del
  panel: usa `aspect-[4/3]`.
- **Declara `sizes`** en imágenes grandes: sin eso el navegador descarga
  candidatos del tamaño de la pantalla y se pierde el ahorro.
- `next.config.ts` declara `formats: ["image/avif", "image/webp"]` y un único
  `remotePattern`: el propio `/api/images/**`. No hay imágenes externas.

---

## 6. Errores y carga

`error.tsx` y `loading.tsx` existen en `(store)`, `(store)/productos/[slug]`
y `admin/(panel)`. Si añades una ruta que consulta la BD, necesita las dos
cosas: sin estado de carga se ve el salto de layout, y sin frontera de error
un fallo de Neon devuelve la página genérica de Next.

---

## 7. Pruebas

Playwright cubre móvil y escritorio (`tests/`). Son de caja negra contra el
HTML renderizado: casi todo el código es `server-only`.

Al añadir una prueba:

- **`await` las promesas dentro de `expect`.** `expect(promise)` compara el
  objeto `Promise`, no el valor.
- `notFound()` dentro de una página con streaming devuelve **200**, no 404.
  Comprueba la UI; el 404 real solo existe para rutas sin matchear.
- Los chips de filtro son `<button>`, no enlaces: no busques `categoria=` en
  el HTML.
- El menú de la **landing** usa anclas a sección (botones); el de la **tienda**
  tiene enlaces de ruta reales.

---

## 8. Tipografía y color

- **Dos familias, ni una más.** Cormorant Garamond (`--font-heading`) y
  Montserrat (`--font-body`), servidas por `next/font` desde el propio dominio.
  No enlaces Google Fonts a mano ni añadas una tercera familia.
- **Pesos:** solo `300` (`font-light`), `400`, `500` (`font-medium`) y `600`
  (`font-semibold`), más la itálica de Cormorant. Declarar un peso que nadie
  usa es un fichero extra en la descarga de todo el mundo.
- **Nada de tamaños arbitrarios.** No escribas `text-[10px]`: la escala está en
  `@theme` y son `text-eyebrow` (11px) y `text-label` (12px), con
  `tracking-eyebrow` (0.3em) y `tracking-label` (0.15em). El patrón completo es
  `text-eyebrow tracking-eyebrow font-medium uppercase`.
- **`text-primary` es para rellenos, no para escribir encima.** `#D4849C` sobre
  crema da 2.6:1 y el mínimo AA es 4.5:1. Para texto —eyebrows, enlaces,
  itálicas, iconos— usa `text-primary-strong`. Para texto blanco encima de un
  relleno rosado, `bg-primary-strong`.
- **Los tokens que se usan tienen que existir en `@theme`.** Tailwind solo
  genera la utilidad si el token está mapeado ahí: `--shadow-*` sin mapear
  (pasó con `shadow-soft`) y `--color-heading` mal nombrado (pasó con
  `text-heading`) producen clases que no existen y el estilo se pierde en
  silencio. Compila y compruébalo.

---

## 9. Cosas que no debes romper

| Regla | Por qué |
|---|---|
| `Disallow: /api` **con `Allow: /api/images`** | R2 no tiene dominio público: sin esa excepción las fotos de producto quedan fuera de Google Images |
| `middleware.ts`, no `proxy.ts` | Next 16 ejecuta `proxy.ts` en Node y `@opennextjs/cloudflare` aún exige Edge |
| No tocar `products.sku` a `NOT NULL` en la BD sin permiso | El schema ya lo declara; la BD sigue nullable hasta que se aplique la migración |
| `v7()` para los ids | Ordenables por tiempo |
| Un único `Date.now()` por render | La marca "Nuevo" compara contra la ventana de 7 días; dos `now` desincronizan filtro y etiqueta |
| Nada de contenido detrás de un `opacity: 0` que dependa de JS | Framer-motion escribe los estilos iniciales **en el HTML**: sin JS el texto no se ve y Google lo indexa como una página vacía. Hubo un `Preloader` que montaba la landing entera así |

---

## 10. Commits

Conventional Commits en **español**: `fix:`, `feat:`, `chore:`.

El cuerpo explica **por qué**, no **qué**: qué se ve en el diff. Si un cambio
introduce un tradeoff o arregla algo que no era evidente, va en el mensaje.