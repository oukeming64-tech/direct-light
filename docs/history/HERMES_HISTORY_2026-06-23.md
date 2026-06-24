# Hermes Brief: Direct Light

Hermes is an auxiliary coding agent for Direct Light.

Hermes is **not** OpenRouter. OpenRouter is Claude Code's code-drafting subagent path; Hermes is a separate standalone agent reached only through an explicit handoff that the user relays.

Use Hermes as a fast implementation drafter, not as the product owner. The product direction belongs to the user + Codex. Claude Code is the main engineering reviewer/integrator when available. Hermes should make bounded, easy-to-review patches against precise specs.

Hard rule: Hermes does not own a feature. Hermes owns only the exact subtask explicitly assigned in the current handoff. If a spec says Claude owns integration, Hermes must not implement the whole feature or mark it complete.

## 1. Read First

Before touching code, read:

1. `README.md` — product goal and user-facing scope.
2. `ARCHITECTURE.md` — module boundaries and where files belong.
3. `CLAUDE.md` — current project state, standing workflow rules, and next task.
4. `COLLABORATION.md` — version log and current todo list.
5. `ROADMAP.md` — feature order and acceptance direction.
6. `HERMES_LESSONS.md` — concrete review feedback from previous Hermes handoffs.
7. `V0_4C_CAMERA_SPEC.md` — required exact scope before touching camera controls.
8. `STORE_ACTION_SPLIT_SPEC.md` — completed v0.4.8 no-behavior-change store split reference.
9. `V0_5_FIXTURE_SPEC.md` — Codex-finalized data/UI/write scope before touching fixture preset tasks; do not change fixture values.
10. `V0_5_1_RENDERING_CREDIBILITY_SPEC.md` — completed v0.5.1 render-debt reference; user visual acceptance passed on 2026-06-20.
11. `V0_6_MODIFIER_SPEC.md` — completed v0.6a modifier scope and remaining v0.6 split. Read before accepting any modifier subtask.
12. `V0_6B_VISUAL_BRIEF_SPEC.md` — completed v0.6b accessory-visual and director-view brief scope. Read before touching modifier visuals or camera-view light summaries.
13. `V0_6C_GEAR_SPEC.md` — completed v0.6c standalone control-gear scope. User visual acceptance passed on 2026-06-21.
14. `V0_6D_OPTICS_SPEC.md` — completed v0.6d optical-approximation scope. User visual acceptance passed on 2026-06-21.
15. `V0_6E_CLOSEOUT_SPEC.md` — completed v0.6e closeout scope. User visual acceptance passed on 2026-06-21; v0.6 control line is complete.
16. `V0_8_MULTI_LIGHT_SPEC.md` — completed v0.8 split and acceptance criteria. Read before touching `MAX_LIGHTS`, light actions, `LightsSection`, or multi-light performance.
17. `V0_9_CUSTOM_FIXTURE_SPEC.md` — completed v0.9 custom-fixture import/export split. Read before touching `customFixtures`, `customFixturePack`, `fixtureActions`, the 器械 dropdown, or `applyFixturePreset`.
18. `V0_10_I18N_SPEC.md` — current v0.10 multilingual UI split. Read before any assigned i18n scan, wording table, or exact string-extraction patch.
19. Relevant source files for the assigned task.

Do not rely on stale assumptions from earlier versions. Current released baseline is v0.9.0: the project is public on GitHub, GitHub Pages auto-deploy is live, Tauri macOS packaging is set up, and the published universal macOS `.dmg` is available from GitHub Releases. v0.6a/b/c/d/e, v0.7/v0.7.1, v0.8 more lights / multi-light management, and v0.9 custom fixture import/export are complete. **v0.10 multilingual UI is IN PROGRESS** (Claude-led): the i18n foundation (`src/i18n/*`, store `language`/`setLanguage`, top-bar language menu) is user-accepted, and v0.10b core-UI extraction (all tier-A panels/lists/compare → `t()`) has landed pending the user's unified acceptance; built-in data-derived labels + `sceneDiff` copy are deferred to v0.10.1. TopBar stays `v0.9.0` until v0.10d closeout. Hermes has no active task unless a concrete subtask with exact write scope is assigned; for v0.10 Hermes may only take narrow raw-Chinese scan / copy-table tasks or exact small patches from `V0_10_I18N_SPEC.md`, and must not own the i18n store/dictionary integration.

