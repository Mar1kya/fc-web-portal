import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHighResImage(url: string | null) {
  if (!url) return null;
  if (url.includes("googleusercontent.com") && url.includes("=s")) {
    return url.replace(/=s\d+-c/, "=s400-c");
  }

  return url;
}
