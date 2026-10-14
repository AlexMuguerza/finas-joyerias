import { getAdminSession } from "@/lib/server/session";
import { UsersTable } from "@/components/admin/users-table";
import { countAdminUsers } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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
		/>
	);
}
