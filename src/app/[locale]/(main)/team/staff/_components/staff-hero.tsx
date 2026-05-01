import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getTranslation } from "@/lib/utils/get-translation";
import Flag from "react-world-flags";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { User } from "lucide-react";
import { Prisma } from "../../../../../../../generated/prisma";

type CoachWithRelations = Prisma.CoachGetPayload<{
    include: {
        translations: true;
    };
}>;

type CoachHeroProps = {
    coach: CoachWithRelations;
};

export default async function StaffHero({ coach }: CoachHeroProps) {
    const locale = await getLocale();
    const tTeam = await getTranslations("TeamPage");
    const translation = getTranslation(coach, locale);
    const name = translation?.name || (locale === "uk" ? "Без назви" : "Untitled");
    const roleName = translation?.role || "—"; 
    const dateLocale = locale === "uk" ? uk : enUS;
    const formattedBirthDate = coach.birthDate ? format(new Date(coach.birthDate), "dd.MM.yyyy", { locale: dateLocale }) : "—";

    return (
        <div className="flex w-full flex-col-reverse overflow-hidden rounded-lg border bg-card xl:flex-row">
            <div className="flex w-full flex-col items-center justify-center p-8 text-center text-card-foreground md:p-14 xl:w-1/2 xl:items-start xl:text-left">
                <div className="mb-8 flex w-full flex-wrap items-baseline justify-center gap-4 border-b border-border pb-6 xl:justify-start">
                    <h1 className="font-serif text-2xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
                        {name}
                    </h1>
                </div>
                <div className="flex w-full flex-wrap justify-center gap-8 sm:gap-10 xl:justify-start xl:gap-12">
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("position")}</span>
                        <span className="text-lg font-bold uppercase">{roleName}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 xl:items-start">
                        <span className="text-sm font-medium text-muted-foreground">{tTeam("nationality")}</span>
                        <div className="flex h-7 items-center justify-center xl:justify-start">
                            {coach.nationality ? (
                                <Flag
                                    code={coach.nationality}
                                    className="h-5 w-7 rounded-xs object-cover shadow-sm"
                                    fallback={<span className="text-lg font-bold uppercase">{coach.nationality}</span>}
                                />
                            ) : (
                                <span className="text-lg font-bold uppercase">—</span>
                            )}
                        </div>
                    </div>
                    {coach.birthDate && (
                        <div className="flex flex-col items-center gap-1 xl:items-start">
                            <span className="text-sm font-medium text-muted-foreground">{tTeam("birthDate")}</span>
                            <span className="text-lg font-bold uppercase">{formattedBirthDate}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative flex h-100 w-full items-end justify-center bg-muted/20 overflow-hidden md:h-125 lg:h-150 xl:w-1/2">
                {coach.avatar ? (
                    <Image
                        src={coach.avatar}
                        alt={name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                        unoptimized
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User className="h-32 w-32 text-emerald-600" strokeWidth={1} />
                    </div>
                )}
            </div>
        </div>
    );
}