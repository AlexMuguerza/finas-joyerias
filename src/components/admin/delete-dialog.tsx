"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteDialog({
	id,
	title = "¿Eliminar?",
	description = "Esta acción no se puede deshacer.",
	confirmLabel = "Eliminar",
	action,
}: {
	id: string;
	title?: string;
	description?: string;
	confirmLabel?: string;
	action: (formData: FormData) => Promise<void> | void;
}) {
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			await action(formData);
			setOpen(false);
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="ghost" size="sm" className="text-destructive" />
				}
			>
				<Trash2Icon />
				{confirmLabel}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
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