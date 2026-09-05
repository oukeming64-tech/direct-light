# Codex Brief: Direct Light

Direct Light is a white-studio lighting previz prototype for directors, DPs, and gaffers.

## Read First

Keep startup context small:

1. `COLLABORATION.md` — current state, active version line, and document map.
2. `ARCHITECTURE.md` — module boundaries when changing code.
3. The directly relevant spec for the files you will touch.

Do not load every historical `V0_*_SPEC.md` by default. Completed specs live in `docs/history/specs/`; old narrative details live in `docs/history/COLLABORATION_HISTORY_2026-06-23.md`.

## Current Work

- Released baseline: `v1.0.5` (Japanese copy humanization, over the `v1.0.4` onboarding + usability/reliability hardening, `v1.0.3` shadow fix, `v1.0.2` figure models, `v1.0.1` drag bounds, and `v1.0.0` multilingual stable release).
- v0.10 multilingual UI is complete locally and user-accepted on 2026-06-24.
- i18n foundation, v0.10b tier-A UI extraction, and v0.10.1 built-in display labels + `sceneDiff` localized copy are complete.
- Release operation is complete: `main` was pushed and `v1.0.0` was tagged/published.
- `v1.0.1` (released, tagged): free-drag of light/camera/person/prop now clamps to the studio footprint via `src/domain/studioBounds.ts` (`clampToStudioFootprint`), used by `GroundDragController`.
- `v1.0.2` (released, tagged 2026-06-25): user-customizable figure models. Contributor PR #1 (@zczam) + Claude follow-up `e16b3aa`. Drop a `.glb` into `src/models/` → auto-discovered via Vite glob in `src/data/personModels.ts`, rendered by `src/scene/PersonGLB.tsx` (bbox auto-scale + ground-lift, best-effort Mixamo bone mapping). `PersonConfig.modelVariant?: string` (`'dummy'` = procedural rig, default). Ships two figures (哲学家 / 哲学家 (胸像)); dummy stays default, GLBs lazy-load on selection (no eager preload). Two `.glb` committed as regular files (not LFS), bundle into `dist`. Changelog headline: 在博士的建议下添加了更多哲学人物。
- `v1.0.3` (released, tagged 2026-06-25): shadow light-bleeding fix. Contributor PR #2 (@zczam) + Claude integration `0a8cc68`. Per-light `LightConfig.normalBias?: number` (0–0.05) → `s.shadow.normalBias` in `src/scene/LightRig.tsx`; global `StudioConfig.shadowMode?: 'variance' | 'soft'` (optional, defaults `'variance'`) toggled in `src/ui/StudioPanel.tsx`'s new Rendering section, driving the `<Canvas shadows>` prop. `ShadowModeSync` in `src/scene/StudioScene.tsx` does ONLY the material recompile R3F omits (`material.needsUpdate = true`) — three.js bakes the `SHADOWMAP_TYPE_*` define at material-compile time and never re-derives it on a runtime `shadowMap.type` change. Do not re-add `gl.shadowMap.type` mutation there (trips `react-hooks/immutability`) or type traversed nodes as `THREE.Light` (no `.shadow` on the base type). Changelog headline: 给哲学家们擦掉了身上的漏光。
- `v1.0.4` (released, tagged 2026-07-10): five-step multilingual onboarding + `?` replay, under-960px desktop guidance, keyboard/ARIA fixes, complete A/B category comparison, persistence failure feedback, custom tube / skeleton-safe GLB fixes, demand-driven passive B rendering, shadow-map rebuilds limited to resolution changes, and Vite/Rolldown sub-500 kB code splitting. Scene/preset schemas and rendering values did not change.
- `v1.0.5` (released, tagged 2026-07-11): Japanese copy humanization across onboarding, lighting, people, camera, studio, presets, A/B comparison, and built-in display labels. Changelog headline: 野獣博士先輩の協力のもと、日本語の読みやすさを改善しました。 Localization keys, typed-dictionary structure, scene/preset schemas, rendering values, and component architecture did not change.
- GitHub Pages has two public entry points: root `/direct-light/` is the live app/demo, and `/direct-light/showcase/` is the Direct Light product story for GitHub visitors. The showcase keeps Apple-inspired restraint and scale, but its current visual language is Direct Light-specific: dark studio surfaces, white-studio media, colored-light accents, and interactive screenshot storytelling.
- Showcase-only work belongs under `showcase/`; do not touch main app code under `src/` for GitHub Pages/project-page changes.
- `LIGHT_TYPE_LABELS` and `LIGHT_TARGET_MODE_LABELS` are unused but intentionally retained until a later Codex-approved cleanup.

## Web / Main Update

2026-09-05: lighting-plan HTML export/import ships on main and through the existing Pages deployment. See COLLABORATION and ARCHITECTURE for behavior and verification. Import creates saved presets and remapped custom fixtures; it does not replace the active scene. The tagged desktop package remains v1.0.5. Verify Pages deployment separately from source publication; user visual acceptance remains authoritative.

## Hard Boundaries

- Language is an app preference, not scene data.
- Do not add language fields to `SceneConfig`, saved presets, A/B snapshots, custom fixtures, or custom fixture packs.
- Do not translate user-authored names, custom fixture labels, brands, model names, ids, units, or JSON schema fields.
- Do not mutate built-in data tables just to change display language; use display helpers keyed by id.
- Do not add a heavy i18n dependency unless the user explicitly approves it.
- Do not reopen v0.7/v0.8/v0.9 or completed v0.6 rendering/gear work unless fixing a concrete regression.

## Architecture Rules

- Keep `src/App.tsx` and `src/app/AppShell.tsx` thin.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are re-export shells; implementation belongs in their subdirectories.
- State actions belong in `src/state/actions/*`; do not put action logic back into `src/state/store.ts`.
- Rendering code belongs in `src/scene/*`.
- Domain/business helpers belong in `src/domain/*`.
- Stable specs and presets belong in `src/data/*`.

## Working Agreements

- OpenRouter is Claude Code's code-drafting path, not Hermes. Codex reviews specs, product wording, architecture choices, and outcomes.
- Hermes is separate and user-relayed. Use `HERMES.md` only when preparing or reviewing an explicit Hermes handoff.
- A Direct Light feature is not done if current docs still describe it as next, unfinished, or not accepted.
- Every repository modification must update the relevant docs before completion. The doc update must explicitly say what changed and what did not change, so future handoffs do not infer scope from code alone.
- Human verifies small pose/rig visual tweaks; run deterministic checks, then hand them to the user.
- User visual acceptance is authoritative for visual/product feel.

## Current Product Goal

Build a usable web prototype that helps directors preview how people, light position, light distance, fixture type, light color, and light height affect illumination and shadows inside a white studio.

Most important behavior:

- Light changes visibly affect people and shadows in real time.
- Lower lights create longer ground shadows; higher lights create shorter shadows.
- Hard/soft/panel lights read differently.
- Colored lights tint people and white studio surfaces.
- White studio reflectance makes shadows lighter and the image flatter.
