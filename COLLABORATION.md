# Direct Light Collaboration

Short current-state handoff for Codex, Claude Code, Hermes, and the user.

Archive map: [`docs/history/README.md`](docs/history/README.md). Read archived material only when you need old implementation evidence, old specs, or release narrative.

## Current State

Date: 2026-06-29

Released baseline: `v1.0.3`.

- GitHub: https://github.com/oukeming64-tech/direct-light
- Live app/demo: https://oukeming64-tech.github.io/direct-light/
- Project showcase: https://oukeming64-tech.github.io/direct-light/showcase/
- macOS desktop release is published through Tauri CI.
- GitHub Pages root `/direct-light/` remains the live app; `/direct-light/showcase/` is the GitHub visitor page.
- Showcase implementation is isolated under `showcase/`; do not modify main app code under `src/` for project-page-only work.
- `src-tauri/Cargo.lock` is committed. Refresh it with `.github/workflows/lockfile.yml` when needed; do not re-add inline `time` pins or ad hoc `cargo generate-lockfile` steps to release CI.

## Latest Documentation Cleanup

2026-06-29:

- Changed: archived completed root specs under `docs/history/specs/`, old Hermes handoff notes under `docs/history/handoffs/`, and full historical snapshots of README / ROADMAP / ARCHITECTURE / RENDERING_SPEC under `docs/history/snapshots/`.
- Changed: rebuilt root `README.md`, `ROADMAP.md`, `ARCHITECTURE.md`, and `RENDERING_SPEC.md` as short current-entry docs, and updated current references to point at archived spec paths.
- Changed: every repository modification must update relevant docs and explicitly record what changed and what did not change.
- Not changed: product/runtime behavior, main app code under `src/`, showcase code, build config, package metadata, release version, tags, deployment workflows, or public URLs.

2026-06-29 (README front pages restored + synced):

- Changed: rebuilt root `README.md` (73 → 118 lines) back into the public showcase front page — hero GIF, screenshots table, emoji feature list, tech stack, project-structure table, known-limits/tradeoffs, and the Dr. Zhang acknowledgement. The full PRD stays archived; `README.md` links to it instead of inlining it.
- Changed: rewrote `README.en.md` as a faithful English mirror of the new `README.md` (also 118 lines, identical section structure); added the Documentation-map / history-archive block (incl. the PRD link) that English readers previously lacked, and dropped the standalone Desktop section in favor of the compact `build:tauri` + unsigned-first-launch note, matching the Chinese front page.
- Not changed: `ROADMAP.md`, `ARCHITECTURE.md`, `RENDERING_SPEC.md` (still short current-entry docs), the archived snapshots under `docs/history/snapshots/`, showcase code, app code, and all release/deploy state.
- Note (pre-existing follow-up): `CONTRIBUTING.md` still points desktop-build detail at the README "桌面版（macOS）" section, which both front pages now fold into a one-liner; the full steps live in the archived `README_FULL` snapshot. Repoint when convenient.

## Released Lines

- `v1.0.0`: first stable major release; multilingual UI complete for Simplified Chinese, English, and Japanese.
- `v1.0.1`: free-drag of lights, camera, people, and props clamps to the studio footprint via `src/domain/studioBounds.ts`.
- `v1.0.2`: user-customizable `.glb` figure models via `src/data/personModels.ts` and `src/scene/PersonGLB.tsx`; dummy remains the default, imported figures lazy-load on selection.
- `v1.0.3`: shadow light-bleeding fix; per-light `normalBias` plus global `studio.shadowMode` (`variance` / `soft`). `ShadowModeSync` only forces material recompilation; do not re-add direct `gl.shadowMap.type` mutation.

`LIGHT_TYPE_LABELS` and `LIGHT_TARGET_MODE_LABELS` are unused but intentionally retained until a later Codex-approved cleanup.

## Hard Boundaries

- Language is an app preference, not scene data.
- Do not add language fields to `SceneConfig`, saved presets, A/B snapshots, custom fixtures, or custom fixture packs.
- Do not translate user-authored names, custom fixture labels, brands, model names, ids, units, or JSON schema fields.
- Do not mutate built-in data tables just to change display language; use display helpers keyed by id.
- Do not add a heavy i18n dependency unless the user explicitly approves it.
- Do not reopen v0.7 / v0.8 / v0.9 or completed v0.6 rendering/gear work unless fixing a concrete regression.

## Stable Architecture

- `src/App.tsx` and `src/app/AppShell.tsx` stay thin.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are compatibility re-export shells; implementation lives in their subdirectories.
- State action logic belongs in `src/state/actions/*`, not `src/state/store.ts`.
- Rendering belongs in `src/scene/*`.
- Product/domain logic belongs in `src/domain/*`.
- Stable presets and specs belong in `src/data/*`.
- Showcase-only work belongs in `showcase/`.

## Completed Lines

Do not reopen unless fixing a concrete regression:

- v0.4 camera, pose, support binding, and store split.
- v0.5 fixture presets and rendering credibility.
- v0.6 modifiers, visible modifier bodies, control gear, gear optics, and closeout.
- v0.7 open-source release, GitHub Pages, Tauri desktop packaging, and icon.
- v0.8 six-light management.
- v0.9 custom fixture import/export.
- v0.10 multilingual UI.

## Working Agreements

- OpenRouter is Claude Code's code-drafting path, not Hermes.
- Hermes is separate and user-relayed. Use `HERMES.md` only when preparing or reviewing an explicit Hermes handoff.
- A feature is not done if current docs still describe it as next, unfinished, or unaccepted.
- Every repository modification must update the relevant docs before completion and explicitly state what changed and what did not change.
- Human verifies small pose/rig visual tweaks; run deterministic checks, then hand them to the user.
- User visual acceptance is authoritative for visual/product feel.

## Document Map

Read by default:

- `COLLABORATION.md` for current state.
- `ARCHITECTURE.md` for module boundaries when changing code.
- The directly relevant current spec or archived spec for the files you touch.

Read when relevant:

- `RENDERING_SPEC.md` for current rendering/light/shadow guardrails.
- `ROADMAP.md` for current candidate work.
- `CHANGELOG.md` for user-facing release notes.
- `CONTRIBUTING.md` for contribution workflow.
- `HERMES.md` and `HERMES_LESSONS.md` for Hermes handoffs.
- `docs/history/specs/V0_10_I18N_SPEC.md` for language-work history.
- `docs/history/specs/V0_10_1_DISPLAY_COPY_SPEC.md` for built-in display-label and `sceneDiff` localization history.
- `docs/history/specs/V0_9_CUSTOM_FIXTURE_SPEC.md` for custom fixture import/export history.
- `docs/history/specs/V0_8_MULTI_LIGHT_SPEC.md` for six-light-management history.
- `docs/history/specs/V0_6*_SPEC.md` for modifier, control gear, and optics history.
- `docs/history/specs/V0_4C_CAMERA_SPEC.md` for camera-control history.
- `docs/history/README.md` for the full archive map.