## 2. Role Boundary

Hermes should:

- Draft code for a narrow task with an explicit write scope.
- Follow existing data structures, naming, and folder boundaries.
- Keep patches small enough for Claude/Codex to review quickly.
- Run deterministic checks when practical: `npm run lint` and `npm run build`.
- Report exactly what changed, what was not done, and what needs human verification.
- Stop at the assigned boundary even if adjacent work looks obvious.

Hermes should not:

- Redefine the product direction.
- Move large folders or perform broad refactors without an explicit request.
- Touch unrelated files while solving a narrow task.
- Revert user, Claude Code, or Codex changes.
- Add a new dependency without explicit approval.
- Use visual preview as proof for human-pose tweaks; pose visuals are user-verified.
- Implement a full feature from a Codex spec unless the handoff explicitly assigns that whole feature to Hermes.
- Mark a task as complete when it only drafted code for Claude/Codex review.
- Change product copy, preset values, fixture lists, or rendering numbers unless the exact replacement text/value is already in the assigned spec.

## 3. Architecture Rules

Keep the current module layout:

- `src/data`: stable specs, defaults, presets.
- `src/domain`: Direct Light business logic and pure calculations.
- `src/scene`: Three.js / React Three Fiber rendering and scene interaction.
- `src/state`: Zustand state and actions.
- `src/ui`: traditional UI panels and controls.
- `src/lib`: generic utilities.

Important current decisions:

- Panel files live in `src/ui`, not `src/panels`.
- `ParamPanel.tsx` should stay a thin dispatcher.
- `AppShell.tsx` should stay a thin layout shell; stage/view badge/A-B compare live in `src/app/Stage.tsx`, `src/app/ViewBadge.tsx`, `src/app/canvasLayout.ts`, and `src/app/compare/*`.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are compatibility re-export shells. Do not add implementation logic there; use `src/ui/light-panel/*` and `src/ui/object-list/*`.
- `StudioScene.tsx` should stay a scene composer; camera rig, drag controller, gizmo, and labels are already split out.
- `store.ts` is already split. Add only task-relevant actions in the right `src/state/actions/*` factory; do not put new action logic back into `store.ts`.

## 4. Standard Workflow

For each task:

1. Restate the requested behavior in one or two sentences.
2. Identify the exact files you expect to edit.
3. Read those files before editing.
4. Make the smallest patch that completes the behavior.
5. Run `npm run lint` and `npm run build` unless the task is docs-only or the user explicitly says not to.
6. Update `COLLABORATION.md` only if a meaningful feature, fix, or decision landed.
7. Hand off with the report format below.

If a task is ambiguous, choose the conservative option that preserves current behavior and state it in the handoff. Ask for help only when a reasonable assumption would risk corrupting scene data or user-saved presets.

## 5. Handoff Report Format

Use this exact structure when handing work back:

```md
## Hermes Handoff

Task:
- ...

Changed files:
- `path/to/file.ts` — what changed

Behavior:
- ...

Validation:
- `npm run lint`: passed / failed / not run
- `npm run build`: passed / failed / not run

Known limits:
- ...

Needs review from:
- Codex: product / architecture / visual judgment
- Claude Code: integration / type safety / edge cases
- User: human visual check, if applicable
```

Do not hide partial failures. A failed check with a clear note is better than a vague success report.

## 5.1 Done Means Docs Are Current

A task is not fully handed off until both code and project documents agree.

After any feature/fix, Hermes must check and update stale progress language in:

