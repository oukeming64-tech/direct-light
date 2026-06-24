# Hermes Brief: Direct Light

Hermes is a separate user-relayed coding agent for bounded drafts. Hermes is not OpenRouter, and Hermes does not own features.

Long historical Hermes handoff notes were archived to:

- `docs/history/HERMES_HISTORY_2026-06-23.md`

Read that archive only when reviewing old Hermes behavior or reconstructing an old handoff.

## Read First

For any assigned Hermes task, read:

1. `COLLABORATION.md` — current project state and document map.
2. `ARCHITECTURE.md` — module boundaries.
3. `HERMES_LESSONS.md` — concrete prior misses Hermes must avoid.
4. The exact spec and source files named in the handoff.

Do not load every historical spec by default. Completed feature specs are reference material only.

## Role Boundary

Hermes should:

- Draft code for a narrow task with explicit write scope.
- Follow existing data structures, naming, and folder boundaries.
- Keep patches small enough for Claude/Codex review.
- Run deterministic checks when practical.
- Report what changed, what was not done, validation, known limits, and needed review.

Hermes must not:

- Redefine product direction.
- Implement an entire feature unless the handoff explicitly assigns that whole feature.
- Add dependencies without explicit approval.
- Move large folders or do broad refactors.
- Touch unrelated files.
- Revert user, Claude Code, or Codex changes.
- Mark work complete before Claude/Codex review and user acceptance when those are required.
- Change rendering values, fixture/modifier values, product copy, or schemas unless exact replacement text/value is in the assigned handoff.

## Current Active Line

- Released baseline: `v1.0.0` (first stable release — multilingual UI complete; user chose 1.0.0 over 0.10.0).
- v0.10 multilingual UI is complete locally and user-accepted on 2026-06-24.
- i18n foundation, v0.10b tier-A UI extraction, v0.10.1 built-in display labels + `sceneDiff` localized copy, and v0.10 closeout are complete.
- `LIGHT_TYPE_LABELS` and `LIGHT_TARGET_MODE_LABELS` are unused but intentionally retained until a later Codex-approved cleanup.

For v0.10:

- Language is an app preference, not scene data.
- Do not add language fields to `SceneConfig`, presets, A/B snapshots, custom fixtures, or custom fixture packs.
- Do not mutate built-in data tables for display language.
- Use display helpers keyed by ids.
- Do not add a heavy i18n dependency unless approved.

## Architecture Rules

- `src/App.tsx` and `src/app/AppShell.tsx` stay thin.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are re-export shells.
- UI implementation belongs in `src/ui/*`, `src/ui/light-panel/*`, and `src/ui/object-list/*`.
- State action logic belongs in `src/state/actions/*`.
- Domain helpers belong in `src/domain/*`.
- Rendering belongs in `src/scene/*`.
- Data/spec tables belong in `src/data/*`.

## Done Means Docs Are Current

A handoff is not complete until code and current docs agree.

Before claiming completion:

- Search for stale current-state language in `COLLABORATION.md`, `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, and `HERMES.md` when relevant.
- Do not leave completed work listed as "next", "not done", or pending unless it is historical and clearly labeled.
- Include edge cases checked in the report, not only green build/lint status.

## Handoff Report Format

Use this structure:

```md
## Hermes Handoff

Task:
- ...

Changed files:
- `path/to/file.ts` — what changed

Behavior:
- ...

Validation:
- `npx tsc -b`: passed / failed / not run
- `npm run lint`: passed / failed / not run
- `npm run build`: passed / failed / not run
- `git diff --check`: passed / failed / not run

Known limits:
- ...

Needs review from:
- Codex: product / architecture / visual judgment
- Claude Code: integration / type safety / edge cases
- User: human visual check, if applicable
```

Do not hide partial failures. A failed check with a clear note is better than a vague success report.
