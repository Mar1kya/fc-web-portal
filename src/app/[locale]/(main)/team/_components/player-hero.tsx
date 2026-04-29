import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import Flag from "react-world-flags";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { Link } from "@/i18n/navigation";
import { Shirt, User } from "lucide-react";
import { Prisma } from "../../../../../../generated/prisma";

type PlayerWithRelations = Prisma.PlayerGetPayload<{
    include: {
        translations: true;
        relatedProducts: true;
    };
}>;

type PlayerHeroProps = {
    player: PlayerWithRelations;
};

export default async function PlayerHero({ player }: PlayerHeroProps) {
    const locale = await getLocale();
    const tTeam = await getTranslations("TeamPage");
    const tEnums = await getTranslations("Enums");
    const translation = getTranslation(player, locale);
    const name = translation?.name || (locale === "uk" ? "Без назви" : "Untitled");
    const dateLocale = locale === "uk" ? uk : enUS;
    const formattedBirthDate = player.birthDate ? format(new Date(player.birthDate), "dd.MM.yyyy", { locale: dateLocale }) : "—";
    const positionName = tEnums(`PlayerRole.${player.position}`);
    const hasJersey = player.relatedProducts.length > 0;

    return (
        <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-card xl:flex-row">
            <div className="flex w-full flex-col items-center justify-center p-8 text-center text-card-foreground md:p-14 xl:w-1/2 xl:items-start xl:text-left">
                <div className="mb-8 flex w-full flex-wrap items-baseline justify-center gap-4 border-b border-white/10 pb-6 xl:justify-start">
                    <span className="text-2xl font-black text-emerald-600 sm:text-4xl md:text-5xl">
                        #{player.number}
                    </span>
                    <h1 className="font-serif text-2xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
                        {name}
                    </h1>
                </div>
                <div className="flex w-full flex-wrap justify-center gap-8 sm:gap-10 xl:justify-start xl:gap-12">
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("position")}</span>
                        <span className="text-lg font-bold uppercase">{positionName}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("nationality")}</span>
                        <div className="flex h-7 items-center justify-center xl:justify-start">
                            {player.nationality ? (
                                <Flag
                                    code={player.nationality}
                                    className="h-5 w-7 rounded-xs object-cover shadow-sm"
                                    fallback={<span className="text-lg font-bold uppercase">{player.nationality}</span>}
                                />
                            ) : (
                                <span className="text-lg font-bold uppercase">—</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("birthDate")}</span>
                        <span className="text-lg font-bold uppercase">{formattedBirthDate}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("height")}</span>
                        <span className="text-lg font-bold uppercase">
                            {player.height ? `${player.height} ${tTeam("cm")}` : "—"}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("weight")}</span>
                        <span className="text-lg font-bold uppercase">
                            {player.weight ? `${player.weight} ${tTeam("kg")}` : "—"}
                        </span>
                    </div>
                </div>
                {hasJersey && (
                    <div className="mt-10 inline-flex xl:mt-20">
                        <Link
                            href={`/shop/player/${player.slug}`}
                            className="group flex items-center gap-4 rounded-xl bg-foreground p-2 pr-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-600/20 active:translate-y-0 active:scale-95"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-card text-card-foreground transition-transform duration-300 group-hover:scale-110">
                                <Shirt className="h-7 w-7 text-emerald-600 transition-transform duration-300 group-hover:-rotate-12" />
                            </div>
                            <div className="flex flex-col text-left transition-transform duration-300 group-hover:translate-x-1">
                                <span className="text-2xl font-black leading-none text-background">#{player.number}</span>
                                <span className="text-sm font-bold text-background/80">{tTeam("buyJersey")}</span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
            <div className="relative flex h-100 w-full items-end justify-center bg-white md:h-125 lg:h-150 xl:w-1/2">
                {player.avatar ? (
                    <Image
                        src={player.avatar}
                        alt={name}
                        fill
                        className="object-contain object-bottom"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                        unoptimized
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User className="h-32 w-32 text-muted-foreground/20" strokeWidth={1} />
                    </div>
                )}
            </div>
        </div>
    );
}