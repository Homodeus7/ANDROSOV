import { useTranslations } from "next-intl";
import type { ResolvedCase } from "@/entities/case";
import { Container, SectionLabel } from "@/shared/ui";

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border border-t py-3">
      <dt className="spec text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export function CasePage({ item }: { item: ResolvedCase }) {
  const t = useTranslations("case");

  return (
    <>
      <section className="border-border border-b-2 py-20">
        <Container>
          <SectionLabel>{item.period}</SectionLabel>
          <h1 data-flip-id={`case-${item.slug}`} className="display text-h1 mt-6">
            {item.title}
          </h1>
          <p className="mt-4 max-w-2xl text-balance">{item.tagline}</p>
        </Container>
      </section>

      <Container grid className="py-16">
        <aside className="col-span-full lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <SectionLabel>{t("spec")}</SectionLabel>
            <dl className="mt-4">
              <SpecRow label={t("role")}>{item.role}</SpecRow>
              <SpecRow label={t("period")}>{item.period}</SpecRow>
              <SpecRow label={t("stack")}>{item.stack.join(" · ")}</SpecRow>
              {item.links.length > 0 ? (
                <SpecRow label={t("links")}>
                  <ul className="flex flex-col gap-1">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-accent underline underline-offset-4"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </SpecRow>
              ) : null}
            </dl>

            {item.nda ? <p className="spec text-muted mt-6 normal-case">{t("nda")}</p> : null}
          </div>
        </aside>

        <div className="col-span-full mt-12 lg:col-span-8 lg:col-start-5 lg:mt-0">
          {item.metrics.length > 0 ? (
            <ul className="border-border mb-16 grid gap-px border-2 sm:grid-cols-3">
              {item.metrics.map((metric) => (
                <li key={metric.label} className="bg-bg p-6">
                  <p className="display text-h2">{metric.value}</p>
                  <p className="spec mt-2">{metric.label}</p>
                  {metric.detail ? (
                    <p className="text-muted mt-2 text-sm">{metric.detail}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {item.sections.map((section) => (
            <section key={section.title} className="mb-16">
              <SectionLabel>{t(section.kind)}</SectionLabel>
              <h2 className="display text-h2 mt-4 text-balance">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 max-w-prose">
                  {paragraph}
                </p>
              ))}
              {section.code ? (
                <figure className="border-border mt-6 border-2">
                  {section.code.caption ? (
                    <figcaption className="spec text-muted border-border border-b-2 px-4 py-2 normal-case">
                      {section.code.caption}
                    </figcaption>
                  ) : null}
                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                    <code>{section.code.source}</code>
                  </pre>
                </figure>
              ) : null}
            </section>
          ))}

          {item.demo ? (
            <div className="border-border spec text-muted border-2 border-dashed p-8 normal-case">
              {t("demoPending")} — <span className="font-mono">{item.demo}</span>
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}
