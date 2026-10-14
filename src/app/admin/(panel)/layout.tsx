import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getAdminSession();

	if (!session) {
		// El caso habitual (sin cookie de sesión) lo cubre el middleware, que
		// sí conoce la ruta pedida y la reenvía como `next`.
		//
		// Aquí llegamos con cookie presente pero sesión inválida (expirada o
		// revocada), y un layout de App Router no conoce su propia ruta: no
		// recibe params y no hay un header fiable para ella (`referer` apunta a
		// la página anterior, no a la actual). Por eso el destino es `/admin` en
		// lugar de intentar adivinar la ruta perdida.
		//
		// `getAdminSession()` también cubre el rol: aquí antes se comparaba a mano
		// contra "admin", con el riesgo de que las dos comprobaciones se
		// desincronizasen.
		redirect("/auth/login?next=/admin");
	}

	return (
		<AdminShell
			user={{ name: session.user.name, email: session.user.email }}
		>
			{children}
		</AdminShell>
	);
}
