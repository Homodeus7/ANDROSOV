import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { caseFlipId, type ResolvedCase } from "@/entities/case";
import { CodeBlock } from "@/shared/code";
import { Link } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { FlipTarget, Reveal } from "@/shared/motion";
import { Container, SectionLabel } from "@/shared/ui";
import { DemoSlot } from "@/widgets/demos";
import { CaseNav } from "./case-nav";

type CasePageProps = {
  item: ResolvedCase;
  index: number;
  total: number;
  previous?: ResolvedCase;
  next?: ResolvedCase;
};

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex flex-col gap-1 border-t-2 py-4">
      <dt className="spec text-muted">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export function CasePage({ item, index, total, previous, next }: CasePageProps) {
  const t = useTranslations("case");
  const tNav = useTranslations("nav");
  const status = item.nda ? "badgeNda" : item.links.length > 0 ? "badgeLive" : "badgeClosed";
  const demos = item.demos ?? [];

  return (
    <>
      <section className="border-border border-b-2 pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <div className="spec text-muted flex items-center justify-between gap-4">
            <Link href="/" className="hover:text-fg flex items-center gap-2">
              <ArrowLeft aria-hidden className="size-4" />
              {tNav("work")}
            </Link>
            <div className="flex items-center gap-4">
              <span aria-hidden>
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "border-2 px-3 py-1",
                  status === "badgeLive"
                    ? "border-accent-ink text-accent-ink"
                    : "border-border text-muted",
                )}
              >
                {t(status)}
              </span>
            </div>
          </div>

          <h1 className="display text-display mt-10 break-words">
            <FlipTarget flipId={caseFlipId(item.slug)} className="inline-block">
              {item.title}
            </FlipTarget>
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-snug text-balance md:text-2xl">
            {item.tagline}
          </p>
        </Container>
      </section>

      {item.metrics.length > 0 ? (
        <Reveal
          as="ul"
          className="border-border bg-border grid gap-px border-b-2 sm:grid-cols-3"
          stagger={0.06}
        >
          {item.metrics.map((metric) => (
            <li key={metric.label} className="bg-bg px-4 py-10 md:px-8">
              <p className="display text-h1">{metric.value}</p>
              <p className="spec mt-4">{metric.label}</p>
              {metric.detail ? (
                <p className="text-muted mt-2 max-w-prose text-sm">{metric.detail}</p>
              ) : null}
            </li>
          ))}
        </Reveal>
      ) : null}

      <Container grid className="py-16 md:py-24">
        <aside className="col-span-full lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <SectionLabel>{t("spec")}</SectionLabel>
            <dl className="mt-6">
              <SpecRow label={t("role")}>{item.role}</SpecRow>
              <SpecRow label={t("period")}>{item.period}</SpecRow>
              <SpecRow label={t("stack")}>
                <ul className="flex flex-wrap gap-x-3 gap-y-1">
                  {item.stack.map((tech) => (
                    <li key={tech} className="text-muted">
                      {tech}
                    </li>
                  ))}
                </ul>
              </SpecRow>
              {item.links.length > 0 ? (
                <SpecRow label={t("links")}>
                  <ul className="flex flex-col gap-2">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-accent-ink group inline-flex items-center gap-1 underline underline-offset-4"
                        >
                          {link.label}
                          <ArrowUpRight
                            aria-hidden
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </SpecRow>
              ) : null}
            </dl>

            {item.nda ? (
              <p className="border-border text-muted mt-8 border-2 border-dashed p-4 text-sm">
                {t("nda")}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="col-span-full mt-16 lg:col-span-8 lg:col-start-5 lg:mt-0">
          {item.sections.map((section, sectionIndex) => (
            <Reveal
              as="section"
              key={section.title}
              className="border-border mb-16 border-t-2 pt-8 first:border-t-0 first:pt-0 md:mb-24"
            >
              <SectionLabel index={sectionIndex + 1} total={item.sections.length}>
                {t(section.kind)}
              </SectionLabel>
              <h2 className="display text-h2 mt-6 max-w-3xl text-balance">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-muted mt-6 max-w-prose">
                  {paragraph}
                </p>
              ))}
              {section.code ? (
                <div className="mt-8">
                  <CodeBlock {...section.code} />
                </div>
              ) : null}
            </Reveal>
          ))}
        </div>
      </Container>

      {demos.map((demo, demoIndex) => (
        <section key={demo} id={demo} className="border-border border-t-2 py-16 md:py-24">
          <Container>
            <SectionLabel
              index={demos.length > 1 ? demoIndex + 1 : undefined}
              total={demos.length > 1 ? demos.length : undefined}
            >
              {t("demo")}
            </SectionLabel>
            <div className="mt-6">
              <DemoSlot demo={demo} />
            </div>
          </Container>
        </section>
      ))}

      <CaseNav previous={previous} next={next} />
    </>
  );
}
