import { PostType, TeamContext } from "../../generated/prisma";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;
export const PAGINATION = {
    NEWS_PER_PAGE: 16,
    SHOP_PER_PAGE: 12,
    ORDERS_PER_PAGE: 10,
};
export const TARGET_TEAM_ORIGINAL_NAME = "Polissya Zhytomyr";
export const TEAM_ID = "258536";
export const MAX_QTY_PER_ITEM = 10; 
export const LOCALES = ["uk", "en"];


export const postTypeTranslations: Record<PostType, string> = {
    NEWS: "Новина",
    INTERVIEW: "Інтерв'ю",
    STATEMENT: "Офіційно"
};

export const teamContextTranslations: Record<TeamContext, string> = {
    MAIN_TEAM: "Основна команда",
    U19: "U-19",
    ACADEMY: "Академія",
    GENERAL: "Клуб"
};
export const postStatusOptions = [
    { value: "PUBLISHED", label: "Опубліковано" },
    { value: "SCHEDULED", label: "Заплановано" },
    { value: "DRAFT", label: "Чернетка" },
];