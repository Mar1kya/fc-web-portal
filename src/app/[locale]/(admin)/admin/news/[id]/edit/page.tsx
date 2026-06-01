import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditNewsForm } from "./_components/edit-news-form";

export const metadata: Metadata = {
    title: "Редагування публікації",
    description: "Оновлення даних новини, інтерв'ю або заяви.",
};

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [post, players, coaches, matches] = await Promise.all([
        prisma.post.findUnique({
            where: { id },
            include: {
                translations: true,
                media: true,
                mentionedPlayers: { select: { id: true } },
                mentionedCoaches: { select: { id: true } },
                relatedMatches: { select: { id: true } },
            },
        }),
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

    if (!post) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6 pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Редагування публікації</h2>
                <p className="text-muted-foreground mt-1">
                    Внесіть необхідні зміни та збережіть форму.
                </p>
            </div>
            <EditNewsForm
                post={post}
                players={players}
                coaches={coaches}
                matches={matches}
            />
        </div>
    );
}