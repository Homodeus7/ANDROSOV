import type { Locale } from "@/shared/i18n";

/**
 * PDF собирается из `resume/<locale>.md` скриптом `npm run resume:pdf` — одна
 * вёрстка на оба языка, поэтому русская и английская версии не расходятся.
 */
export const resumeFile = (locale: Locale) =>
  `/resume/Frontend_Developer_Viacheslav_Androsov_CV_${locale.toUpperCase()}.pdf`;
