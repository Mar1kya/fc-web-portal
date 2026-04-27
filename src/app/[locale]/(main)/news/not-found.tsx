import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsNotFound() {
    const t = useTranslations("NewsNotFound");
    return (
        <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center min-h-[60vh]">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative bg-card w-24 h-24 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm">
                    <FileSearch className="w-12 h-12 text-primary" strokeWidth={1.5} />
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
                {t("title")}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base md:text-lg leading-relaxed">
                {t("description")}
            </p>
            <Button asChild className="font-semibold">
                <Link href="/news" className="inline-flex items-center">
                    {t("backButton")}
                </Link>
            </Button>
        </div>
    );
}