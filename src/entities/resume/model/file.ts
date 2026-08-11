import type { Locale } from "@/shared/i18n";

/**
 * PDF собирается из `resume/<locale>.md` скриптом `npm run resume:pdf` — одна
 * вёрстка на оба языка, поэтому русская и английская версии не расходятся.
 */
export const resumeFile = (locale: Locale) =>
  `/resume/Androsov_Viacheslav_Frontend_${locale.toUpperCase()}.pdf`;
