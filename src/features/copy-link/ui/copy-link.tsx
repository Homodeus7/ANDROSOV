"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function CopyLink({ href }: { href: string }) {
  const t = useTranslations("resume.viewer");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(href, window.location.origin).href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="spec border-border text-fg flood inline-flex min-h-11 cursor-pointer items-center border-2 px-3"
    >
      {copied ? t("copied") : t("copyLink")}
    </button>
  );
}
