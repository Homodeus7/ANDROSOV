import { useLocale, useTranslations } from "next-intl";
import { type Locale } from "@/shared/i18n";
import { CaseLink } from "@/entities/case";
import { getResume, resumeFile, type ResumeJob } from "@/entities/resume";
import { site } from "@/shared/config";
import { Container, SectionLabel } from "@/shared/ui";

type JobLabels = { caseLink: string; duties: string; achievements: string };

function Points({ items }: { items: string[] }) {
  return (
    <ul className="text-muted mt-2 max-w-prose space-y-2">
      {items.map((item) => (
        <li key={item} className="before:text-accent-ink before:mr-2 before:content-['—']">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Job({ job, labels }: { job: ResumeJob; labels: JobLabels }) {
  return (
    <article className="border-border break-inside-avoid border-t-2 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="display text-h4">{job.role}</h3>
        <p className="spec text-muted">{job.period}</p>
      </div>
      <p className="spec text-muted mt-1">{job.company}</p>
      <p className="mt-4 max-w-prose">{job.summary}</p>

      {job.duties ? (
        <>
          <p className="spec text-muted mt-4">{labels.duties}</p>
          <Points items={job.duties} />
          <p className="spec text-muted mt-4">{labels.achievements}</p>
          <Points items={job.points} />
        </>
      ) : (
        <div className="mt-4">
          <Points items={job.points} />
        </div>
      )}

      <p className="spec text-muted mt-4">{job.stack.join(" · ")}</p>

      {job.case ? (
        <CaseLink
          slug={job.case}
          className="spec text-accent-ink mt-4 inline-block print:hidden"
        >
          {labels.caseLink} →
        </CaseLink>
      ) : null}
    </article>
  );
}

export function ResumePage() {
  const t = useTranslations("resume");
  const locale = useLocale() as Locale;
  const resume = getResume(locale);
  const file = resumeFile(locale);
  const experience = resume.jobs.filter((job) => job.kind === "job");
  const projects = resume.jobs.filter((job) => job.kind === "project");
  const labels: JobLabels = {
    caseLink: t("caseLink"),
    duties: t("duties"),
    achievements: t("achievements"),
  };

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <SectionLabel>{t("title")}</SectionLabel>
          <h1 data-page-title className="display text-h1 mt-6">
            {resume.name}
          </h1>
          <p className="mt-4 text-xl leading-snug">{resume.headline}</p>
          <p className="text-muted mt-8 max-w-3xl leading-relaxed">{resume.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={site.telegram} className="spec text-accent-ink">
              {site.telegramHandle}
            </a>
            <a
              href={file}
              target="_blank"
              rel="noreferrer"
              className="spec border-border text-fg flood inline-flex min-h-11 items-center border-2 px-3"
            >
              {t("openPdf")}
            </a>
            <a
              href={file}
              download
              className="spec border-border text-fg flood inline-flex min-h-11 items-center border-2 px-3 print:hidden"
            >
              {t("download")}
            </a>
          </div>
        </Container>
      </section>

      <section className="border-border border-b-2 py-12 md:py-16">
        <Container>
          <SectionLabel>{resume.sections.skills}</SectionLabel>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            {resume.skills.map((group) => (
              <div key={group.label} className="break-inside-avoid">
                <dt className="spec text-muted">{group.label}</dt>
                <dd className="mt-2">{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {[
        { label: resume.sections.experience, jobs: experience },
        { label: resume.sections.projects, jobs: projects },
      ].map(({ label, jobs }) => (
        <section key={label} className="border-border border-b-2 py-12 md:py-16">
          <Container>
            <SectionLabel>{label}</SectionLabel>
            <div className="mt-8 space-y-10">
              {jobs.map((job) => (
                <Job key={job.role + job.period} job={job} labels={labels} />
              ))}
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
