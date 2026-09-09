import pkg from "../../package.json";

export const APP_VERSION: string = pkg.version;
export const APP_MAJOR: string = APP_VERSION.split(".")[0] ?? "1";
export const APP_AUTHOR = "Callmerev";
export const APP_NAME = "Invoice Manager";