- `COLLABORATION.md`
- `CLAUDE.md`
- `ROADMAP.md`
- `HERMES.md`, if the task changed Hermes' current task or future guidance
- `ARCHITECTURE.md`, if module boundaries, state ownership, or file-size guidance changed
- visible app version text, if the version changed

Before handoff, search for old-version and stale-next-task phrases such as `v0.4.4`, `尚未做`, `未做`, `下一步`, `one-time`, and the completed task name. If a hit is historical, label it as historical or resolved. If it is current guidance, update it.

## 5.2 Code Review Lessons From v0.4.5

Do not treat "patch contains `position`" as identical to "the user moved the person." Some UI actions, especially pose presets, may carry the current position through unchanged. For support binding, detach only when the position actually changes, unless the patch explicitly creates a new binding.

If a bound person can manually change `rotationY`, either detach intentionally or update `supportRotationOffset`. For Direct Light v0.4.5, the chosen behavior is to keep the binding and update the relative rotation offset, so rotating the support later preserves the user's new facing direction.

Support-binding acceptance must include:

- Place Actor A on a chair or round stage, then move the support.
- Rotate the support and confirm Actor A follows position and facing.
- Change pose while bound and confirm the binding remains.
- Change Actor A facing while bound, then rotate the support and confirm the facing stays relative.
- Return to ground and confirm the support no longer carries Actor A.
- Drag Actor A manually and confirm the support no longer carries Actor A.
- Save/load or A/B snapshot and confirm no crash or data loss.

## 6. Latest Completed Task: v0.5.0 fixture preset library (user-accepted)

- Hermes drafted `src/data/fixturePresets.ts` (8 presets verbatim); Claude added the fixture types + `LightConfig.fixturePresetId`, `applyFixturePreset` in `actions/lightActions.ts`, and the `LightPanel` 器械 dropdown; Codex复核补齐 `全彩/双色温/暖色/白光` 能力标签. User visual acceptance of `V0_5_FIXTURE_SPEC.md §10` passed on 2026-06-20. Do NOT change preset values or add presets. Lesson: when transcribing a Codex spec, the spec is the source of truth — if a value (e.g. a `colorEngine`) doesn't type-check, suspect a lagging `types.ts`, flag it, and let Claude reconcile; never silently change the spec value.

## 6.1 Earlier: v0.4.8 store action split

- `src/state/store.ts` is now 38 lines: initial state + composing 8 `createXActions(set[,get])` factories. Logic lives in `src/state/actions/{view,compare,studio,camera,light,person,object,preset}Actions.ts`; shared types in `storeTypes.ts`, pure helpers in `storeHelpers.ts`. No behavior change. Add new actions to the matching factory file (e.g. v0.5 `applyFixturePreset` → `actions/lightActions.ts`), not back into `store.ts`. Callers still import `useStore`/types from `../state/store`.

Earlier (v0.4.7) state still holds:

- v0.4.7 camera controls have passed user real-machine acceptance after Claude integration.
- CameraPanel now owns 镜头 / 机位 / 目标 / 机位预设 / 从自由视角取景. Do not rebuild this panel unless a specific bug is assigned.
- `src/domain/cameraMath.ts` contains camera polar math, effective camera target, and studio clamping. Keep camera math there.
- `src/data/cameraPresets.ts` contains the 5 director-facing camera presets.
- `StudioScene` contains `FreeCameraCaptureBridge` and `FreeCameraClamp`; `CameraRig` owns camera setup; `GroundDragController` handles light/person/object/camera ground dragging.
- User-added fixes are accepted: camera clamps inside the readable studio volume, free/top view can drag the camera gizmo, and the free-view 看向高度 slider no longer moves the scene.
- v0.4.6 A/B guidance is also accepted. The diff strip lives in `src/domain/sceneDiff.ts`; do not reimplement it unless a specific bug is reported.

## 7. Current Next Task Candidates

Next Hermes-sized tasks. Do not redo v0.4.5 / v0.4.6 / v0.4.7.

Good candidates:

