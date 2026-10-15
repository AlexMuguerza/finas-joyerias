import { getAdminSession } from "@/lib/server/session";
import { UsersTable } from "@/components/admin/users-table";
import { countAdminUsers } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const params = await searchParams;

	// La página viaja por la URL para poder reutilizar el mismo paginador que
	// el catálogo de productos, en vez de mantener estado en el cliente.
	const requested = Number.parseInt(params.page ?? "1", 10);
	const page = Number.isFinite(requested) ? Math.max(1, requested) : 1;

	// Ambos leen la sesión, pero `getSession()` va envuelto en `cache()` de
	// React: dentro de la misma petición la consulta se hace una sola vez.
	const [session, adminCount] = await Promise.all([
		getAdminSession(),
		countAdminUsers(),
	]);
	return (
		<UsersTable
			currentUserId={session?.user.id ?? ""}
			adminCount={adminCount}
			page={page}
			searchParams={params}
		/>
	);
}
