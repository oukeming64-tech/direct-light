# Direct Light Collaboration

This file is the short current-state handoff for Codex, Claude Code, and the user.

Long historical release notes were archived to:

- `docs/history/COLLABORATION_HISTORY_2026-06-23.md`

Read that archive only when you need old implementation evidence or a release narrative. Do not load it by default.

## Current State

Date: 2026-06-24

Released baseline:

- Latest public release: `v1.0.0` (first stable release — multilingual UI complete).
- GitHub: https://github.com/oukeming64-tech/direct-light
- GitHub Pages demo: https://oukeming64-tech.github.io/direct-light/
- macOS desktop release is published through Tauri CI.
- `src-tauri/Cargo.lock` is committed. Do not re-add inline `time` pins or `cargo generate-lockfile` steps to `release.yml`; refresh the lock with `.github/workflows/lockfile.yml` when needed.

Current feature line:

- v0.10 multilingual UI is complete and user-accepted (2026-06-24), released as **`v1.0.0`** — the user chose 1.0.0 (not 0.10.0) for this major milestone.
- All app version metadata is `v1.0.0` / `1.0.0` (TopBar / `package.json` / `tauri.conf.json` / `Cargo.toml` / `Cargo.lock`).
- i18n foundation, v0.10b tier-A core UI extraction, and v0.10.1 built-in display labels + `sceneDiff` localized copy are complete.
- Released: committed + pushed to `main`, tagged `v1.0.0` (web GitHub Pages + Tauri macOS CI).

## v0.10 Status

Specification:

- Primary spec: `V0_10_I18N_SPEC.md`.
- Language is an app preference, not scene data.
- Supported languages: `zh-CN`, `en`, `ja`.
- Use the in-repo typed i18n layer under `src/i18n/*`; do not add a heavy i18n dependency.

Completed:

- `src/i18n/*` foundation: language metadata, typed message dictionaries, `t()`, `useT()`.
- Store preference: top-level `language` + `setLanguage`.
- Persistence: `direct-light.language.v1`.
- UI: language menu, TopBar, ViewBadge, object list, main panels, light panels, preset bar, and A/B tier-A chrome now use translations.
- Built-in data-derived display labels and director-facing derived summaries now localize through `src/i18n/display.ts` / `src/i18n/messages/display.ts`.
- Deterministic check from Claude: switching language preserved `scene`, `customFixtures`, `presets`, and `compareB` references.

v0.10.1 — complete and user-accepted:

- `src/i18n/messages/display.ts` (~120 keys, verbatim from spec §5) + pure helper layer `src/i18n/display.ts` (getLightTypeLabel / getFixtureDisplayLabel / getFixtureCapabilityLabel / getModifier* / getLightTargetModeLabel / getColorPresetLabel / getCameraPresetLabel / getPosePresetLabel + legacy aliases / getSceneObject*Label / getSupportSurfaceLabel / getDebugPresetTitle).
- Domain functions now take `language`: `formatEffectiveLightSummary`, `summarizeLighting`, `getLightBrief` (now resolves built-in + custom fixtures), `compareScenes` (+ all hints/labels/poseLabel), `getPersonSupportSurfaces`.
- Wired all visible call sites (light-panel/*, object-list/*, CameraPanel, PersonPanel, ObjectPanel, DirectorLightBrief, ComparePane, CompareStage, TopBar debug-preset titles). Dead `getObjectSupportLabel` removed.
- Source data tables untouched (§3/§4). `LIGHT_TYPE_LABELS` (rendering.ts) and `LIGHT_TARGET_MODE_LABELS` (lightTargets.ts) are now unused but retained per the do-not-touch allowlist — candidates for a later Codex-approved prune.
- `tsc·lint·build·diff-check` green; raw-Chinese scan shows no rendered CJK literals in `src/ui`/`src/app` (only comments / docs / source-data / allowed validation messages).
- User real-machine visual acceptance passed on 2026-06-24. Codex copy review found no blocking en/ja changes; spec §5 remains the authoritative first-pass wording.

v0.10 closeout:

- Version metadata is bumped to `v0.10.0` / `0.10.0`.
- `LIGHT_TYPE_LABELS` in `src/data/rendering.ts` and `LIGHT_TARGET_MODE_LABELS` in `src/domain/lightTargets.ts` are now unused and non-rendered. They are retained for this release because the v0.10.1 write scope did not require mutating those source files; they can be pruned later with Codex approval.
- Ready for Claude to publish to GitHub.

## Stable Architecture

- `src/App.tsx` and `src/app/AppShell.tsx` must stay thin.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are compatibility re-export shells. Real implementation belongs under `src/ui/light-panel/*` and `src/ui/object-list/*`.
- State entry is `src/state/store.ts`; action logic belongs in `src/state/actions/*`.
- Product/domain pure logic belongs in `src/domain/*`.
- Rendering belongs in `src/scene/*`.
- Data/spec tables belong in `src/data/*`.
- Do not put language, custom fixture data, gear optics, or rendering-derived values into `SceneConfig`.

## Completed Lines

Do not reopen these unless fixing a concrete regression:

- v0.4.7 camera controls.
- v0.4.8 store action split.
- v0.5 fixture preset library.
- v0.5.1 rendering credibility.
- v0.6 control modifiers, visible modifier bodies, in-studio gear, gear optics, and v0.6e closeout.
- v0.7 open-source release, GitHub Pages, Tauri desktop packaging, and v0.7.1 icon.
- v0.8 six-light management.
- v0.9 custom fixture import/export.
- v0.10 multilingual UI.

## Working Agreements

- OpenRouter is Claude Code's code-drafting path, not Hermes. Claude reviews and integrates OpenRouter drafts.
- Hermes is a separate user-relayed agent. Use `HERMES.md` only when writing or reviewing a Hermes handoff.
- For Direct Light handoffs, docs and code must agree before a feature is considered done.
- Human verifies small pose/rig visual tweaks; do not spend time driving the R3F preview for those.
- User visual acceptance is authoritative for visual/product feel.

## Document Map

Read by default:

- `COLLABORATION.md` for current state.
- `ARCHITECTURE.md` for module boundaries when changing code.
- The directly relevant spec for the file you are touching.

Read only when relevant:

- `V0_10_I18N_SPEC.md` for language work.
- `V0_10_1_DISPLAY_COPY_SPEC.md` for the completed built-in display-label / scene-diff localization slice.
- `V0_9_CUSTOM_FIXTURE_SPEC.md` for custom fixture import/export.
- `V0_8_MULTI_LIGHT_SPEC.md` for light count/list/rig changes.
- `V0_6*_SPEC.md` for modifier/gear/optics changes.
- `V0_4C_CAMERA_SPEC.md` for camera controls.
- `RENDERING_SPEC.md` for rendering/light/shadow numbers.
- `HERMES.md` and `HERMES_LESSONS.md` for Hermes handoffs.
- `docs/history/COLLABORATION_HISTORY_2026-06-23.md` for old release details.
