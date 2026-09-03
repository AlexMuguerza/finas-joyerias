import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Alias de `/auth/login?mode=register`: si alguien entra directo a
 * /auth/register, se redirige a la única ruta de autenticación con la
 * pestaña de registro activa (todo el estado vive en /auth/login).
 */
export default async function AuthRegisterPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string }>;
}) {
	const { next } = await searchParams;
	const params = new URLSearchParams();
	params.set("mode", "register");
	if (next) params.set("next", next);
	redirect(`/auth/login?${params.toString()}`);
}
