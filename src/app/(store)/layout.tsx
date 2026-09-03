import { ShopHeader } from "@/components/shop/shop-header";
import { Footer } from "@/components/Footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-cream">
			<ShopHeader />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
