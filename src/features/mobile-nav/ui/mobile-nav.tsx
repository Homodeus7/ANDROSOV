"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/features/theme";
import { Link, locales, usePathname, useRouter } from "@/shared/i18n";
import { cn, prefersReducedMotion } from "@/shared/lib";
import { usePageScrollLock } from "@/shared/smooth-scroll";
import { usePageNavigate } from "@/shared/page-transition";

export type MobileNavCase = { href: string; title: string; tagline: string };

export type MobileNavLink = { label: string; href: string };

type MobileNavProps = {
  cases: MobileNavCase[];
  links: MobileNavLink[];
};

const SECTIONS = [
  { href: "/", key: "work", match: ["/", "/work"] },
  { href: "/lab", key: "lab", match: ["/lab"] },
  { href: "/about", key: "about", match: ["/about"] },
  { href: "/resume", key: "resume", match: ["/resume"] },
] as const;

const EXIT_MS = 200;

// Каскад упирается в потолок: на десяти строках шаг 30мс даёт хвост в треть
// секунды, а дальше последние пункты появлялись бы уже после того, как палец
// начал скроллить
const STAGGER_MAX = 8;
const STAGGER_STEP_MS = 30;

const pad = (value: number) => String(value).padStart(2, "0");

const rowBase =
  "border-border flex w-full border-b-2 px-4 transition-[opacity,transform,background-color,color] duration-200 ease-out";

const rowHidden =
  "translate-y-3 opacity-0 group-data-[open]/panel:translate-y-0 group-data-[open]/panel:opacity-100";

// На iOS :hover залипает после тапа, и строка остаётся залитой до следующего
// касания где-то ещё. Поэтому нажатие здесь на :active, а не через `flood`
const rowPress = "active:bg-accent active:text-on-accent";

function useStagger(reduced: boolean) {
  let index = 0;
  return () => {
    const current = index;
    index += 1;
    if (reduced) return undefined;
    return { transitionDelay: `${Math.min(current, STAGGER_MAX) * STAGGER_STEP_MS}ms` };
  };
}

