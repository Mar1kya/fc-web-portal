import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import H1 from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import { User2 } from "lucide-react";

export async function generateMetadata() {
    const t = await getTranslations("Shop.PlayersCatalog.Metadata");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function ShopByPlayerPage() {
    const locale = await getLocale();
    const t = await getTranslations("Shop.PlayersCatalog");

    const playersWithMerch = await prisma.player.findMany({
        where: {
            deletedAt: null,
            relatedProducts: {
                some: {
                    deletedAt: null,
                    isArchived: false,
                }
            }
        },
        include: {
            translations: true,
        },
        orderBy: {
            number: 'asc'
        }
    });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col border-b border-border pb-4">
                <H1>{t("heading")}</H1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    {t("subheading")}
                </p>
            </div>
            {playersWithMerch.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {playersWithMerch.map((player) => {
                        const translation = getTranslation(player, locale);
                        const playerName = translation?.name || player.slug;

                        return (
                            <Link
                                key={player.id}
                                href={`/shop/player/${player.slug}`}
                                className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-300"
                            >
                                <div className="relative aspect-3/4 w-full bg-muted/30 flex items-end justify-center overflow-hidden">
                                    {player.avatar ? (
                                        <Image
                                            src={player.avatar}
                                            alt={playerName}
                                            fill
                                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            unoptimized
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                            <User2 className="h-24 w-24" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                                    <div className="absolute -right-2 -bottom-4 text-[100px] font-black leading-none text-white/10 group-hover:text-emerald-500/20 transition-colors duration-300 pointer-events-none">
                                        {player.number}
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between z-10">
                                    <div className="flex flex-col">
                                        <span className="text-emerald-400 font-bold text-sm">#{player.number}</span>
                                        <span className="text-white font-black text-lg uppercase leading-tight line-clamp-2">
                                            {playerName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed border-border bg-muted/10">
                    <p className="text-muted-foreground text-lg">{t("empty")}</p>
                </div>
            )}
        </div>
    );
}