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