export function MobileNav({ cases, links }: MobileNavProps) {
  const t = useTranslations("nav");
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const activeLocale = useLocale();
  const router = useRouter();
  const navigate = usePageNavigate();

  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  // Что сделать после закрытия. Любой переход ждёт, пока схлопнется история:
  // и push нового маршрута, и replace при смене языка иначе легли бы поверх
  // синтетической записи меню, и «закрыть» увело бы со страницы
  const pending = useRef<(() => void) | null>(null);

  usePageScrollLock(open);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    if (!open) {
      if (node.open) node.close();
      return;
    }

    node.showModal();
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Закрытие всегда идёт одним путём — через историю. Кнопка «назад» на
  // Android иначе увела бы с сайта вместо того, чтобы закрыть меню, а два
  // независимых пути закрытия рассинхронизировали бы стек
  const requestClose = useCallback((action?: () => void) => {
    pending.current = action ?? null;
    setShown(false);
    window.history.back();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPop = () => {
      const action = pending.current;
      pending.current = null;

      window.setTimeout(
        () => {
          setOpen(false);
          action?.();
        },
        prefersReducedMotion() ? 0 : EXIT_MS,
      );
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  const openMenu = () => {
    window.history.pushState({ mobileNav: true }, "");
    setOpen(true);
  };

  const onRowClick = (event: React.MouseEvent, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    requestClose(() => navigate(href));
  };

  const reduced = prefersReducedMotion();
  const delay = useStagger(reduced);

  return (
    <>
      <div className="border-border bg-bg fixed right-0 bottom-0 z-[190] border-t-2 border-l-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        <button
          type="button"
          onClick={openMenu}
          aria-expanded={open}
          aria-label={t("menuOpen")}
          className="spec active:bg-accent active:text-on-accent flex h-14 cursor-pointer items-center px-5"
        >
          {t("menuOpen")}
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-label={t("menuLabel")}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        className="bg-bg text-fg m-0 h-full max-h-none w-full max-w-none border-0 p-0 backdrop:bg-transparent"
      >
        {/* Содержимое живёт только пока меню открыто. Закрытый <dialog> скрыт
            стилем, но остаётся в разметке — а с ним и вторая копия ссылок на
            каждый кейс, которую подхватывает любой поиск по документу */}
        {open && (
          <div
            data-open={shown ? "" : undefined}
            className="group/panel flex h-full translate-y-full flex-col transition-transform duration-300 ease-out data-[open]:translate-y-0"
          >
            <div className="border-border shrink-0 border-b-2 px-4 pt-8 pb-5">
              <p className="display text-h1 leading-none">{t("menuTitle")}</p>
              <p className="spec text-muted mt-3">
                {pad(SECTIONS.length)} {t("groupSections")} · {pad(cases.length)}{" "}
                {t("groupCases")}
              </p>
            </div>

            <div
              data-lenis-prevent
              data-nav-list
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <p className="spec text-muted border-border flex items-center justify-between border-b-2 px-4 pt-6 pb-2">
                <span>{t("groupSections")}</span>
                <span aria-hidden>{pad(SECTIONS.length)}</span>
              </p>

              {SECTIONS.map((item, index) => {
                const active = item.match.some(
                  (path) => pathname === path || pathname.startsWith(`${path}/`),
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(event) => onRowClick(event, item.href)}
                    aria-current={active ? "page" : undefined}
                    style={delay()}
                    className={cn(
                      rowBase,
                      rowHidden,
                      "min-h-14 items-center gap-4",
                      active ? "bg-accent text-on-accent" : rowPress,
                    )}
                  >
                    <span aria-hidden className="spec shrink-0 opacity-60">
                      {pad(index + 1)}
                    </span>
                    {/* Кегль от ширины экрана: «Лаборатория» на фиксированных
                        2rem не оставляет места метке текущего раздела */}
                    <span className="display min-w-0 truncate text-[clamp(1.375rem,5.5vw,2rem)] leading-none">
                      {t(item.key)}
                    </span>
                    {active && (
                      <span className="spec ml-auto shrink-0">{t("currentPage")}</span>
                    )}
                  </Link>
                );
              })}

              <p className="spec text-muted border-border flex items-center justify-between border-b-2 px-4 pt-6 pb-2">
                <span>{t("groupCases")}</span>
                <span aria-hidden>{pad(cases.length)}</span>
              </p>

              {cases.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => onRowClick(event, item.href)}
                  style={delay()}
                  className={cn(
                    rowBase,
                    rowHidden,
                    rowPress,
                    "min-h-16 flex-col justify-center gap-1 py-3",
                  )}
                >
                  <span className="flex w-full items-center gap-4">
                    <span aria-hidden className="spec shrink-0 opacity-60">
                      {pad(index + 1)}
                    </span>
                    <span className="display min-w-0 truncate text-lg leading-none">
                      {item.title}
                    </span>
                  </span>
                  {/* Подзаголовок набором, а не `spec`: разрядка моноширинного
                      лейбла растягивает фразу на три строки */}
                  <span className="line-clamp-2 pl-10 text-sm leading-snug opacity-60">
                    {item.tagline}
                  </span>
                </Link>
              ))}
            </div>

            {/* Три внешние ссылки рядом с темой и языком не помещаются в
                строку уже на 390px — поэтому они идут отдельным рядом на всю
                ширину, поделённым на равные доли */}
            <div className="border-border grid shrink-0 grid-cols-3 border-t-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="spec active:bg-accent active:text-on-accent border-border flex min-h-12 items-center justify-center gap-1 border-l-2 first:border-l-0"
                >
                  <span className="truncate">{link.label}</span>
                  <ArrowUpRight aria-hidden className="size-3 shrink-0" />
                </a>
              ))}
            </div>

            <div className="border-border flex shrink-0 items-center gap-3 border-t-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div
                  role="group"
                  aria-label={t("switchLocale")}
                  className="border-border flex h-11 items-center border-2"
                >
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      onClick={() =>
                        locale !== activeLocale &&
                        requestClose(() => router.replace(pathname, { locale }))
                      }
                      aria-current={locale === activeLocale ? "true" : undefined}
                      className={cn(
                        "spec h-full cursor-pointer px-3",
                        locale === activeLocale
                          ? "bg-accent text-on-accent"
                          : "active:bg-accent active:text-on-accent",
                      )}
                    >
                      {locale}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border shrink-0 border-t-2 pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between">
                <span className="spec text-muted px-4">ESC</span>
                <button
                  type="button"
                  onClick={() => requestClose()}
                  className="spec border-border active:bg-accent active:text-on-accent flex h-14 cursor-pointer items-center gap-3 border-l-2 px-5"
                >
                  <span aria-hidden>✕</span>
                  {t("menuClose")}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
