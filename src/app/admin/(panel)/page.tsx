import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products, user } from "@/db/schema";
import { formatDate, formatPrice } from "@/lib/format";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
	const db = getDb();

	const [userCount, productCount, categoryCount, imageCount] = await Promise.all([
		db.select({ value: count() }).from(user),
		db.select({ value: count() }).from(products),
		db.select({ value: count() }).from(categories),
		db.select({ value: count() }).from(images),
	]);

	const recentProducts = await db
		.select({
			id: products.id,
			name: products.name,
			price: products.price,
			categoryName: categories.name,
			createdAt: products.createdAt,
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.orderBy(desc(products.createdAt))
		.limit(5);

	const stats = [
		{ label: "Usuarios", value: userCount[0]?.value ?? 0, href: "/admin/usuarios" },
		{ label: "Productos", value: productCount[0]?.value ?? 0, href: "/admin/productos" },
		{ label: "Categorías", value: categoryCount[0]?.value ?? 0, href: "/admin/categorias" },
		{ label: "Imágenes", value: imageCount[0]?.value ?? 0, href: null },
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					Resumen general de la tienda.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.label} size="sm">
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{stat.href ? (
								<Link
									href={stat.href}
									className="font-heading text-3xl font-semibold text-foreground transition-colors hover:text-primary"
								>
									{stat.value}
								</Link>
							) : (
								<span className="font-heading text-3xl font-semibold">
									{stat.value}
								</span>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Productos recientes</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead>Precio</TableHead>
								<TableHead>Creado</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentProducts.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-8 text-center text-muted-foreground"
									>
										Aún no hay productos. Crea el primero desde la sección
										{" "}
										<Link
											href="/admin/productos"
											className="text-primary hover:underline"
										>
											Productos
										</Link>
									</TableCell>
								</TableRow>
							) : (
								recentProducts.map((product) => (
									<TableRow key={product.id}>
										<TableCell className="font-medium">{product.name}</TableCell>
										<TableCell>{product.categoryName ?? "—"}</TableCell>
										<TableCell>{formatPrice(product.price)}</TableCell>
										<TableCell>{formatDate(product.createdAt)}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}