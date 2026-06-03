import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

type TableAvatarProps = {
    src?: string | null;
    alt: string;
}

export function TableAvatar({ src, alt }: TableAvatarProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                <User className="w-6 h-6" strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="40px"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
        />
    );
}