import createMiddleware from "next-intl/middleware";
// Импорт мимо бочки: через неё в бандл middleware приезжает `i18n/request.ts`,
// а он читает корневые параметры сегмента, которых в middleware нет
import { routing } from "@/shared/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
