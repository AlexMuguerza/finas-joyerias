import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { ImageThumbnail } from "@/components/admin/image-thumbnail";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { deleteCategory } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
	const db = getDb();

	const rows = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			description: categories.description,
			imageKey: images.key,
			productCount: count(products.id),
			createdAt: categories.createdAt,
		})
		.from(categories)
		.leftJoin(images, eq(images.id, categories.imageId))
		.leftJoin(products, eq(products.categoryId, categories.id))
		.groupBy(categories.id, images.key)
		.orderBy(asc(categories.name));

	// Las imágenes se sirven a través del worker (R2 no es público) y las
	// cachea Cloudflare: /api/images/<key>.
	const rowsWithImage = rows.map((row) => ({
		...row,
		imageUrl: row.imageKey
			? `/api/images/${row.imageKey}`
			: null,
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-heading text-2xl font-semibold">Categorías</h1>
					<p className="text-sm text-muted-foreground">
						{rowsWithImage.length} categoría
						{rowsWithImage.length === 1 ? "" : "s"}
					</p>
				</div>
				<CategoryDialog />
			</div>

			<Card>
				<CardContent className="pt-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Imagen</TableHead>
								<TableHead>Nombre</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Productos</TableHead>
								<TableHead>Creada</TableHead>
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
										Aún no hay categorías.
									</TableCell>
								</TableRow>
							) : (
								rowsWithImage.map((row) => (
									<TableRow key={row.id}>
										<TableCell>												<ImageThumbnail
													src={row.imageUrl}
													alt={row.name}
													description="Imagen de la categoría"
												/>
										</TableCell>
										<TableCell className="font-medium">{row.name}</TableCell>
										<TableCell className="text-muted-foreground">
											{row.slug}
										</TableCell>
										<TableCell>{row.productCount}</TableCell>
										<TableCell>{formatDate(row.createdAt)}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<CategoryDialog
													category={{
														id: row.id,
														name: row.name,
														slug: row.slug,
														description: row.description,
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
													title="¿Eliminar categoría?"
													description={`Se eliminará "${row.name}" junto con sus productos. Esta acción no se puede deshacer.`}
													action={deleteCategory}
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