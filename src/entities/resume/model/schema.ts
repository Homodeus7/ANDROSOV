import { z } from "zod";
import { locales } from "@/shared/config";

const skillGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

const jobSchema = z.object({
  kind: z.enum(["job", "project"]),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  summary: z.string().min(1),
  points: z.array(z.string().min(1)).min(1),
  stack: z.array(z.string().min(1)).min(1),
  /** Slug кейса: резюме и кейс говорят об одной работе, и это должно быть видно */
  case: z.string().optional(),
});

const localizedSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
  skills: z.array(skillGroupSchema).min(1),
  jobs: z.array(jobSchema).min(1),
  sections: z.object({
    skills: z.string().min(1),
    experience: z.string().min(1),
    projects: z.string().min(1),
  }),
});

export const resumeSchema = z.object({
  content: z.object(
    Object.fromEntries(locales.map((locale) => [locale, localizedSchema])) as Record<
      (typeof locales)[number],
      typeof localizedSchema
    >,
  ),
});

export type ResumeJob = z.infer<typeof jobSchema>;
export type ResumeSkillGroup = z.infer<typeof skillGroupSchema>;
export type ResumeRecord = z.infer<typeof resumeSchema>;
export type ResolvedResume = Omit<ResumeRecord, "content"> & z.infer<typeof localizedSchema>;
