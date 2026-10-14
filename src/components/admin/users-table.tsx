"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BanIcon, UnlockIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DeleteDialog } from "./delete-dialog";
import { UserDialog } from "./user-dialog";

interface AdminUser {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	banned?: boolean | null;
	createdAt?: Date | string | null;
}

export function UsersTable({
	currentUserId,
	adminCount,
}: {
	currentUserId: string;
	adminCount: number;
}) {
	const [users, setUsers] = useState<AdminUser[]>([]);
	// El primer `load()` ya arranca con `loading: true` (estado inicial), así
	// que no hace falta ponerlo aquí: eso provocaba un setState síncrono en el
	// efecto de montaje y un render extra innecesario.
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Único admin en el sistema: su selector de rol queda bloqueado.
	const isLastAdmin = adminCount <= 1;

	const load = useCallback(async () => {
		const res = await authClient.admin.listUsers({ query: { limit: 100 } });
		if (res.error) {
			setLoading(false);
			setError(res.error.message ?? "Error al cargar los usuarios");
			return;
		}
		setUsers(res.data?.users ?? []);
		setLoading(false);
		setError(null);
	}, []);

	// El fetch inicial vive en el efecto (y no en `load`) para poder ignorar
	// la respuesta si el componente se desmonta antes de que llegue: antes,
	// navegar fuera durante la carga llamaba a `setState` sobre un componente
	// desmontado. `load` se reutiliza para refrescar tras cada mutación.
	useEffect(() => {
		let ignore = false;

		(async () => {
			const res = await authClient.admin.listUsers({ query: { limit: 100 } });
			if (ignore) return;
			if (res.error) {
				setError(res.error.message ?? "Error al cargar los usuarios");
				setLoading(false);
				return;
			}
			setUsers(res.data?.users ?? []);
			setLoading(false);
			setError(null);
		})();

		return () => {
			ignore = true;
		};
	}, []);

	async function changeRole(userId: string, role: "admin" | "user") {
		// Bloqueo duro: degradar al único admin deja el panel inaccesible
		// para siempre (no hay ruta de recuperación desde la UI). `adminCount`
		// lo cuenta el servidor, no se deduce de la lista paginada.
		if (role === "user" && adminCount <= 1) {
			toast.error(
				"No puedes quitar el rol de admin al único administrador. Crea otro admin primero."
			);
			return;
		}
		const res = await authClient.admin.setRole({ userId, role });
		if (res.error) {
			toast.error(res.error.message ?? "Error al cambiar el rol");
			return;
		}
		toast.success("Rol actualizado");
		load();
	}

	async function toggleBan(userId: string, banned: boolean) {
		// Banear al único admin también deja el panel sin acceso.
		if (!banned && isLastAdmin) {
			toast.error(
				"No puedes banear al único administrador. Crea o promueve otro admin primero."
			);
			return;
		}

		if (banned) {
			const res = await authClient.admin.unbanUser({ userId });
			if (res.error) {
				toast.error(res.error.message ?? "Error al actualizar el estado");
				return;
			}
			toast.success("Usuario desbaneado");
			load();
			return;
		}

		const res = await authClient.admin.banUser({
			userId,
			banReason: "Baneado por un administrador",
		});
		if (res.error) {
			toast.error(res.error.message ?? "Error al actualizar el estado");
			return;
		}

		// Importante: `banUser` solo bloquea la *creación* de sesiones nuevas
		// (better-auth lo aplica en un hook `session.create.before`; verificado
		// en el código del plugin, `banned` no aparece en ningún punto de la
		// lectura de sesión). Sin revocar explícitamente, un usuario baneado
		// seguía con su sesión actual perfectamente válida hasta que expirara,
		// y el botón "Banear` daba una falsa sensación de cierre inmediato.
		const revoke = await authClient.admin.revokeUserSessions({ userId });
		if (revoke.error) {
			// El ban ya se aplicó: se avisa del Partial en lugar de fingir que
			// no pasó nada, para que el admin sepa que puede cerrar sesión
			// manualmente si hace falta.
			toast.error(
				"El ban se aplicó, pero no se pudieron cerrar las sesiones activas."
			);
			load();
			return;
		}

		toast.success("Usuario baneado y sesión cerrada");
		load();
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="font-heading text-2xl font-semibold">Usuarios</h1>
					<p className="text-sm text-muted-foreground">
						Gestiona roles, baneos y cuentas.
					</p>
					{isLastAdmin && (
						<p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
							Eres el único administrador. Crea o promueve otro admin
							antes de cambiar o eliminar esta cuenta, o el panel
							quedará sin acceso.
						</p>
					)}
				</div>
				{/* Se recarga la lista tras crear para que el usuario nuevo
				    aparezca sin recargar la página a mano. */}
				<UserDialog onCreated={load} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium text-muted-foreground">
						{loading ? "Cargando…" : `${users.length} usuarios`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{error ? (
						<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Usuario</TableHead>
									<TableHead>Rol</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Creado</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.length === 0 && !loading ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="py-8 text-center text-muted-foreground"
										>
											No hay usuarios registrados
										</TableCell>
									</TableRow>
								) : (
									users.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<div className="font-medium">{item.name}</div>
												<div className="text-xs text-muted-foreground">
													{item.email}
												</div>
											</TableCell>
											<TableCell>
												{item.id === currentUserId ? (
													<Badge variant="secondary">{item.role ?? "user"}</Badge>
												) : (
													<Select
														value={item.role ?? "user"}
														onValueChange={(value) =>
															changeRole(item.id, value as "admin" | "user")
														}
														disabled={isLastAdmin && item.role === "admin"}
													>
														<SelectTrigger size="sm" className="h-7 w-24">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="admin">admin</SelectItem>
															<SelectItem value="user">user</SelectItem>
														</SelectContent>
													</Select>
												)}
											</TableCell>
											<TableCell>
												{item.banned ? (
													<Badge variant="destructive">Baneado</Badge>
												) : (
													<Badge variant="secondary">Activo</Badge>
												)}
											</TableCell>
											<TableCell>{formatDate(item.createdAt)}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													{item.id === currentUserId ? null : (
														<>
															{item.banned ? (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => toggleBan(item.id, true)}
																>
																	<UnlockIcon />
																	Desbanear
																</Button>
															) : (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => toggleBan(item.id, false)}
																>
																	<BanIcon />
																	Banear
																</Button>
															)}
															<DeleteDialog
																id={item.id}
																title="¿Eliminar usuario?"
																description={`Se eliminará la cuenta de ${item.name} (${item.email}) y todas sus sesiones. Esta acción no se puede deshacer.`}
																confirmLabel="Eliminar"
																action={async () => {
																	if (isLastAdmin) {
																		toast.error(
																			"No puedes eliminar al único administrador. Crea o promueve otro admin primero."
																		);
																		return;
																	}
																	const res = await authClient.admin.removeUser({
																		userId: item.id,
																	});
																	if (res.error) {
																		toast.error(
																			res.error.message ?? "Error al eliminar"
																		);
																		return;
																	}
																	toast.success("Usuario eliminado");
																	load();
																}}
															/>
														</>
													)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
