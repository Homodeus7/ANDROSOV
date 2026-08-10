import { useTranslations } from "next-intl";
import { Counter, Reveal } from "@/shared/motion";
import { Container, SectionLabel } from "@/shared/ui";

const METRICS = [
  { key: "fps", from: 25, to: 60, suffix: " FPS" },
  { key: "billing", to: 30, prefix: "−", suffix: "%" },
  { key: "transactions", to: 500, suffix: "+" },
  { key: "operations", to: 40, suffix: "+" },
] as const;

export function Metrics() {
  const t = useTranslations("metrics");

  return (
    <section className="border-border border-b-2 py-20 md:py-28">
      <Container>
        <SectionLabel index={4} total={4}>
          {t("title")}
        </SectionLabel>

        <Reveal
          as="ul"
          className="border-border bg-border mt-10 grid gap-px border-2 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {METRICS.map((metric) => (
            <li key={metric.key} className="bg-bg flex flex-col justify-between gap-6 p-6">
              <p className="display text-h2 whitespace-nowrap">
                <Counter
                  from={"from" in metric ? metric.from : 0}
                  to={metric.to}
                  prefix={"prefix" in metric ? metric.prefix : ""}
                  suffix={metric.suffix}
                />
              </p>
              <p className="spec text-muted text-balance normal-case">
                {t(`${metric.key}.label`)}
              </p>
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
