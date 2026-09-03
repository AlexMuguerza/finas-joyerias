export function formatDate(value: Date | string | null | undefined): string {
	if (!value) return "—";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("es-PE", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function formatPrice(value: string | number | null | undefined): string {
	if (value === null || value === undefined || value === "") return "—";
	const number = typeof value === "string" ? Number(value) : value;
	if (Number.isNaN(number)) return "—";
	return new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
	}).format(number);
}