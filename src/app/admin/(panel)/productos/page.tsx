import { asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { categories, images, products } from "@/db/schema";
import { imageUrl } from "@/lib/server/media";
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
import { AdminPagination } from "@/components/admin/pagination";
import { deleteProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const params = await searchParams;

	// `count` aparte del `limit`: hace falta el total real para saber cuántas
	// páginas hay y para el "Mostrando X–Y de Z".
	const totalRow = await getDb()
		.select({ total: count(products.id) })
		.from(products);
	const totalProducts = totalRow[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

	// Una página fuera de rango (URL editada a mano, o última página tras borrar
	// productos) se recorta en vez de renderizar una tabla vacía: un listado
	// "sin productos" cuando sí los hay confunde más que un 404.
	const requested = Number.parseInt(params.page ?? "1", 10);
	const page = Number.isFinite(requested) ? Math.min(Math.max(1, requested), totalPages) : 1;

	const [rows, categoryOptions] = await Promise.all([
		getDb()
			.select({
				id: products.id,
				name: products.name,
				slug: products.slug,
				description: products.description,
				price: products.price,
				sku: products.sku,
				categoryId: products.categoryId,
				categoryName: categories.name,
				imageKey: images.key,
				createdAt: products.createdAt,
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.leftJoin(images, eq(images.id, products.imageId))
			.orderBy(desc(products.createdAt))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE),
		getDb()
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.name)),
	]);

	// Las imágenes se sirven a través del worker (R2 no es público) y las
	// cachea Cloudflare: /api/images/<key>.
	const rowsWithImage = rows.map((row) => ({
		...row,
		imageUrl: imageUrl(row.imageKey),
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-heading text-2xl font-semibold">Productos</h1>
					<p className="text-sm text-muted-foreground">
						{totalProducts} producto{totalProducts === 1 ? "" : "s"}
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
								<TableHead>SKU</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead>Precio</TableHead>
								<TableHead>Creado</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{/* El "vacío" se decide por el total, no por las filas de esta
							    página: con paginación, una página fuera de rango tendría 0
							    filas sin que el catálogo estuviera vacío. */}
							{totalProducts === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
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
										<TableCell className="font-mono text-xs">
											{row.sku}
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
													sku: row.sku,
													categoryId: row.categoryId,
														imageKey: row.imageKey,
														imageUrl: row.imageUrl,
													}}
													trigger={{
														label: "",
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

			<AdminPagination
				basePath="/admin/productos"
				searchParams={params}
				page={page}
				totalItems={totalProducts}
				pageSize={PAGE_SIZE}
			/>
		</div>
	);
}
