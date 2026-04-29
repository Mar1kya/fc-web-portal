import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const t = useTranslations("TeamMemberNotFound");

    return (
        <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center min-h-[60vh]">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-600/20 blur-2xl rounded-full" />
                <div className="relative bg-card w-24 h-24 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm">
                    <UserX className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
                {t("title")}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base md:text-lg leading-relaxed">
                {t("description")}
            </p>
            <Button asChild className="font-semibold">
                <Link href="/team" className="inline-flex items-center">
                    {t("backButton")}
                </Link>
            </Button>
        </div>
    );
}