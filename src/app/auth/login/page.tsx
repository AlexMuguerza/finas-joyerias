import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { resolvePostAuth } from "@/lib/auth-redirect";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

/**
 * Ruta canónica de autenticación global (tienda + admin).
 *
 * - `/auth/login` → pestaña de inicio de sesión
 * - `/auth/login?mode=register` → pestaña de registro
 * - `/auth/register` es un alias que redirige aquí con `?mode=register`
 *
 * El destino tras autenticarse lo decide el rol (resolvePostAuth): un
 * usuario con rol "user" nunca aterriza en /admin/* aunque `next` lo pida.
 */
export default async function AuthLoginPage({
	searchParams,
}: {
	searchParams: Promise<{ mode?: string; next?: string }>;
}) {
	const session = await getAuth().api.getSession({ headers: await headers() });
	const { mode, next } = await searchParams;

	// Ya autenticado: no mostrar el formulario, enviar según rol.
	if (session) {
		redirect(resolvePostAuth(session.user.role, next));
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
			<AuthForm mode={mode} next={next} />
		</div>
	);
}
