"use client";

import { useState, useTransition } from "react";
import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

/** Mínimo que exige better-auth por defecto; el mismo que usa `auth-form`. */
const MIN_PASSWORD_LENGTH = 8;

type Role = "admin" | "user";

/**
 * Modal para crear un usuario desde el panel.
 *
 * Usa `authClient.admin.createUser` (endpoint `/admin/create-user`) en lugar de
 * un server action, por coherencia con el resto de `UsersTable`, que gestiona
 * roles, baneos y borrados por el cliente. Ese endpoint exige sesión válida y
 * el permiso `user:create`, así que el control de acceso no depende de que el
 * botón esté oculto.
 *
 * El usuario nace con sesión activa al instante: la app tiene
 * `requireEmailVerification: false` y no hay ningún flujo de verificación, así
 * que la contraseña es la única credencial.
 */
export function UserDialog({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<Role>("user");
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function reset() {
		setName("");
		setEmail("");
		setPassword("");
		setRole("user");
		setError(null);
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) reset();
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedName = name.trim();
		const trimmedEmail = email.trim();
		const trimmedPassword = password;

		if (!trimmedName) {
			setError("El nombre es obligatorio");
			return;
		}
		if (!trimmedEmail) {
			setError("El correo es obligatorio");
			return;
		}
		// Validación mínima en cliente: better-auth es la autoridad y devuelve su
		// propio error si el correo está mal formado, pero evita un viaje de ida
		// y vuelta por algo que ya sabemos.
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			setError("El correo no tiene un formato válido");
			return;
		}
		if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
			setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
			return;
		}
		setError(null);

		startTransition(async () => {
			const res = await authClient.admin.createUser({
				name: trimmedName,
				email: trimmedEmail,
				password: trimmedPassword,
				role,
			});

			if (res.error) {
				// El código de better-auth para "ya existe" es el mismo que usa
				// `auth-form`, así que reutilizamos el mismo texto que ve el
				// usuario en el registro público.
				const isDuplicate =
					res.error.code === "USER_ALREADY_EXISTS" ||
					res.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";
				setError(
					isDuplicate
						? "Ya existe una cuenta con este correo."
						: (res.error.message ?? "No se pudo crear el usuario")
				);
				return;
			}

			toast.success(`Usuario ${trimmedName} creado`);
			setOpen(false);
			reset();
			onCreated();
		});
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button onClick={() => setOpen(true)}>
				<UserPlusIcon />
				Nuevo usuario
			</Button>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nuevo usuario</DialogTitle>
					<DialogDescription>
						Crea una cuenta directamente. Podrá iniciar sesión de
						inmediato, sin verificación por correo.
					</DialogDescription>
				</DialogHeader>

				<form
					id="user-dialog-form"
					onSubmit={handleSubmit}
					// `noValidate` desactiva los globos nativos del navegador. Sin
					// esto, `required`, `minLength` y `type="email"` bloquean el
					// evento `submit` antes de que se ejecute `handleSubmit`, y los
					// mensajes que este pinta nunca aparecen: el admin pulsa
					// "Crear usuario" y no ocurre nada, sin explicación. Los
					// atributos se conservan para el lector de pantalla.
					noValidate
					className="grid gap-4"
				>
					<div className="grid gap-2">
						<Label htmlFor="user-name">Nombre *</Label>
						<Input
							id="user-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							autoComplete="off"
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="user-email">Correo *</Label>
						<Input
							id="user-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							autoComplete="off"
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="user-password">Contraseña *</Label>
						<Input
							id="user-password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							// Se sugiere nueva: evita que el navegador rellene la del
							// admin que está creando al usuario.
							autoComplete="new-password"
							minLength={MIN_PASSWORD_LENGTH}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Mínimo {MIN_PASSWORD_LENGTH} caracteres.
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="user-role">Rol</Label>
						<Select
							items={[
								{ value: "user", label: "user" },
								{ value: "admin", label: "admin" },
							]}
							value={role}
							onValueChange={(value) =>
								setRole(value === "admin" ? "admin" : "user")
							}
						>
							<SelectTrigger id="user-role" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user" label="user">
									user
								</SelectItem>
								<SelectItem value="admin" label="admin">
									admin
								</SelectItem>
							</SelectContent>
						</Select>
						{role === "admin" && (
							<p className="text-xs text-muted-foreground">
								Tendrá acceso completo al panel de administración.
							</p>
						)}
					</div>

					{error && (
						<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setOpen(false)}
						disabled={pending}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						form="user-dialog-form"
						size="sm"
						disabled={pending}
					>
						{pending ? "Creando…" : "Crear usuario"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
