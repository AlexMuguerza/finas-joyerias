"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	deleteCategory,
	deleteProduct,
	type AdminActionState,
} from "@/app/admin/actions";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export type DeleteTarget = "category" | "product";

/**
 * Modal de borrado con confirmación.
 *
 * **Por qué importa este componente y no un `onClick` en la página:** las
 * Server Actions de catálogo se importan **aquí**, en un componente cliente, no
 * en la página. Cuando la Server Component las importa y se las pasa como
 * prop, Turbopack no las mete en el grafo de cliente, no les genera ID y el
 * POST responde `Failed to find Server Action "<hash>"`: el botón no hace nada
 * y no hay error visible. `CategoryDialog` y `ProductDialog` ya lo hacen así.
 *
 * El borrado de usuarios no entra por aquí porque va por `authClient`, no por
 * Server Action; ese caso recibe `action`.
 */
export function DeleteDialog({
	id,
	target,
	title = "¿Eliminar?",
	description = "Esta acción no se puede deshacer.",
	confirmLabel = "Eliminar",
	action,
}: {
	id: string;
	/** Entidad de catálogo: borra con la Server Action importada arriba. */
	target?: DeleteTarget;
	title?: string;
	description?: string;
	confirmLabel?: string;
	/** Borrado que no es Server Action (usuarios va por `authClient`). */
	action?: (formData: FormData) => Promise<AdminActionState | void>;
}) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const run = target
		? target === "category"
			? deleteCategory
			: deleteProduct
		: action;

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!run) return;
		const formData = new FormData(event.currentTarget);
		setError(null);
		startTransition(async () => {
			// La acción devuelve `AdminActionState`: sin esto, un borrado
			// rechazado (sin sesión admin, fila ya borrada) cerraba el diálogo
			// como si hubiera funcionado y el panel no decía nada.
			const state = await run(formData);
			if (state?.error) {
				setError(state.error);
				return;
			}
			setOpen(false);
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setError(null);
			}}
		>
			<DialogTrigger
				render={<Button variant="ghost" size="sm" className="text-destructive" />}
			>
				<Trash2Icon />
				{confirmLabel}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<DialogFooter>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setOpen(false)}
						disabled={pending}
					>
						Cancelar
					</Button>
					<form onSubmit={handleSubmit}>
						<input type="hidden" name="id" value={id} />
						<Button
							type="submit"
							variant="destructive"
							size="sm"
							disabled={pending}
						>
							{pending ? "Eliminando…" : confirmLabel}
						</Button>
					</form>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}