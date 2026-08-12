# portfolio-site

Personal portfolio for Viacheslav Androsov. Every claim on the site is backed by a runnable demo
rebuilt from the feature it describes — NDA hides the client's code, not the engineering.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP · next-intl (EN/RU)
· Zod · Vitest · Playwright

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test:run     # vitest
npm run test:e2e     # playwright (builds and serves on :3100)
npm run format       # prettier
npm run resume:pdf   # resume PDFs from resume/*.md
npm run resume:docx  # the same source as .docx, two layouts (needs python-docx)
```

## Architecture

Feature-Sliced Design. Layers, from top to bottom:

```
src/app/        Next.js routing only — thin page.tsx + metadata
src/views/      page components with business logic
src/widgets/    composite blocks (header, footer, palette, grid overlay)
src/features/   theme, locale switcher
src/entities/   domain models (case)
src/shared/     config, fonts, i18n, lib, motion, styles, ui
src/content/    authored case content, validated by Zod at import time
```

Two lint rules keep the layering honest, and both are verified to fail on violation:

- a layer may only import from layers below it;
- a slice may only be imported through its `index.ts` public API.

## Content

Cases live in `src/content/cases/*.ts` as typed modules with `en` and `ru` bodies. They are parsed
by `caseSchema` when `@/entities/case` first loads, so a malformed or half-translated case fails
the build rather than shipping.

## Design

Kinetic Brutalism: zero radius, 2px borders, one acid accent (`#dfe104`), Unbounded for display,
Manrope for body, JetBrains Mono for data. Dark is the default; light mode is the same palette
inverted. Full spec lives in the Obsidian vault under `projects/portfolio-site/architecture`.

Press `G` for the 12-column grid overlay, `⌘K` for the command palette.
