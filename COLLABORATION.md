# Direct Light Collaboration

Short current-state handoff for Codex, Claude Code, Hermes, and the user.

Archive map: [`docs/history/README.md`](docs/history/README.md). Read archived material only when you need old implementation evidence, old specs, or release narrative.

## Current State

Date: 2026-09-05

Desktop/tagged baseline: `v1.0.5`. Web updates are deployed from main.

- GitHub: https://github.com/oukeming64-tech/direct-light
- Live app/demo: https://oukeming64-tech.github.io/direct-light/
- Project showcase: https://oukeming64-tech.github.io/direct-light/showcase/
- macOS desktop release is published through Tauri CI.
- GitHub Pages root `/direct-light/` remains the live app; `/direct-light/showcase/` is the GitHub visitor page.
- Showcase implementation is isolated under `showcase/`; do not modify main app code under `src/` for project-page-only work.
- `src-tauri/Cargo.lock` is committed. Refresh it with `.github/workflows/lockfile.yml` when needed; do not re-add inline `time` pins or ad hoc `cargo generate-lockfile` steps to release CI.

## Web update · 2026-09-05 · lighting-plan exchange

- Changed: added an offline HTML lighting-plan export with camera preview, top-view diagram, numbered light settings, referenced custom-fixture definitions and an embedded editable scene. The same HTML can be imported into saved presets; the current scene remains in place.
- Changed: imported custom fixture IDs are remapped to preserve existing fixtures, file content is validated without executing HTML, and explicitly empty scene collections now survive normalization.
- Not changed: scene/preset schema, lighting calculations, app language preferences, external figure-model distribution, dependencies, desktop package version or public URLs. This update uses the existing main-to-Pages deployment; it does not create a desktop release.
- Verification: production build/type checks, focused scene round trip and browser export/import passed. Final visual preference remains with the user; desktop packaging has not been rebuilt.

## Latest Release Work and Documentation

2026-07-11 (`v1.0.5` — Japanese copy humanization):

- Release headline: `野獣博士先輩の協力のもと、日本語の読みやすさを改善しました。`
- Changed: rewrote the existing Japanese UI copy across onboarding, lighting, people, camera, studio, presets, A/B comparison, and built-in display labels to remove literal Chinese phrasing, incomplete particles, engineering-heavy wording, and non-native photography terminology.
- Changed: shortened Japanese labels that visibly wrapped in fixed controls, while retaining full fixture names and leaving user-authored / model / brand names untouched.
- Changed: advanced Web, npm, Tauri, Cargo, and current documentation metadata from `1.0.4` to `1.0.5` for the release.
- Documentation correction after publication: removed the empty `[Unreleased]` placeholder above `1.0.5` so the changelog opens directly on the current public release; release contents and artifacts did not change.
- Not changed: localization keys or module structure, typed dictionary architecture, component architecture, state actions, scene / preset / A/B / custom-fixture schemas, rendering behavior and values, Simplified Chinese / English copy, dependencies, public URLs, or showcase code.
- Acceptance: lint, production build, diff check, and 1280x820 browser QA for Japanese onboarding, light, person, and A/B comparison views passed. Final native-language taste remains open to user / native-speaker feedback.

2026-07-10 (`v1.0.4` — onboarding + usability / reliability hardening):

- Changed: added a five-step first-run tour for the main app, localized in Simplified Chinese / English / Japanese, with skip, completion persistence (`direct-light.onboarding.v1`), Escape handling, focus return, and a persistent `?` entry for replay.
- Changed: moved light intensity / position controls directly below the basic light settings; collapsed quick lighting examples into a compact selector below 2xl widths; added a truthful under-960px desktop-first notice instead of letting the studio canvas collapse to zero width.
- Changed: made object rows and saved presets keyboard-selectable, exposed slider / segmented / switch state to assistive technology, kept keyboard actions visible on focus, and synchronized the document language with the runtime language.
- Changed: corrected A/B category comparison so beam, target, fixture, appearance, object, camera, and studio changes are not falsely labeled “same”; passive B rendering is now demand-driven, and shadow maps are rebuilt only when their resolution changes rather than on every slider tick.
- Changed: local persistence mutations now update in-memory presets / custom fixtures only after a successful write and surface three-language failures; custom tube fixtures resolve their real category in 3D; GLB instances use skeleton-safe cloning; Vite/Rolldown production output is split into sub-500 kB chunks without raising the warning threshold.
- Not changed: `SceneConfig`, saved preset / A/B / custom-fixture schemas, lighting formulas, rendering values, default scene contents, figure assets, public URLs, or the showcase product design delivered earlier on 2026-07-10.
- Acceptance: lint, production + Tauri builds, diff check, persistence-failure browser injection, onboarding replay, A/B beam-only diff, custom-fixture visual lookup, GLB model switching, and 1200px / 1024px / 390px browser QA are complete for the `v1.0.4` release line.

