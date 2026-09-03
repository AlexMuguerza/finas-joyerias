import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
	const session = await getAuth().api.getSession({ headers: await headers() });
	return <UsersTable currentUserId={session?.user.id ?? ""} />;
}