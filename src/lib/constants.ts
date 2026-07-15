import { MatchStatus, OrderStatusEnum, PostType, TeamContext } from "../../generated/prisma";

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
export const OUR_LOGO_URL = "https://img.sofascore.com/api/v1/team/258536/image";

export const postTypeTranslations: Record<PostType, string> = {
  NEWS: "Новина",
  INTERVIEW: "Інтерв'ю",
  STATEMENT: "Офіційно",
};

export const teamContextTranslations: Record<TeamContext, string> = {
  MAIN_TEAM: "Основна команда",
  U19: "U-19",
  ACADEMY: "Академія",
  GENERAL: "Клуб",
};
export const postStatusOptions = [
  { value: "PUBLISHED", label: "Опубліковано" },
  { value: "SCHEDULED", label: "Заплановано" },
  { value: "DRAFT", label: "Чернетка" },
];
export const COUNTRIES = [
  { code: "UKR", name: "Ukraine" },
  { code: "ENG", name: "England" },
  { code: "SCO", name: "Scotland" },
  { code: "WAL", name: "Wales" },
  { code: "ARG", name: "Argentina" },
  { code: "AUS", name: "Australia" },
  { code: "AUT", name: "Austria" },
  { code: "BEL", name: "Belgium" },
  { code: "BRA", name: "Brazil" },
  { code: "CAN", name: "Canada" },
  { code: "CHE", name: "Switzerland" },
  { code: "CHL", name: "Chile" },
  { code: "CMR", name: "Cameroon" },
  { code: "COL", name: "Colombia" },
  { code: "CRI", name: "Costa Rica" },
  { code: "HRV", name: "Croatia" },
  { code: "CZE", name: "Czech Republic" },
  { code: "DNK", name: "Denmark" },
  { code: "ECU", name: "Ecuador" },
  { code: "EGY", name: "Egypt" },
  { code: "ESP", name: "Spain" },
  { code: "FRA", name: "France" },
  { code: "DEU", name: "Germany" },
  { code: "GHA", name: "Ghana" },
  { code: "GRC", name: "Greece" },
  { code: "HUN", name: "Hungary" },
  { code: "IRN", name: "Iran" },
  { code: "IRL", name: "Ireland" },
  { code: "ISL", name: "Iceland" },
  { code: "ISR", name: "Israel" },
  { code: "ITA", name: "Italy" },
  { code: "CIV", name: "Ivory Coast" },
  { code: "JPN", name: "Japan" },
  { code: "MEX", name: "Mexico" },
  { code: "MAR", name: "Morocco" },
  { code: "NLD", name: "Netherlands" },
  { code: "NGA", name: "Nigeria" },
  { code: "NOR", name: "Norway" },
  { code: "PER", name: "Peru" },
  { code: "POL", name: "Poland" },
  { code: "PRT", name: "Portugal" },
  { code: "QAT", name: "Qatar" },
  { code: "ROU", name: "Romania" },
  { code: "SEN", name: "Senegal" },
  { code: "SRB", name: "Serbia" },
  { code: "SVK", name: "Slovakia" },
  { code: "SVN", name: "Slovenia" },
  { code: "KOR", name: "South Korea" },
  { code: "SWE", name: "Sweden" },
  { code: "TUR", name: "Turkey" },
  { code: "USA", name: "United States" },
  { code: "URY", name: "Uruguay" },
  { code: "GEO", name: "Georgia" },
  { code: "ALB", name: "Albania" },
  { code: "MNE", name: "Montenegro" },
  { code: "BIH", name: "Bosnia & Herzegovina" },
  { code: "MKD", name: "North Macedonia" },
  { code: "FIN", name: "Finland" },
  { code: "DZA", name: "Algeria" },
  { code: "TUN", name: "Tunisia" },
].sort((a, b) => a.name.localeCompare(b.name));

export const STANDARD_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "ONE SIZE",
];
export const statusColors: Record<OrderStatusEnum, string> = {
    PENDING: "bg-amber-500/10 text-amber-500 border-none",
    PAID: "bg-emerald-600/10 text-emerald-600 border-none",
    SHIPPED: "bg-blue-500/10 text-blue-500 border-none",
    DELIVERED: "bg-emerald-600/10 text-emerald-600 border-none",
    CANCELLED: "bg-destructive/10 text-destructive border-none",
};

export function getPaymentBadgeConfig(
  isPaid: boolean,
  status: OrderStatusEnum,
  paymentMethod: "CARD" | "COD"
): { label: string; className: string } {
  if (isPaid) {
    return { label: "Оплачено", className: "bg-emerald-600 hover:bg-emerald-600 text-white border-none" };
  }
  if (status === OrderStatusEnum.CANCELLED) {
    return { label: "Скасовано", className: "bg-destructive/10 text-destructive border-none" };
  }
  if (paymentMethod === "CARD") {
    return { label: "Не оплачено", className: "bg-amber-500/10 text-amber-500 border-none" };
  }
  return { label: "Оплата при отриманні", className: "bg-blue-500/10 text-blue-500 border-none" };
}
 
export const matchStatusTranslations: Record<MatchStatus, string> = {
    SCHEDULED: "Заплановано",
    LIVE: "Наживо",
    FINISHED: "Завершено",
    POSTPONED: "Перенесено",
    CANCELED: "Скасовано",
};