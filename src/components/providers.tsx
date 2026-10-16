"use client";

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<Toaster theme="light" richColors position="bottom-right" />
		</>
	);
}
