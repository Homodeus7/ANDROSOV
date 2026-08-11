"use client";

import { useMemo, useState } from "react";
import {
  divergingRule,
  findConcept,
  foodConcepts,
  ladder,
  rankNaively,
  rankRows,
  rowsOf,
  type Ranking,
  type RuleId,
} from "@/entities/reference-food";
import type { Locale } from "@/shared/i18n";
import { toolClass } from "../../model/tool-class";
import { chipSlugs, startSlug } from "../model/chips";
import type { FoodMatchStrings } from "../model/strings";
import { CandidateList } from "./candidate-list";
import { RuleLadder } from "./rule-ladder";

export function FoodMatch({ strings, locale }: { strings: FoodMatchStrings; locale: Locale }) {
  const label = (slug: string) => {
    const concept = foodConcepts.find((item) => item.slug === slug);
    return concept ? concept[locale] : slug;
  };

  const [slug, setSlug] = useState(startSlug);
  const [query, setQuery] = useState(() => label(startSlug));
  const [cooked, setCooked] = useState(
    () => foodConcepts.find((item) => item.slug === startSlug)?.eatenCooked ?? false,
  );
  const [substring, setSubstring] = useState(false);
  const [rule, setRule] = useState<RuleId | undefined>(undefined);

  function choose(next: string) {
    const concept = foodConcepts.find((item) => item.slug === next);
    if (!concept) return;

    setSlug(concept.slug);
    setQuery(concept[locale]);
    // Флаг принадлежит еде: у новой еды он свой, а не тот, что оставили руками
    setCooked(concept.eatenCooked);
    setRule(undefined);
  }

  function search(value: string) {
    setQuery(value);
    const concept = findConcept(value);
    if (!concept || concept.slug === slug) return;

    setSlug(concept.slug);
    setCooked(concept.eatenCooked);
    setRule(undefined);
  }

  const rows = useMemo(() => rowsOf(slug), [slug]);
  const ranking = useMemo<Ranking>(
    () => ({ eatenCooked: cooked, reading: substring ? "substring" : "segments" }),
    [cooked, substring],
  );

  const naive = useMemo(() => rankNaively(rows), [rows]);
  const ranked = useMemo(() => rankRows(rows, ranking), [rows, ranking]);
  const steps = useMemo(() => ladder(rows, ranking), [rows, ranking]);

  const obvious = naive[0];
  const answer = ranked[0];
  const same = obvious === answer;
  const diverging =
    same || !obvious || !answer ? undefined : divergingRule(obvious, answer, ranking);
  const ratio =
    same || !obvious || !answer
      ? 1
      : Math.max(obvious.kcal, answer.kcal) / Math.max(Math.min(obvious.kcal, answer.kcal), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="spec text-muted" htmlFor="food-match-query">
          {strings.search}
        </label>
        <input
          id="food-match-query"
          value={query}
          onChange={(event) => search(event.target.value)}
          placeholder={strings.placeholder}
          autoComplete="off"
          className="border-border bg-bg text-fg min-h-11 border-2 px-3"
        />
        <span className="spec text-muted ml-auto">
          {rows.length} {strings.rows}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {chipSlugs.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === slug}
            className={toolClass(item === slug)}
            onClick={() => choose(item)}
          >
            {label(item)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={substring}
          className={toolClass(substring)}
          onClick={() => setSubstring((on) => !on)}
        >
          {strings.substring}
        </button>
        <button
          type="button"
          aria-pressed={cooked}
          className={toolClass(cooked)}
          onClick={() => setCooked((on) => !on)}
        >
          {strings.eatenCooked}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <CandidateList
            title={strings.naive}
            rows={naive}
            droppedLabel={strings.filteredOut}
          />
          <CandidateList
            title={strings.ranked}
            rows={ranked}
            dropped={steps.find((step) => step.id === rule)?.dropped}
            droppedLabel={strings.filteredOut}
          />
        </div>

        <RuleLadder
          steps={steps}
          diverging={diverging}
          selected={rule}
          onSelect={setRule}
          strings={strings}
        />
      </div>

      <p
        data-verdict={same ? "agree" : "diverge"}
        className="border-border bg-surface flex flex-wrap items-baseline gap-x-4 gap-y-2 border-2 p-4"
      >
        {obvious && answer ? (
          <>
            <span className="display text-2xl tabular-nums" data-kcal="naive">
              {obvious.kcal}
            </span>
            <span aria-hidden className="text-muted">
              →
            </span>
            <span className="display text-accent-ink text-2xl tabular-nums" data-kcal="ranked">
              {answer.kcal}
            </span>
            <span className="spec text-muted">{strings.kcal}</span>
            <span className="spec ml-auto tabular-nums" data-ratio="">
              {same ? strings.agree : `×${ratio.toFixed(1)}`}
            </span>
          </>
        ) : (
          <span className="spec text-muted">{strings.nothing}</span>
        )}
      </p>

      <p className="spec text-muted normal-case">{strings.hint}</p>
      <p className="text-muted max-w-prose text-xs">{strings.note}</p>
    </div>
  );
}