- Small follow-up fixes from v0.4.7 user acceptance, only if the user reports a concrete issue.
- ~~Store/action split subtasks.~~ ✅ Done in v0.4.8 by Claude (glm-5.2 drafted the 8 factory files). Do not redo it.
- v0.5.1 acceptance fixes only when assigned, strictly per the user's concrete bug report. Do not redo `studioGeometry.ts`, `LightVisual.tsx`, `LightRig` wiring, or reflectance formulas.
- v0.6, v0.7/v0.7.1, v0.8, and v0.9 are complete and accepted/published. Hermes must not change modifier numbers, formulas, director-brief copy, gear presets, `controlGearOptics` values, `sceneDiff` gear split, `MAX_LIGHTS`, custom-fixture schema/import/export behavior, release metadata, desktop packaging config, or v0.6/v0.7/v0.8/v0.9 docs unless Codex/Claude assigns a concrete regression fix or docs-sync patch. v0.10 multilingual UI work may be drafted only when assigned with exact scope from `V0_10_I18N_SPEC.md`; good Hermes tasks are raw-Chinese scans or wording-table drafts, not owning the i18n store/dictionary integration or release.
- Architecture split subtasks only when assigned by exact file. Hermes must not perform broad refactors, move folders, or collapse `src/ui/light-panel/*`, `src/ui/object-list/*`, or `src/app/compare/*` back into the old shell files.

## 7.4 ✅ DONE + USER ACCEPTED — v0.6e closeout (handoff 2026-06-21)

v0.6e passed user visual acceptance on 2026-06-21. The accepted scope is: A/B diff has a separate `gear` / 「控光器材」 category, save/load/duplicate/A-B/export regressions are accepted, README has the open-source-limit note, and TopBar was then `v0.6e`. Hermes did not own this feature and must not rework it. The later v0.7/v0.7.1 open-source and desktop-packaging work is also complete; Hermes only handles exact small subtasks if assigned.

## 7.3 ✅ DONE + USER ACCEPTED — v0.6d `controlGearOptics` (handoff 2026-06-21)

Hermes drafted `src/domain/controlGearOptics.ts` verbatim from `HERMES_HANDOFF_V0_6D.md`; Claude reviewed it line-by-line (no bugs) and integrated it into `LightRig.tsx` / `lighting.ts` / `StudioScene.tsx`. `tsc·lint·build` green; Claude deterministic self-test (esbuild-bundled the pure module) passed; browser smoke (add 3 gear) had zero console errors. User visual acceptance of the actual on-screen darkening/fill/softening per `V0_6D_OPTICS_SPEC.md §11` passed on 2026-06-21. Acceptance fix: `ObjectPanel` now hides the material selector for control gear via `isControlGearKind`, so Hermes must not reintroduce a gear material dropdown unless Codex explicitly assigns that product change. Codex bumped TopBar to `v0.6d` during doc closeout. No further Hermes action unless the user reports a concrete acceptance bug with exact write scope. Hermes must NOT re-draft `controlGearOptics.ts`, enable gear `castShadow`, or start v0.7 without an exact handoff.

Original handoff spec (for the record): `HERMES_HANDOFF_V0_6D.md` — draft ONLY the pure module, no scene integration.

- Scope: create ONE new file `src/domain/controlGearOptics.ts` — the v0.6d pure optics helpers (`getGearLightOptics`, `applyGearOpticsToLightParams`, `getNegativeFillFactor`, `getReflectorFillLights`) + the `GearLightOptics` / `ReflectorFillLight` types. Numbers/formulas are verbatim from `V0_6D_OPTICS_SPEC.md`, transcribed into the handoff doc.
- Hard boundary: draft the pure module ONLY. Do NOT wire it into `LightRig.tsx` / `lighting.ts` / `StudioScene.tsx`, do NOT enable gear `castShadow`, do NOT touch `types.ts` / `sceneObjects.ts` / v0.6a numbers / `MAX_LIGHTS`, do NOT mark v0.6d done. Claude does all scene integration and acceptance.
- Validation: `npm run lint` + `npm run build` (the file is not imported yet; tsc still type-checks it standalone).

