"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, PencilIcon, PlusIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
	createProduct,
	getProductUploadUrl,
	updateProduct,
} from "@/app/admin/actions";

export interface CategoryOption {
	id: string;
	name: string;
}

export interface ProductDialogData {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	price: string;
	categoryId: string;
	imageKey: string | null;
	imageUrl: string | null;
}

const TRIGGER_ICONS = {
	pencil: PencilIcon,
	plus: PlusIcon,
} as const;

type TriggerIconName = keyof typeof TRIGGER_ICONS;

interface TriggerProps {
	label: string;
	icon?: TriggerIconName;
	variant?: React.ComponentProps<typeof Button>["variant"];
	size?: React.ComponentProps<typeof Button>["size"];
	className?: string;
}

export function ProductDialog({
	categories,
	product,
	trigger,
}: {
	categories: CategoryOption[];
	product?: ProductDialogData;
	trigger?: TriggerProps;
}) {
	const isEdit = Boolean(product);
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(
		product?.imageUrl ?? null
	);
	const [name, setName] = useState(product?.name ?? "");
	const [slug, setSlug] = useState(product?.slug ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [price, setPrice] = useState(product?.price ?? "");
	const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	function reset() {
		if (file && preview) URL.revokeObjectURL(preview);
		setFile(null);
		setPreview(product?.imageUrl ?? null);
		setName(product?.name ?? "");
		setSlug(product?.slug ?? "");
		setDescription(product?.description ?? "");
		setPrice(product?.price ?? "");
		setCategoryId(product?.categoryId ?? "");
		setError(null);
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) reset();
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const selected = event.target.files?.[0] ?? null;
		if (file && preview) URL.revokeObjectURL(preview);
		setFile(selected);
		setPreview(selected ? URL.createObjectURL(selected) : product?.imageUrl ?? null);
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedName = name.trim();
		const trimmedPrice = price.trim();

		if (!trimmedName) {
			setError("El nombre es obligatorio");
			return;
		}
		if (!trimmedPrice || Number.isNaN(Number(trimmedPrice)) || Number(trimmedPrice) < 0) {
			setError("Ingresa un precio válido");
			return;
		}
		if (!categoryId) {
			setError("Selecciona una categoría");
			return;
		}
		if (!isEdit && !file) {
			setError("Selecciona una imagen");
			return;
		}
		setError(null);

		startTransition(async () => {
			const data = new FormData();
			if (product) data.set("id", product.id);
			data.set("name", trimmedName);
			data.set("slug", slug);
			data.set("description", description);
			data.set("price", trimmedPrice);
			data.set("categoryId", categoryId);

			// Si hay imagen nueva (o es creación): presign + subida directa.
			if (file) {
				const presign = await getProductUploadUrl(
					trimmedName,
					slug,
					file.name,
					file.type || "application/octet-stream"
				);
				if ("error" in presign) {
					setError(presign.error);
					return;
				}
				// Usa el slug que el servidor resolvió (el mismo que quedó en la key).
				data.set("slug", presign.slug);

				try {
					const upload = await fetch(presign.presignedUrl, {
						method: "PUT",
						body: file,
					});
					if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`);
				} catch {
					setError("No se pudo subir la imagen. Inténtalo de nuevo.");
					return;
				}

				data.set("imageKey", presign.key);
			}

			// Todo o nada: si algo falla en el servidor, limpia imagen + R2.
			const actionState = isEdit
				? await updateProduct(null, data)
				: await createProduct(null, data);

			if (actionState?.error) {
				setError(actionState.error);
				return;
			}
			if (actionState?.fieldErrors) {
				setError(
					Object.values(actionState.fieldErrors)[0] ?? "Revisa los datos"
				);
				return;
			}

			setOpen(false);
			reset();
			router.refresh();
		});
	}

	const TriggerIcon = trigger?.icon ? TRIGGER_ICONS[trigger.icon] : undefined;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{trigger ? (
				<Button
					variant={trigger.variant}
					size={trigger.size}
					className={trigger.className}
					onClick={() => setOpen(true)}
				>
					{TriggerIcon && <TriggerIcon />}
					{trigger.label}
				</Button>
			) : (
				<Button onClick={() => setOpen(true)}>
					<PlusIcon />
					Nuevo producto
				</Button>
			)}

			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Editar producto" : "Nuevo producto"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "La imagen se sube a R2 solo si eliges una nueva."
							: "Selecciona una imagen y completa los datos. La imagen se sube directamente a R2."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label>Imagen</Label>
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted"
							>
								{preview ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={preview}
										alt="Vista previa"
										className="h-full w-full object-cover"
									/>
								) : (
									<ImageIcon className="size-6 text-muted-foreground" />
								)}
							</button>
							<div className="grid gap-1">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
								>
									<UploadIcon />
									{isEdit ? "Cambiar imagen" : "Elegir imagen"}
								</Button>
								<p className="text-xs text-muted-foreground">
									{file
										? file.name
										: isEdit
											? "Se mantiene la imagen actual si no eliges una nueva"
											: "PNG, JPG o WebP"}
								</p>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileChange}
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="name">Nombre *</Label>
						<Input
							id="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="slug">Slug</Label>
						<Input
							id="slug"
							value={slug}
							onChange={(event) => setSlug(event.target.value)}
							placeholder="se genera desde el nombre si se deja vacío"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description">Descripción</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="price">Precio (S/) *</Label>
							<Input
								id="price"
								type="number"
								step="0.01"
								min="0"
								value={price}
								onChange={(event) => setPrice(event.target.value)}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label>Categoría *</Label>
							<Select
								value={categoryId}
								onValueChange={(value) => setCategoryId(value ?? "")}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Selecciona…" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{error && (
						<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}

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
						<Button type="submit" size="sm" disabled={pending}>
							{pending
								? "Subiendo…"
								: isEdit
									? "Guardar cambios"
									: "Guardar"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
