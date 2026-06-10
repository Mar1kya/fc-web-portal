import { ShopNav } from "./_components/shop-nav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Фаншоп</h1>
                <p className="text-muted-foreground mt-1">
                    Керування товарами, категоріями, замовленнями та продажами.
                </p>
            </div>
            <ShopNav />
            <main>{children}</main>
        </div>
    );
}