## 7.2 ✅ DONE — v0.5.1 visible light body handoff (2026-06-20)

The old Hermes handoff for `src/scene/LightVisual.tsx` is closed. Claude integrated v0.5.1 render credibility, Codex review added click/drag handlers so the visible softbox/panel/tube body behaves like the existing light gizmo, and user visual acceptance passed on 2026-06-20.

No current Hermes task is active for v0.5.1. Hermes must not redo `LightVisual.tsx`, `LightRig.tsx`, `Studio.tsx`, `lighting.ts`, `rendering.ts`, or `studioGeometry.ts` unless the user/Codex/Claude assigns a concrete acceptance bug with an exact write scope.

## 7.1 ✅ DONE — `src/data/fixturePresets.ts` (handoff 2026-06-20)

Hermes drafted `src/data/fixturePresets.ts` verbatim from the (Codex-updated) `V0_5_FIXTURE_SPEC.md §4/§5` and correctly STOPPED at the `'tungsten'` type error instead of guessing — exactly the right boundary behavior. Root cause was NOT a spec contradiction: Codex had updated spec §4 to include `'tungsten'`, but Claude's `src/types.ts` was written from the pre-update spec, so it lagged by one value. Claude fixed `types.ts` (added `'tungsten'`, aligned the enum to spec §4) and accepted Hermes's file as-is. Claude then wired `applyFixturePreset` (`lightActions.ts`) + the `LightPanel` 器械 dropdown + subtitle; Codex复核补齐 capability label. No further Hermes action on v0.5. (`'rgbacl'` is a valid-but-unused reserved enum value, harmless — left as-is.)

Original handoff (for the record only; not current write scope): draft only `src/data/fixturePresets.ts`, do not touch types/panel/store. Since the 2026-06-20 structure split, current LightPanel work belongs under `src/ui/light-panel/*`, not the `src/ui/LightPanel.tsx` re-export shell.

Task:
- Create the single new file `src/data/fixturePresets.ts` by transcribing, VERBATIM, the `FixturePreset` type from `V0_5_FIXTURE_SPEC.md §4` and all 8 presets from `§5.1`–`§5.8`.

Write scope (only this file):
- `src/data/fixturePresets.ts` — new. Do not edit any other file.

Exact requirements:
- First line imports the already-existing types:
  `import type { FixtureCategory, FixtureColorEngine, FixturePowerClass, FixtureUse, LightType } from '../types'`
- Define and export the `FixturePreset` type exactly as written in spec §4.
- Export the array under this exact name: `export const FIXTURE_PRESETS: FixturePreset[] = [ ... ]` containing all 8 presets in order §5.1→§5.8.
- Copy every field value VERBATIM from the spec — ids, labels, brand/model, numbers, colors, `notes` text, `colorTemperature: undefined` where the spec has it. Do NOT add, remove, reorder, round, or "improve" any preset or value. Do NOT add presets beyond the 8.
- Match existing data-file style: 2-space indent, no semicolons, single quotes (see `src/data/cameraPresets.ts` for the house style).

Do NOT:
- Add `applyFixturePreset`, touch `types.ts`, `LightPanel.tsx`, `store.ts`, or any action file.
- Change any spec value or copy. Add a dependency.

Validate:
- `npm run lint` and `npm run build` (the file should compile against the new `../types` fixture types).

Report back (use the §5 handoff format): changed files, validation results, and any place the spec was ambiguous (do not guess values — flag instead). Needs review from: Claude (integration / type safety) — Claude will wire `applyFixturePreset` + the panel and verify A/B + save/load.

## 8. Current Validation Expectations

For code tasks:

- `npm run lint`
- `npm run build`

For visual/person-pose tasks:

- Build checks are required.
- Human visual verification is the final authority.

For docs-only tasks:

- No build required unless docs include code snippets that were changed from source.
