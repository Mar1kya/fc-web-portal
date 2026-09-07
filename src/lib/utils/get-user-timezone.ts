import { cookies } from "next/headers";
import { DEFAULT_TIMEZONE, TIMEZONE_COOKIE } from "../constants";

export async function getUserTimeZone(): Promise<string> {
    const cookieStore = await cookies();
    const tz = cookieStore.get(TIMEZONE_COOKIE)?.value;

    if (!tz) return DEFAULT_TIMEZONE;

    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return tz;
    } catch {
        return DEFAULT_TIMEZONE;
    }
}