# Claude Code Brief: Direct Light

This project is a prototype for a white studio lighting simulation app.

Read these documents first:

1. `README.md`: full product requirements in Chinese.
2. `ARCHITECTURE.md`: code structure, module boundaries, and where new files should live.
3. `RENDERING_SPEC.md`: rendering numbers, default lights, shadow behavior, and Three.js guidance.
4. `ROADMAP.md`: post-v0.1 roadmap for multiple actors, studio structures/props/mannequins, poses, fixture presets, and modifiers.
5. `COLLABORATION.md`: team split, version log, completed work, and current todo list.
6. `HERMES.md`: rules for using Hermes as a bounded code-drafting agent, plus the latest Hermes handoff notes.
7. `HERMES_LESSONS.md`: concrete misses from previous Hermes handoffs and review fixes Hermes must learn from.
8. `V0_4C_CAMERA_SPEC.md`: exact product spec, UI copy, write scope, and acceptance criteria for camera controls.
9. `STORE_ACTION_SPLIT_SPEC.md`: completed v0.4.8 no-behavior-change store split reference.
10. `V0_5_FIXTURE_SPEC.md`: Codex-finalized product/data/UI scope for the fixture preset library.
11. `V0_5_1_RENDERING_CREDIBILITY_SPEC.md`: completed v0.5.1 render credibility scope, user visual acceptance passed on 2026-06-20.
12. `V0_6_MODIFIER_SPEC.md`: completed v0.6a control-modifier product/data/UI/write scope and remaining v0.6 split.
13. `V0_6B_VISUAL_BRIEF_SPEC.md`: completed v0.6b accessory-visual and director-view brief scope. Read before touching modifier visuals or camera-view light summaries.
14. `V0_6C_GEAR_SPEC.md`: completed v0.6c scope for in-studio standalone control gear — black flag / reflector board / diffusion frame as scene-object kinds. User visual acceptance passed on 2026-06-21.
15. `V0_6D_OPTICS_SPEC.md`: completed v0.6d optical-approximation scope. User visual acceptance passed on 2026-06-21.
16. `V0_6E_CLOSEOUT_SPEC.md`: completed v0.6e closeout scope. User visual acceptance passed on 2026-06-21; v0.6 control line is complete.
17. `src/data/sceneObjects.ts`: current object / structure / support-surface presets, dimensions, materials, and communication-scene defaults.

Current v0.5.1 note: v0.5.1 = render credibility, implemented by Claude, reviewed by Codex, and user visual acceptance passed on 2026-06-20. It adds a one-piece cyclorama helper (`src/scene/studioGeometry.ts`), visible softbox/panel/tube bodies (`src/scene/LightVisual.tsx` wired through `LightRig.tsx`), and floor-reflectance weighting in `src/data/rendering.ts` + `src/scene/lighting.ts`. Codex review added click/drag handlers to the visible light body and bumped the top bar to v0.5.1. Do not reimplement this scope; only fix concrete acceptance bugs.

