"use client";

import { useState, useCallback } from "react";
import type { SyntheticEvent } from "react";

export function useImageOrientation() {
    const [isPortrait, setIsPortrait] = useState(false);

    const onLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setIsPortrait(img.naturalHeight > img.naturalWidth);
    }, []);

    const objectPositionClass = isPortrait ? "object-top" : "object-center";

    return { onLoad, objectPositionClass, isPortrait };
}