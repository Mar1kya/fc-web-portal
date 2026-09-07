import { SHOP_TIMEZONE } from "../constants";

export function formatOrderDateTime(date: Date | string, locale = "uk-UA") {
  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SHOP_TIMEZONE,
  });
}

export function formatOrderDate(date: Date | string, locale = "uk-UA") {
  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: SHOP_TIMEZONE,
  });
}

export function formatOrderTime(date: Date | string, locale = "uk-UA") {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SHOP_TIMEZONE,
  });
}
export function formatOrderDateLong(date: Date | string, locale = "uk-UA") {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SHOP_TIMEZONE,
  });
}

export function formatMatchDate(
  date: Date,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function formatMatchTime(
  date: Date,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}
