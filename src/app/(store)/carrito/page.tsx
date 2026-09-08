import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
	title: "Tu carrito | Finas Joyería",
	description: "Revisa los productos que agregaste a tu carrito.",
	robots: { index: false },
};

export default function CarritoPage() {
	return <CartView />;
}
