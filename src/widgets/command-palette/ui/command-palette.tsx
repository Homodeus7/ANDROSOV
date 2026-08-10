"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n";

const ROUTES = [
  { href: "/", key: "work" },
  { href: "/lab", key: "lab" },
  { href: "/about", key: "about" },
  { href: "/resume", key: "resume" },
] as const;

export function CommandPalette() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={t("openPalette")}
      className="bg-bg/80 fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[20vh] backdrop-blur-sm"
    >
      <div className="border-border bg-surface w-full max-w-xl border-2">
        <Command.Input
          placeholder="…"
          className="spec placeholder:text-muted w-full bg-transparent px-4 py-4 outline-none"
        />
        <Command.List className="border-border max-h-72 overflow-y-auto border-t-2">
          <Command.Empty className="spec text-muted px-4 py-4">—</Command.Empty>
          {ROUTES.map((route) => (
            <Command.Item
              key={route.href}
              value={t(route.key)}
              onSelect={() => {
                setOpen(false);
                router.push(route.href);
              }}
              className="spec data-[selected=true]:bg-accent data-[selected=true]:text-on-accent cursor-pointer px-4 py-3"
            >
              {t(route.key)}
            </Command.Item>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
