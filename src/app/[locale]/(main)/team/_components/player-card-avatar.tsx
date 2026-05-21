"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

type PlayerCardAvatarProps = {
    src: string;
    alt: string;
};

export default function PlayerCardAvatar({ src, alt }: PlayerCardAvatarProps) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/40">
                <User className="w-16 h-16" strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
        />
    );
}