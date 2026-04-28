import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Coach } from "../../../../../../generated/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import Flag from "react-world-flags";
import { User } from "lucide-react";

type CoachCardProps = {
    coach: Coach & {
        translations: { name: string; role: string; language: string }[];
    };
    locale: string;
}

export default async function CoachCard({ coach, locale }: CoachCardProps) {
    const translation = getTranslation(coach, locale);
    const fallbackName = locale === 'uk' ? "Без назви" : "Untitled";
    const name = translation?.name || fallbackName;
    const role = translation?.role || "";

    return (
        <Link
            href={`/team/coach/${coach.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
        >
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                {coach.avatar ? (
                    <Image
                        src={coach.avatar}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40 h-full">
                        <User className="w-16 h-16" strokeWidth={1.5} />
                    </div>
                )}
            </div>
            <div className="relative flex flex-col p-3 border-t bg-card">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            {role}
                        </span>
                    </div>
                    {coach.nationality && (
                        <Flag
                            code={coach.nationality}
                            className="h-3.5 w-5 rounded-xs object-cover shadow-sm"
                            fallback={<span className="text-[10px] font-medium text-muted-foreground uppercase">{coach.nationality}</span>}
                        />
                    )}
                </div>
                <h3 className="line-clamp-1 text-base font-bold uppercase tracking-tight">
                    {name}
                </h3>
            </div>
        </Link>
    );
}