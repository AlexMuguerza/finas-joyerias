"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function ImageThumbnail({
	src,
	alt,
	description = "Imagen",
}: {
	src: string | null;
	alt: string;
	description?: string;
}) {
	const [open, setOpen] = useState(false);

	if (!src) {
		return (
			<div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
				—
			</div>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<button
				type="button"
				onClick={() => setOpen(true)}
				title="Ver imagen"
				className="block overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={src} alt={alt} className="h-10 w-10 object-cover" />
			</button>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{alt}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={src}
					alt={alt}
					className="max-h-[70vh] w-full rounded-lg object-contain"
				/>
			</DialogContent>
		</Dialog>
	);
}
