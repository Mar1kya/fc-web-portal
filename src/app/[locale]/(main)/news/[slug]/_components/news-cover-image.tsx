"use client";

import { useState } from "react";
import Image from "next/image";
import { Newspaper } from "lucide-react";

type NewsCoverImageProps = {
    src?: string | null; 
    alt?: string | null;
};

export default function NewsCoverImage({ src, alt }: NewsCoverImageProps) {
    const [hasError, setHasError] = useState(!src);

    if (hasError || !src) {
        return (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <Newspaper className="w-20 h-20 md:w-32 md:h-32" strokeWidth={1} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt || "Обкладинка новини"}
            fill
            className="object-cover"
            priority
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
        />
    );
}