2026-07-10 (showcase visual refinement):

- Changed: rebuilt the isolated `/showcase/` page around a Direct Light-specific product story — one restrained navigation bar, a dark studio hero, real product video, interactive lighting/shadow/lens chapters, capability cards, and a clearer three-step workflow.
- Changed: added viewport-aware type and spacing, responsive mobile layouts, visible focus states, reduced-motion handling, transform/opacity-only reveal motion, and an interactive screenshot switcher with correct pressed state.
- Changed: tightened the showcase copy around concrete Direct Light actions (摆灯、看影、进镜头、冻结 A/B), replaced long generic headlines with controlled two-line Chinese display copy, and rebalanced headline sizes, line widths, and mobile wrapping.
- Changed: updated showcase title, description, theme color, and repository-relative favicon path; refreshed current agent guidance and this unreleased record to match the new direction.
- Not changed: the live app under `src/`, product/runtime behavior, rendering values, existing media assets, package dependencies, build/deploy configuration, released version `v1.0.3`, tags, or public URLs.
- Acceptance: deterministic checks and desktop/mobile browser QA are complete; final product/visual taste remains with the user.

2026-07-10 (public contribution paths):

- Changed: added visible Issue / Discussion invitations to both public README front pages, added contribution entry guidance, and clarified that roadmap candidates require scope agreement before implementation.
- Changed: added structured Issue forms and a concise pull-request template under `.github/`; fixed stale contribution-guide references to the removed README desktop section and archived roadmap numbering.
- Changed: enabled GitHub Discussions so non-code feedback, lighting setups, and early ideas have a lower-pressure home than Issues.
- Not changed: application code, runtime behavior, rendering values, product priorities, released version `v1.0.3`, tags, build configuration, or deployment workflows.

2026-06-29:

- Changed: archived completed root specs under `docs/history/specs/`, old Hermes handoff notes under `docs/history/handoffs/`, and full historical snapshots of README / ROADMAP / ARCHITECTURE / RENDERING_SPEC under `docs/history/snapshots/`.
- Changed: rebuilt root `README.md`, `ROADMAP.md`, `ARCHITECTURE.md`, and `RENDERING_SPEC.md` as short current-entry docs, and updated current references to point at archived spec paths.
- Changed: every repository modification must update relevant docs and explicitly record what changed and what did not change.
- Not changed: product/runtime behavior, main app code under `src/`, showcase code, build config, package metadata, release version, tags, deployment workflows, or public URLs.

2026-06-29 (README front pages restored + synced):

- Changed: rebuilt root `README.md` (73 → 118 lines) back into the public showcase front page — hero GIF, screenshots table, emoji feature list, tech stack, project-structure table, known-limits/tradeoffs, and the Dr. Zhang acknowledgement. The full PRD stays archived; `README.md` links to it instead of inlining it.
- Changed: rewrote `README.en.md` as a faithful English mirror of the new `README.md` (also 118 lines, identical section structure); added the Documentation-map / history-archive block (incl. the PRD link) that English readers previously lacked, and dropped the standalone Desktop section in favor of the compact `build:tauri` + unsigned-first-launch note, matching the Chinese front page.
- Not changed: `ROADMAP.md`, `ARCHITECTURE.md`, `RENDERING_SPEC.md` (still short current-entry docs), the archived snapshots under `docs/history/snapshots/`, showcase code, app code, and all release/deploy state.
- Resolved on 2026-07-10: `CONTRIBUTING.md` no longer points desktop-build detail at the removed README "桌面版（macOS）" section; it now points contributors to the current Releases entry and release workflow.

## Released Lines

- `v1.0.0`: first stable major release; multilingual UI complete for Simplified Chinese, English, and Japanese.
- `v1.0.1`: free-drag of lights, camera, people, and props clamps to the studio footprint via `src/domain/studioBounds.ts`.
- `v1.0.2`: user-customizable `.glb` figure models via `src/data/personModels.ts` and `src/scene/PersonGLB.tsx`; dummy remains the default, imported figures lazy-load on selection.
- `v1.0.3`: shadow light-bleeding fix; per-light `normalBias` plus global `studio.shadowMode` (`variance` / `soft`). `ShadowModeSync` only forces material recompilation; do not re-add direct `gl.shadowMap.type` mutation.
- `v1.0.4`: five-step multilingual onboarding, narrow-screen guidance, keyboard/ARIA hardening, complete A/B category detection, persistence failure feedback, custom tube / skeleton-safe GLB fixes, passive-compare and shadow-map performance fixes, and Vite/Rolldown code splitting.
- `v1.0.5`: Japanese copy humanization across onboarding, parameter panels, presets, A/B comparison, and built-in display labels; no schema, rendering, or architecture changes.

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
