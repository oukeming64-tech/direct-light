# Codex Brief: Direct Light

Direct Light is a white-studio lighting previz prototype for directors, DPs, and gaffers.

## Read First

Keep startup context small:

1. `COLLABORATION.md` — current state, active version line, and document map.
2. `ARCHITECTURE.md` — module boundaries when changing code.
3. The directly relevant spec for the files you will touch.

Do not load every historical `V0_*_SPEC.md` by default. Old details live in `docs/history/COLLABORATION_HISTORY_2026-06-23.md` and should be opened only when needed.

## Current Work

- Released baseline: `v1.0.1` (drag-bounds patch over `v1.0.0`, the first stable major release — multilingual UI complete; user chose 1.0.0 over 0.10.0).
- v0.10 multilingual UI is complete locally and user-accepted on 2026-06-24.
- i18n foundation, v0.10b tier-A UI extraction, and v0.10.1 built-in display labels + `sceneDiff` localized copy are complete.
- Release operation is complete: `main` was pushed and `v1.0.0` was tagged/published.
- `v1.0.1` (released, tagged): free-drag of light/camera/person/prop now clamps to the studio footprint via `src/domain/studioBounds.ts` (`clampToStudioFootprint`), used by `GroundDragController`.
- `LIGHT_TYPE_LABELS` and `LIGHT_TARGET_MODE_LABELS` are unused but intentionally retained until a later Codex-approved cleanup.

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
