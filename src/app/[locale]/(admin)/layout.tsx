import { AdminSidebar } from "@/components/layout/admin-sidebar"
import H1 from "@/components/ui/heading"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: {
        template: "%s | Emerald Gang Admin",
        default: "Дашборд | Emerald Gang Admin",
    },
    openGraph: {
        title: {
            template: "%s | Emerald Gang Admin",
            default: "Дашборд | Emerald Gang Admin",
        },
    },
}

export default async function AdminLayout({ children, }: { children: React.ReactNode }) {
    const session = await auth();
    let user = session?.user;

    if (!user) {
        redirect("/login");
    }

    if (user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { name: true, email: true, image: true, role: true }
        });

        if (dbUser) {
            user = { ...user, ...dbUser };
        }
    }

    if (user?.role !== "ADMIN") {
        redirect("/");
    }
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AdminSidebar user={user} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-border/50" />
                        <H1 className="text-sm font-medium ml-2">Панель керування</H1>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}