# Direct Light Architecture

This is the short current architecture map. The full historical architecture notes are archived at [`docs/history/snapshots/ARCHITECTURE_FULL_2026-06-29.md`](docs/history/snapshots/ARCHITECTURE_FULL_2026-06-29.md).

## Entry Points

- `src/main.tsx` mounts React.
- `src/App.tsx` stays thin and renders `DirectLightApp`.
- `src/app/DirectLightApp.tsx` and `src/app/AppShell.tsx` compose the app shell.
- `showcase/` contains the GitHub Pages project page and is separate from the main app source.

## Directory Boundaries

- `src/app` — app shell, stage layout, view badges, A/B compare containers.
- `src/scene` — Three.js / React Three Fiber rendering, camera rigs, drag controllers, 3D objects.
- `src/ui` — panels, object list, top bar, controls, export UI.
- `src/state` — Zustand store, store types, action factories.
- `src/state/actions` — all state mutation logic.
- `src/domain` — product/domain pure logic.
- `src/data` — stable presets, specs, default scene data.
- `src/i18n` — in-repo typed localization layer.
- `src/lib` — generic helpers.
- `showcase` — static GitHub Pages showcase page only.

## Rules

- Keep `src/App.tsx`, `src/main.tsx`, and app shell files thin.
- Do not put action logic back into `src/state/store.ts`.
- Do not put Three.js rendering code into UI panels.
- Do not put UI form logic into scene components.
- Do not add language fields to scene data, saved presets, snapshots, custom fixtures, or fixture packs.
- Do not mutate built-in data tables for display-language changes; use display helpers keyed by id.
- Do not modify main app code under `src/` for showcase-only work.

## Current Stable Modules

- User-customizable figure models: `src/data/personModels.ts`, `src/scene/PersonGLB.tsx`.
- Studio drag bounds: `src/domain/studioBounds.ts`, used by `GroundDragController`.
- Shadow mode / normal bias: `src/scene/StudioScene.tsx`, `src/scene/LightRig.tsx`, `src/ui/StudioPanel.tsx`.
- Custom fixtures: `src/domain/customFixtures.ts`, `src/domain/customFixturePack.ts`, `src/state/actions/fixtureActions.ts`.
- Localization: `src/i18n/*`, `src/i18n/display.ts`, message dictionaries under `src/i18n/messages`.

## Documentation Note

Changed in the 2026-06-29 cleanup: this root architecture doc was shortened to current boundaries and rules.

Not changed: code structure, module responsibilities, runtime behavior, build behavior, or release status.
