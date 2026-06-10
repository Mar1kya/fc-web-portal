import { Link } from "@/i18n/navigation";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import H1 from "@/components/ui/heading";

export default function GalleryNotFound() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center min-h-[60vh]">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-600/20 blur-2xl rounded-full" />
                <div className="relative bg-card w-24 h-24 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm">
                    <ImageOff className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                </div>
            </div>
            <H1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">
                Галерею не знайдено
            </H1>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base md:text-lg leading-relaxed">
                Цей альбом не існує або був видалений з бази даних. Перевірте правильність посилання.
            </p>
            <Button asChild className="font-semibold">
                <Link href="/admin/gallery" className="inline-flex items-center">
                    Повернутися до галерей
                </Link>
            </Button>
        </div>
    );
}