import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getAuth().api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/auth/login?next=/admin");
	}
	if (session.user.role !== "admin") {
		redirect("/");
	}

	return (
		<AdminShell
			user={{ name: session.user.name, email: session.user.email }}
		>
			{children}
		</AdminShell>
	);
}