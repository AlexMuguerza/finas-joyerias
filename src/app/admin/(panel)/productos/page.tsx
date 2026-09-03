import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { formatDate, formatPrice } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ProductDialog } from "@/components/admin/product-dialog";
import { ImageThumbnail } from "@/components/admin/image-thumbnail";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { deleteProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
	const db = getDb();

	const [rows, categoryOptions] = await Promise.all([
		db
			.select({
				id: products.id,
				name: products.name,
				slug: products.slug,
				description: products.description,
				price: products.price,
				categoryId: products.categoryId,
				categoryName: categories.name,
				imageKey: images.key,
				createdAt: products.createdAt,
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.leftJoin(images, eq(images.id, products.imageId))
			.orderBy(desc(products.createdAt)),
		db
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.name)),
	]);

	// Las imágenes se sirven a través del worker (R2 no es público) y las
	// cachea Cloudflare: /api/images/<key>.
	const rowsWithImage = rows.map((row) => ({
		...row,
		imageUrl: row.imageKey ? `/api/images/${row.imageKey}` : null,
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-heading text-2xl font-semibold">Productos</h1>
					<p className="text-sm text-muted-foreground">
						{rowsWithImage.length} producto
						{rowsWithImage.length === 1 ? "" : "s"}
					</p>
				</div>
				<ProductDialog categories={categoryOptions} />
			</div>

			<Card>
				<CardContent className="pt-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Imagen</TableHead>
								<TableHead>Nombre</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead>Precio</TableHead>
								<TableHead>Creado</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rowsWithImage.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-8 text-center text-muted-foreground"
									>
										Aún no hay productos. Crea el primero con el botón
										&quot;Nuevo producto&quot;.
									</TableCell>
								</TableRow>
							) : (
								rowsWithImage.map((row) => (
									<TableRow key={row.id}>
										<TableCell>
											<ImageThumbnail
												src={row.imageUrl}
												alt={row.name}
												description="Imagen del producto"
											/>
										</TableCell>
										<TableCell>
											<div className="font-medium">{row.name}</div>
											<div className="text-xs text-muted-foreground">
												{row.slug}
											</div>
										</TableCell>
										<TableCell>{row.categoryName ?? "—"}</TableCell>
										<TableCell>{formatPrice(row.price)}</TableCell>
										<TableCell>{formatDate(row.createdAt)}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<ProductDialog
													categories={categoryOptions}
													product={{
														id: row.id,
														name: row.name,
														slug: row.slug,
														description: row.description,
														price: row.price,
														categoryId: row.categoryId,
														imageKey: row.imageKey,
														imageUrl: row.imageUrl,
													}}
													trigger={{
														label: "Editar",
														icon: "pencil",
														variant: "ghost",
														size: "sm",
													}}
												/>
												<DeleteDialog
													id={row.id}
													title="¿Eliminar producto?"
													description={`Se eliminará "${row.name}". Esta acción no se puede deshacer.`}
													action={deleteProduct}
												/>
											</div>
										</TableCell>
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
