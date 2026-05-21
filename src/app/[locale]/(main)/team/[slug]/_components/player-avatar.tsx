"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

type PlayerAvatarProps = {
    src: string;
    alt: string;
};

export default function PlayerAvatar({ src, alt }: PlayerAvatarProps) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <User className="h-32 w-32 text-emerald-600" strokeWidth={1} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)} 
        />
    );
}