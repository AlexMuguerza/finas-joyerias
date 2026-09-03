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

interface AdminUser {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	banned?: boolean | null;
	createdAt?: Date | string | null;
}

export function UsersTable({ currentUserId }: { currentUserId: string }) {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		const res = await authClient.admin.listUsers({ query: { limit: 100 } });
		setLoading(false);
		if (res.error) {
			setError(res.error.message ?? "Error al cargar los usuarios");
			return;
		}
		setUsers(res.data?.users ?? []);
		setError(null);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	async function changeRole(userId: string, role: "admin" | "user") {
		const res = await authClient.admin.setRole({ userId, role });
		if (res.error) {
			toast.error(res.error.message ?? "Error al cambiar el rol");
			return;
		}
		toast.success("Rol actualizado");
		load();
	}

	async function toggleBan(userId: string, banned: boolean) {
		const res = banned
			? await authClient.admin.unbanUser({ userId })
			: await authClient.admin.banUser({
					userId,						banReason: "Baneado por un administrador",
				});
		if (res.error) {
			toast.error(res.error.message ?? "Error al actualizar el estado");
			return;
		}
		toast.success(banned ? "Usuario desbaneado" : "Usuario baneado");
		load();
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-heading text-2xl font-semibold">Usuarios</h1>
				<p className="text-sm text-muted-foreground">
					Gestiona roles, baneos y cuentas.
				</p>
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