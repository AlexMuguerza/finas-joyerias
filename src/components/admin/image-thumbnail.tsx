"use client";

import { useState } from "react";
import { ImageOffIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { RemoteImage } from "@/components/remote-image";

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
				<RemoteImage
					src={src}
					alt={alt}
					containerClassName="h-10 w-10"
					fallback={
						<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
							<ImageOffIcon className="h-4 w-4" strokeWidth={1.5} />
						</div>
					}
				/>
			</button>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{alt}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<RemoteImage
					src={src}
					alt={alt}
					containerClassName="w-full"
					imgClassName="max-h-[70vh] w-full rounded-lg object-contain"
					eager
				/>
			</DialogContent>
		</Dialog>
	);
}