Current v0.6 note: v0.6a modifier main integration has landed and passed user visual acceptance on 2026-06-20. Claude wired `applyLightModifier`, `LightModifierSection`, LightRig effective params, colored-bounce spill multiplier, and A/B light diff. Codex tuned `softbox-medium` vs `diffusion-cloth` because the first values looked too similar on soft lights; the accepted values are the source of truth. **v0.6b also landed and passed user visual acceptance on 2026-06-20** (per `V0_6B_VISUAL_BRIEF_SPEC.md`; user authorized Claude to do the acceptance in Codex's place since Codex was out of quota this round). v0.6b adds visible 3D modifier bodies, a pure director brief, and the camera-view brief overlay. **v0.6c has landed and passed user visual acceptance on 2026-06-21.** Scope finalized by user: drop the separate "旗板" (flag == black flag; white flag board == reflector board) → only 3 gear: 黑旗 (`blackFlag`) / 反光板 (`reflectorBoard`) / 柔光布框 (`diffusionFrame`), plus `scrimWhite`. Gear are scene objects using `geometry:'gearPanel'`; the add-object dropdown is split into 道具/结构 + 控光器材 optgroups. v0.6c is zero-optics on purpose (`castShadow:false`/`receiveShadow:false`) and gear is intentionally NOT a support surface. **v0.6d has landed and passed user real-machine visual acceptance on 2026-06-21**: black flag cut/negative fill, reflector virtual fill, and diffusion-frame softening are derived from scene objects through pure helpers, not physical shadows or a second gear store. Acceptance fix: `ObjectPanel` hides the material selector for gear via `isControlGearKind`, while color/size/shadow controls remain available. **v0.6e has landed and passed user visual acceptance on 2026-06-21**: A/B now splits control gear from props, save/load/duplicate/A-B/export closeout is accepted, README has the open-source-limit note, and TopBar is `v0.6e`. v0.6 is complete. **v0.7 open-source-ready first release has landed (Claude Code-led, 2026-06-21).** This is an engineering/docs closeout, not a visual feature: added MIT `LICENSE` (© 2026 Keming Ou), `CONTRIBUTING.md`, `CHANGELOG.md`, English `README.en.md`; reworked `README.md` with an open-source front door above the existing PRD; filled out `package.json` metadata (description/license/author/repository/keywords/engines, version `0.7.0`); cleaned repo junk and tightened `.gitignore`; bumped the TopBar badge `v0.6e → v0.7.0`. `tsc·lint·build` green. Decisions made with the user this session: license **MIT**, copyright **Keming Ou**, **desktop packaging deferred** (Electron/Tauri is a later optional pass — the first OSS release does not need it), **add English README**. The repo was `git init`'d and **open-sourced to https://github.com/oukeming64-tech/direct-light** (public) as the v0.7.0 first release — the user confirmed the GitHub account `oukeming64-tech` and asked to publish; `package.json` `repository`/`homepage`/`bugs` point at that repo. The personal retrospective `个人重构/` is kept **private and out of the repo** (gitignored + untracked) per the user's explicit choice ("复盘自己保留"). A **live demo auto-deploys to GitHub Pages** via `.github/workflows/deploy.yml` on every push to `main` — https://oukeming64-tech.github.io/direct-light/ ; `vite.config.ts` applies `base: '/direct-light/'` only for production builds (dev/preview stay at root `/`). Next topic per the user: **desktop packaging** (Electron/Tauri) — still optional, deferred from this release, to be discussed next. Post-open-source work stays as planned: v0.8 multilingual UI, v0.9 more lights / multi-light management.

Current architecture note: Codex completed an open-source-readiness split on 2026-06-20 with no intended behavior change. `AppShell` is now a layout shell; stage/view-badge/A/B compare live in `src/app/Stage.tsx`, `src/app/ViewBadge.tsx`, `src/app/canvasLayout.ts`, and `src/app/compare/*`. `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are compatibility re-export shells; real code lives in `src/ui/light-panel/*` and `src/ui/object-list/*`. v0.6b/c/d/e are already in their own modules (`LightModifierVisual`, `DirectorLightBrief`, `lightBrief`, `sceneObjects` gear presets, `SceneObjects` gearPanel, `controlGearOptics`, `sceneDiff` gear split). For v0.7, keep implementation in focused domain/app/helpers and docs/package files; do not put new implementation back into shell files or invent stored gear-optics state.

Current roadmap note: v0.6 is complete. v0.7 is the open-source-ready first release / optional desktop packaging pass, and the user wants Claude Code to lead it. v0.7 completion is enough to open source the project. Do not block the first open-source release on multilingual UI or more light sources; those are post-open-source work (v0.8 multilingual, v0.9 more lights / multi-light management).

Current v0.5.0 note: v0.5.0 = fixture preset library, user real-machine accepted on 2026-06-20. `types.ts` gained fixture enums (`FixtureCategory`/`FixtureColorEngine` incl. `tungsten`/`FixturePowerClass`/`FixtureUse`) + `LightConfig.fixturePresetId?`; `src/data/fixturePresets.ts` has 8 presets (Hermes verbatim draft of the Codex spec); `applyFixturePreset` in `actions/lightActions.ts` seeds the light-quality params and keeps position/target/enabled (`undefined`→clear marker only); `LightPanel` 基础 section has a 器械 dropdown, fixture-name subtitle, and the `全彩/双色温/暖色/白光` capability label. `tsc·lint·build` green, deterministic self-test passed, user visual acceptance passed. — v0.4.8 split `src/state/store.ts` (685→38 lines) per `STORE_ACTION_SPLIT_SPEC.md` — new `storeTypes.ts`/`storeHelpers.ts` and 8 `createXActions` factories in `src/state/actions/*`; the 8 factory files were drafted verbatim by OpenRouter glm-5.2 and audited group-by-group by Claude; no behavior change, `tsc·lint·build` green, app renders identically. Callers still import `useStore` from `../state/store`. — v0.4.6 A/B compare guidance and v0.4.7 = v0.4c camera control are user-accepted (done). v0.4.7 was built to `V0_4C_CAMERA_SPEC.md`: `CameraConfig` gained `targetMode?`/`targetPersonId?` (`CameraTargetMode = manual|person|peopleCenter`), migrated to `manual` + first person; CameraPanel has 镜头/机位(方位角·距离·高度·看向高度)/目标(手动·锁定人物·多人中心 + 对准一次)/机位预设(5)/从自由视角取景 sections. New pure modules `src/domain/cameraMath.ts` and `src/data/cameraPresets.ts` were drafted by OpenRouter glm-5.2 and audited by Claude; store actions (`setCameraTargetMode`/`aimCameraAtPerson`/`applyCameraPreset`/`requestFreeCameraCapture`/`setCameraFromFree`/`setCameraPositionXZ`) + the `FreeCameraCaptureBridge`, `FreeCameraClamp`, migration/diff were written by Claude. User-added follow-ups are also accepted: camera stays clamped inside the readable studio volume, free/top view can drag the camera gizmo, and the free-view 看向高度 slider no longer moves the whole scene. `src/domain/sceneMigration.ts` still normalizes older saved presets/snapshots; binding (`supportObjectId`) and camera target fields are preserved.

Important user vocabulary: when the user says “人台”, they may mean either a clothing mannequin or a load-bearing live-stream round mini stage. Clothing mannequins remain `mannequin`; the round mini stage is `stage-round-live` under `platform`.

Next development sequence:

1. ~~Light architecture split (ParamPanel + StudioScene).~~ ✅ Done in v0.4.3.
2. ~~Build v0.4b: seated pose + support-surface linkage + forearm yaw.~~ ✅ Done in v0.4.4 (user-verified).
3. ~~attach-to-support live binding.~~ ✅ Done in v0.4.5 (user-verified, Hermes + Codex review).
4. ~~A/B compare product guidance.~~ ✅ Done in v0.4.6 (Hermes draft, Codex review/fix, user-accepted).
5. ~~v0.4c camera control (per `V0_4C_CAMERA_SPEC.md`).~~ ✅ Done in v0.4.7 (glm-5.2 draft of pure modules + Claude integration, user-accepted).
6. ~~Implement `STORE_ACTION_SPLIT_SPEC.md`, no behavior changes.~~ ✅ Done in v0.4.8 (glm-5.2 verbatim draft of 8 action factories + Claude audit/integration).
7. ~~v0.5 fixture preset library (per `V0_5_FIXTURE_SPEC.md`).~~ ✅ Done in v0.5.0 and user-accepted (`fixturePresets.ts`, fixture types, `applyFixturePreset`, `LightPanel` 器械 dropdown + capability label).
8. ~~v0.5.1 render credibility.~~ ✅ Done and user-accepted on 2026-06-20.
9. ~~Open-source-readiness UI/app split.~~ ✅ Done by Codex on 2026-06-20; no intended behavior change, `lint`/`build` green.
10. ~~v0.6b accessory visuals + camera-view director brief per `V0_6B_VISUAL_BRIEF_SPEC.md`.~~ ✅ Done and user-accepted on 2026-06-20 (modifier bodies made solid 3D forms at user request; acceptance done by Claude in Codex's place per user authorization).
11. ~~v0.6c in-studio standalone control gear per `V0_6C_GEAR_SPEC.md`.~~ ✅ Done and user-accepted on 2026-06-21 (3 gear: black flag / reflector board / diffusion frame as scene-object kinds, placement/visual only, zero optics).
12. ~~v0.6d optical approximation on the v0.6c gear per `V0_6D_OPTICS_SPEC.md`.~~ ✅ Done and user real-machine accepted on 2026-06-21; acceptance fix also hides the gear material selector in `ObjectPanel`.
13. ~~v0.6e closeout per `V0_6E_CLOSEOUT_SPEC.md`.~~ ✅ Done and user-accepted on 2026-06-21; TopBar is `v0.6e` and v0.6 is complete.
14. Next: v0.7 open-source-ready first release / optional desktop packaging. Claude Code leads; Codex reviews product/spec/docs; Hermes only drafts explicitly assigned small patches.

## Working agreements (重要约定)

These are standing rules for how Claude Code should work on this project. Follow them by default.

1. **Delegate code-writing via OpenRouter; Claude reviews.** The user has an OpenRouter key wired through the `openrouter` MCP. For non-trivial code drafting, hand the writing to `z-ai/glm-5.2` or `qwen3.7-max` / `qwen3-coder` against a precise spec, then Claude Code audits line-by-line (types, edges, style), integrates, and verifies. This keeps Claude in the reviewer/integrator seat and saves the user's budget. (qwen3.7 may be blocked by an account privacy setting; fall back to glm-5.2.) See the version log in `COLLABORATION.md` for precedents.

2. **Human verifies human-pose tweaks — not Claude.** When a change is a small adjustment to the person/pose rig (joint angles, seated fold, arm/forearm DOFs, pose presets), do NOT burn tokens driving the browser preview to "see" it. R3F / the preview canvas throws spurious black-canvas / resize glitches that make visual self-verification unreliable, but the human eye does not. So: make the code change, confirm `tsc`/`lint`/`build` are green, then hand it to the user to eyeball. When the user says “通过 / passed”, it's passed — done. (Still verify non-pose, deterministic changes normally where it's cheap and reliable.)

3. **Hermes drafts, Claude/Codex review.** Hermes is an auxiliary code agent for bounded drafts when Claude quota is tight; product decisions stay with user + Codex, final engineering judgment with Claude/Codex. Hermes follows `HERMES.md` and hands back changed files, validation, known limits.
   - **How to dispatch Hermes (Claude has no Hermes tool):** Claude cannot call Hermes directly. To use Hermes, write a precise handoff doc — name the exact subtask, write scope (which files), the verbatim spec/values, and the report format — then tell the user; the user relays it to Hermes. (See `HERMES.md §5` handoff format.)
   - **When to use Hermes vs OpenRouter:** Both offload mechanical drafting. OpenRouter (`openrouter` MCP, glm-5.2) Claude can call *directly* in-line (no relay) but it spends Claude's turn/budget — use it when Claude has budget and wants speed/integration in one flow. Hermes runs *outside* Claude's quota (user relays) — use it specifically when Claude is near its limit and the goal is to save Claude budget. For saving Claude quota there is no more convenient path than the handoff-doc + user-relay; OpenRouter does not save Claude budget.
4. **Do not blur ownership.** If a task is marked Claude-owned, Hermes may only draft the exact subtask named in a handoff. Claude/Codex must do final integration, validation, and status updates.

## Goal

Build a usable web prototype that helps directors preview how people, light position, light distance, fixture type, light color, and light height affect illumination and shadows inside a white studio.

## Priorities

1. Make light changes visibly affect the person and shadows in real time.
2. Keep the interface simple: scene view, object list, parameter panel, preset bar.
3. Favor an interactive prototype over physically perfect rendering.
4. Use clear data structures for studio, people, lights, camera, and saved presets.
5. Update `COLLABORATION.md` whenever a meaningful feature, fix, or decision lands.
6. Keep `src/App.tsx` thin. Put scene, state, panels, data, and pure helpers in their own modules as defined in `ARCHITECTURE.md`.

## Suggested MVP

- One white studio space
- One simplified standing person
- Up to three lights
- Adjustable light position, height, distance, angle, intensity, color, color temperature, and softness
- Hard light, soft light, and panel light modes
- Camera view and top-down view
- Save and restore lighting presets locally
- Export current preview image if practical

## Suggested stack

Use a frontend-only web app unless the user asks otherwise.

Good options:

- React or Next.js
- Three.js or React Three Fiber
- Local state management with Zustand or equivalent
- LocalStorage for saved presets

## Important product behavior

The app should clearly show:

- Lower lights create longer ground shadows.
- Higher lights create shorter ground shadows.
- Hard lights create sharper shadows.
- Soft lights create softer shadows.
- Colored lights tint the person and white studio surfaces.
- White studio reflectance makes shadows lighter and the image flatter.
