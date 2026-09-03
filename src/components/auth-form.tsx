"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resolvePostAuth } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type Mode = "login" | "register";

function errorMessage(error: { code?: string; message?: string }): string {
	switch (error.code) {
		case "INVALID_EMAIL_OR_PASSWORD":
			return "Correo o contraseña incorrectos.";
		case "USER_ALREADY_EXISTS":
		case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
			return "Ya existe una cuenta con este correo.";
		case "PASSWORD_TOO_SHORT":
			return "La contraseña debe tener al menos 8 caracteres.";
		default:
			return error.message || "Ocurrió un error inesperado.";
	}
}

/**
 * Login/registro global de la app (tienda + admin). Las pestañas cambian
 * el searchParam `mode` de la URL, así `/auth/login`, `/auth/login?mode=register`
 * y el alias `/auth/register` son la misma página con distinta pestaña activa.
 */
export function AuthForm({
	mode: initialMode,
	next,
}: {
	mode?: string;
	next?: string;
}) {
	const router = useRouter();
	const [mode, setMode] = useState<Mode>(initialMode === "register" ? "register" : "login");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Si la URL cambia (back/forward o deep link), sincroniza la pestaña activa.
	useEffect(() => {
		setMode(initialMode === "register" ? "register" : "login");
	}, [initialMode]);

	function switchMode(nextMode: Mode) {
		setMode(nextMode);
		setError(null);
		const params = new URLSearchParams();
		if (nextMode === "register") params.set("mode", "register");
		if (next) params.set("next", next);
		const qs = params.toString();
		router.replace(qs ? `/auth/login?${qs}` : "/auth/login");
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const form = new FormData(event.currentTarget);
		const email = String(form.get("email") ?? "").trim();
		const password = String(form.get("password") ?? "");

		try {
			if (mode === "login") {
				const { data, error: err } = await authClient.signIn.email({
					email,
					password,
				});
				if (err) {
					setError(errorMessage(err));
					return;
				}
				const role = data?.user?.role;
				router.push(resolvePostAuth(role, next));
				router.refresh();
				return;
			}

			// Registro: con requireEmailVerification:false, better-auth crea la
			// sesión en el mismo sign-up (no hace falta un segundo login).
			const name = String(form.get("name") ?? "").trim();
			const { data, error: err } = await authClient.signUp.email({
				name,
				email,
				password,
			});
			if (err) {
				setError(errorMessage(err));
				return;
			}
			const role = data?.user?.role ?? "user";
			router.push(resolvePostAuth(role, next));
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="font-heading text-xl">
					{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
				</CardTitle>
				<CardDescription>
					{mode === "login"
						? "Accede a tu cuenta para continuar tus compras o gestionar la tienda."
						: "Regístrate para hacer tus pedidos. Es gratis."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Tabs: cambian el modo y mantienen la URL como fuente de verdad */}
				<div
					className="mb-5 grid grid-cols-2 rounded-lg bg-muted p-1"
					role="tablist"
					aria-label="Autenticación"
				>
					<button
						type="button"
						role="tab"
						aria-selected={mode === "login"}
						onClick={() => switchMode("login")}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
							mode === "login"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						Iniciar sesión
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === "register"}
						onClick={() => switchMode("register")}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
							mode === "register"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						Crear cuenta
					</button>
				</div>

				<form onSubmit={handleSubmit} className="grid gap-4">
					{mode === "register" && (
						<div className="grid gap-2">
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="Tu nombre"
								required
								autoComplete="name"
							/>
						</div>
					)}
					<div className="grid gap-2">
						<Label htmlFor="email">Correo</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="tu@correo.com"
							required
							autoComplete="email"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minLength={8}
							autoComplete={
								mode === "login" ? "current-password" : "new-password"
							}
						/>
					</div>
					{error && (
						<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}
					<Button type="submit" disabled={loading} className="w-full">
						{loading
							? mode === "login"
								? "Ingresando…"
								: "Creando cuenta…"
							: mode === "login"
								? "Ingresar"
								: "Crear cuenta"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
