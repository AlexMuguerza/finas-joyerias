import { NotFoundView } from "@/components/not-found-view";

/**
 * 404 para URLs que no matchean ninguna ruta (`/lo-que-sea`). Este nivel no
 * hereda layouts de segmento, solo el `layout.tsx` raíz.
 */
export default function NotFound() {
	return <NotFoundView />;
}
