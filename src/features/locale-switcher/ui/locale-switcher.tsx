"use client";

import { useLocale, useTranslations } from "next-intl";
import { locales, usePathname, useRouter, type Locale } from "@/shared/i18n";
import { cn } from "@/shared/lib";

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  return (
    <div
      role="group"
      aria-label={t("switchLocale")}
      className="border-border flex h-11 items-center border-2"
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-current={locale === active ? "true" : undefined}
          className={cn(
            "spec h-full cursor-pointer px-3",
            locale === active ? "bg-accent text-on-accent" : "flood",
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
