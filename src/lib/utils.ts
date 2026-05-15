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

export const STORE_CURRENCY = "UAH";
export const STORE_LOCALE = "uk-UA";

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  GBP: "£",
  PLN: "zł",
};

export const getCurrencySymbol = (currencyCode = STORE_CURRENCY) => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

export const formatPrice = (price: number | string) => {
  const formattedNumber = new Intl.NumberFormat(STORE_LOCALE, {
    style: "decimal", // 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price));

  return `${formattedNumber} ${getCurrencySymbol()}`;
};