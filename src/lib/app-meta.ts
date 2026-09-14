import pkg from "../../package.json";

export const APP_VERSION: string = pkg.version;
export const APP_MAJOR: string = APP_VERSION.split(".")[0] ?? "1";
export const APP_AUTHOR = "Callmerev";
export const APP_NAME = "Invoice Manager";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://invoice-manager.callmerev.my.id";
export const PORTFOLIO_URL = "https://callmerev.my.id";
export const SITE_TAGLINE = "Tagihan freelancer yang tepercaya, dari draf sampai lunas.";
export const SITE_DESCRIPTION =
  "Invoice Manager membuat, menerbitkan, dan menagih invoice secara profesional — dokumen terkunci, status yang selalu jelas, dan halaman klien resmi untuk setiap tagihan.";
