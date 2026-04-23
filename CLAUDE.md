# Grexia — Project Rules

## Stack

Astro 5 + React 19 + TypeScript strict + Tailwind CSS v4 + NanoStores + Vitest + Playwright

## Critical Constraints

- Node 24.x required — Node 25 breaks happy-dom localStorage in Vitest
- Never build after changes (`npm run build` is not part of the dev flow)
- Conventional commits only — no AI attribution, no "Co-Authored-By"
- Never mention Claude or any AI in commit messages, code comments, or project files
- **Never use `{' '}` or any JSX whitespace expression in Astro files** — use plain HTML spacing
- **All user-facing copy must be in Colombian Spanish** — no voseo (no "vos/tenés/podés/hacés"). Use "tú" form ("tienes/puedes/haces") or "usted" form. Never use Argentine/Rioplatense expressions
- **Never use em dashes (`—`) in user-facing copy** — placeholders, labels, headings, paragraphs, CTAs. Em dashes are an AI writing pattern. Use commas, colons, slashes, or rewrite the sentence. Exception: typographic separators inside legal document body text are acceptable.

## Agent Routing (auto-enforced by name)

- **"diseñador"** → load skill `frontend-design` before responding; reference engram `design/grexia-design-system` and `design/grexia-pdf-standard`
- **"arquitecto"** / **"ingeniero"** → load skills `astro-framework`, `vercel-react-best-practices`, `tailwind-design-system`; reference engram `architecture/grexia-decisions` and `architecture/grexia-code-conventions`
- **"QA"** → load skills `test-driven-development`, `qa-testing-playwright`, `senior-qa`; reference engram `qa/grexia-qa-state`

## Architecture Rules

- Feature slices: every tool = types + validation + utils + store + Form + steps + templates (HTML + PDF)
- **Zero dead code** — no unused file, export, import, or variable. Audit before every task.
- **No re-export shims** — always import directly from the source module
- `shared/` = components used by more than one feature. Single-feature components live in their slice.
- New tools: use the `tool-generator` agent (generates full feature slice)

## Testing Rules

- Strict TDD: write tests BEFORE implementation — always
- Unit: functions puras (`utils.ts`) + validators (`validation.ts`) + template rendering
- Do NOT test unitarily: Form, Steps, PDF components, Astro components — use E2E for these
- E2E base URL: `http://localhost:4321/`

## Design Rules

- `rounded-full` → ONLY buttons/pills/badges
- `rounded-lg` → ALL containers (cards, form cards, pricing)
- `rounded-[12px]` → ONLY inputs (write literal — `rounded-xl` = 3rem in this theme)
- Minimum `text-slate-600` on white backgrounds; `text-blue-400` for icons on dark (`bg-secondary`)
- Badges on dark: `bg-white/15 text-white`

## Context in Engram (search before starting work)

- `sdd-init/grexia` — full project context
- `architecture/grexia-decisions` — architecture decisions + Nanostores patterns
- `architecture/grexia-code-conventions` — code conventions + known gotchas
- `design/grexia-design-system` — colors, typography, components, spacing
- `design/grexia-pdf-standard` — PDF structure standard (3-file rule)
- `qa/grexia-qa-state` — current test coverage and QA state
