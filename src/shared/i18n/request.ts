import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type { Locale } from "@/shared/config";
import { routing } from "./routing";

/**
 * Импорты выписаны по одному, а не собраны шаблонной строкой: по выражению
 * сборщик строит контекстный модуль, и правки в JSON не долетают до dev-сервера
 * — он до перезапуска отдаёт словарь, загруженный на старте. Заодно новая
 * локаль без файла сообщений становится ошибкой типов, а не пустой страницей.
 */
const MESSAGES: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("../../../messages/en.json"),
  ru: () => import("../../../messages/ru.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await MESSAGES[locale]()).default,
  };
});
