import { NotFoundView } from "@/components/not-found-view";

/**
 * 404 para llamadas a `notFound()` dentro del segmento de la tienda (por
 * ejemplo, un slug de producto que ya no existe). Se sitúa aquí, y no solo en
 * la raíz, para que herede el header y el footer del layout del segmento.
 */
export default function StoreNotFound() {
	return <NotFoundView />;
}
