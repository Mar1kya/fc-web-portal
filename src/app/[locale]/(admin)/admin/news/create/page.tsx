import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CreateNewsForm } from "./_components/create-news-form";

export const metadata: Metadata = {
    title: "Створення публікації",
    description: "Додавання нової новини, інтерв'ю або заяви.",
};

export default async function CreateNewsPage() {
    const [players, coaches, matches] = await Promise.all([
        prisma.player.findMany({
            where: { deletedAt: null },
            include: { translations: true },
        }),
        prisma.coach.findMany({
            where: { deletedAt: null },
            include: { translations: true },
        }),
        prisma.match.findMany({
            orderBy: { date: "desc" },
            take: 20,
            include: { opponent: { include: { translations: true } } },
        }),
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Нова публікація</h2>
                <p className="text-muted-foreground mt-1">
                    Заповніть форму нижче, щоб додати нову новину на портал.
                </p>
            </div>
            <CreateNewsForm
                players={players}
                coaches={coaches}
                matches={matches}
            />
        </div>
    );
}