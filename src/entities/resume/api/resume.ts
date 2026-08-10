import { resume } from "@/content/resume";
import type { Locale } from "@/shared/i18n";
import { resumeSchema, type ResolvedResume } from "../model/schema";

const record = resumeSchema.parse(resume);

export function getResume(locale: Locale): ResolvedResume {
  const { content, ...rest } = record;
  return { ...rest, ...content[locale] };
}
