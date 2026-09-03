const CUSTOM_FLAG_CODES = new Set(["ENG", "SCO", "WAL"]);

const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
    XKX: "XK", 
};

export function normalizeFlagCode(code: string): string {
    return COUNTRY_CODE_OVERRIDES[code.toUpperCase()] ?? code;
}

export function isCustomFlag(code: string): boolean {
    return CUSTOM_FLAG_CODES.has(code.toUpperCase());
}