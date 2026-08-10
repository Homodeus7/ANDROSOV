import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@/shared/config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: true,
});
