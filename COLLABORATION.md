# Direct Light Collaboration

This file is the short current-state handoff for Codex, Claude Code, and the user.

Long historical release notes were archived to:

- `docs/history/COLLABORATION_HISTORY_2026-06-23.md`

Read that archive only when you need old implementation evidence or a release narrative. Do not load it by default.

## Current State

Date: 2026-06-24

Released baseline:

- Latest public release: `v1.0.3` (shadow light-bleeding fix: per-light normal bias + PCF soft-shadow toggle, on top of the `v1.0.2` figure-models release).
- GitHub: https://github.com/oukeming64-tech/direct-light
- GitHub Pages demo: https://oukeming64-tech.github.io/direct-light/
- GitHub Pages showcase: https://oukeming64-tech.github.io/direct-light/showcase/ (Apple MacBook Neo reference-inspired project page; root path remains the live app).
- macOS desktop release is published through Tauri CI.
- `src-tauri/Cargo.lock` is committed. Do not re-add inline `time` pins or `cargo generate-lockfile` steps to `release.yml`; refresh the lock with `.github/workflows/lockfile.yml` when needed.

Current feature line:

- v0.10 multilingual UI is complete and user-accepted (2026-06-24), released as **`v1.0.0`** — the user chose 1.0.0 (not 0.10.0) because this is a major update milestone.
- All app version metadata is `v1.0.3` / `1.0.3` (TopBar / `package.json` / `tauri.conf.json` / `Cargo.toml` / `Cargo.lock`); `v1.0.3` fixes shadow light-bleeding (per-light normal bias + PCF soft-shadow toggle) over the `v1.0.2` figure-models release.
- i18n foundation, v0.10b tier-A core UI extraction, and v0.10.1 built-in display labels + `sceneDiff` localized copy are complete.
- Released: committed + pushed to `main`, tagged `v1.0.0` (web GitHub Pages + Tauri macOS CI).

v1.0.1 — drag-bounds patch (released, tagged `v1.0.1`):

- Free-drag bounds: dragging a light / camera / person / prop on the ground now clamps to the live studio footprint (`width` × `depth`, all four sides incl. the open +Z front, 0.3m margin) instead of a hardcoded ±20m. Pure helper `clampToStudioFootprint` in `src/domain/studioBounds.ts`; `GroundDragController` reads the current `studio` from the store. The camera path still also passes through `clampCameraInsideStudio`.

v1.0.2 — user-customizable figure models (PR #1 + Claude follow-up `e16b3aa`; released, tagged `v1.0.2`):

- New feature from contributor [@zczam](https://github.com/zczam) (PR #1): drop a `.glb` into `src/models/` and it auto-appears in the person panel's "User Models" list. Build-time discovery via `import.meta.glob('/src/models/*.glb', { query: '?url', eager: true })` in `src/data/personModels.ts`; runtime bounding-box auto-scale + ground-lift in `src/scene/PersonGLB.tsx`; best-effort Mixamo bone → `PoseConfig` mapping that no-ops on rigless meshes. `PersonConfig.modelVariant?: string` added (`'dummy'` = procedural rig, any other = id in `PERSON_MODELS`). Ships two figures (哲学家 / 哲学家 (胸像)).
- Claude follow-up `e16b3aa`: default `modelVariant` is `'dummy'` (the procedural rig) everywhere — `Person` dispatch, `buildPersonFromPreset`, `PersonPanel` — so the bundled models are opt-in, not forced. Fixed the `LABEL_OVERRIDES` key that never matched the real bust file id. Dropped the eager `useGLTF.preload`: GLBs now lazy-load on first selection (Suspense falls back to the dummy), so startup no longer fetches multi-MB models nobody asked for. User-accepted 2026-06-25; lint + `tsc -b` + build clean.
- Note: the two `.glb` files are committed as regular files (not LFS) and bundle into `dist` (van 1.3MB / bust 6.2MB). Kept simple per user; LFS would shrink the repo but not the bundle, and the contributor already reverted an LFS attempt.
- Released as `v1.0.2` (2026-06-25): all app version metadata bumped to `1.0.2` (TopBar / `package.json` / `tauri.conf.json` / `Cargo.toml` / `Cargo.lock`), tagged `v1.0.2` (web Pages + Tauri macOS CI). Changelog headline: 在博士的建议下添加了更多哲学人物。

v1.0.3 — shadow light-bleeding fix (contributor PR #2 + Claude integration `0a8cc68`; released, tagged `v1.0.3`):

- Contributor [@zczam](https://github.com/zczam) (PR #2) tackled the VSM light-bleeding exposed by the new GLB figures on curved silhouettes. Two knobs: (1) per-light **normal bias** slider (`LightConfig.normalBias?: number`, 0–0.05) wired into `s.shadow.normalBias` in `src/scene/LightRig.tsx`; (2) a global **soft-shadows (PCF)** toggle (`StudioConfig.shadowMode?: 'variance' | 'soft'`) surfaced in `src/ui/StudioPanel.tsx` under a new "Rendering" section, driving the `<Canvas shadows>` prop in `src/scene/StudioScene.tsx`. Both i18n'd across zh/en/ja. `shadowMode` is an optional studio field (defaults to `'variance'`), so old saved scenes/snapshots stay valid.
- Claude integration `0a8cc68`: the PR passed `vite dev` but failed `npm run lint` (mutating the `useThree()` `gl` return tripped `react-hooks/immutability`) and `tsc -b` (`THREE.Light` base type has no `.shadow`). Slimmed `ShadowModeSync` to do only what R3F's `shadows` prop omits — force shadow-receiving materials to recompile (`material.needsUpdate = true`), since three.js bakes the `SHADOWMAP_TYPE_*` define at material-compile time and `WebGLRenderer.setProgram` never re-derives it on a runtime `shadowMap.type` change. No hook-return mutation, correct typing, single responsibility per piece (R3F = algorithm select, ShadowModeSync = material recompile, LightRig = per-light shadow params). lint + `tsc -b` + build clean.
- Released as `v1.0.3` (2026-06-25): all app version metadata bumped to `1.0.3`, tagged `v1.0.3` (web Pages + Tauri macOS CI). Changelog headline: 给哲学家们擦掉了身上的漏光。

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

- Version metadata is bumped to `v1.0.0` / `1.0.0`.
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
