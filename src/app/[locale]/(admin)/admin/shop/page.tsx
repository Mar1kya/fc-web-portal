import { redirect } from "next/navigation";

export default function ShopIndexPage() {
    redirect("/admin/shop/orders");
}