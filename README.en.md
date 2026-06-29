# Direct Light · White-Studio Lighting Previz

[![Project page](https://img.shields.io/badge/project%20page-showcase-111111.svg)](https://oukeming64-tech.github.io/direct-light/showcase/)
[![Live demo](https://img.shields.io/badge/live%20demo-online-brightgreen.svg)](https://oukeming64-tech.github.io/direct-light/)
[![Latest release](https://img.shields.io/github/v/release/oukeming64-tech/direct-light)](https://github.com/oukeming64-tech/direct-light/releases)
[![Desktop: Tauri 2](https://img.shields.io/badge/desktop-Tauri%202-24c8db.svg)](https://tauri.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A white-studio lighting previz sandbox for directors, DPs, and gaffers. Inside a standard white studio, preview in real time how actor blocking, light position, fixtures, modifiers, and white/colored light shape your subject and shadows.
>
> 中文文档（主文档）: [`README.md`](README.md)

- 🧭 Project page: <https://oukeming64-tech.github.io/direct-light/showcase/>
- 🌐 Live demo: <https://oukeming64-tech.github.io/direct-light/> — no install, works on mobile too, auto-updated on every push to `main`.
- 🖥️ macOS desktop: the `.dmg` on [Releases](https://github.com/oukeming64-tech/direct-light/releases/latest) (universal Apple Silicon / Intel).

A frontend-only web app, no backend. It optimizes for **communication, real-time feedback, and readability** — not physically accurate rendering. Unlike heavyweight 3D / paid set-lighting software, it's instant, install-free, and built for talking through a lighting setup with your crew during prep.

![Direct Light demo: adjust the camera position, then switch to the through-lens view and watch the framing and lighting update live](docs/media/hero.gif)

> *Adjust the camera position → switch to the "lens" view and the camera's actual frame updates in real time.*

## Status

Current public version: **`v1.0.3`**. The white-studio lighting-previz core is feature-complete, with full runtime localization in 简体中文 / English / 日本語.

- `v1.0.0`: first stable major release; multilingual UI.
- `v1.0.1`: free-drag clamped to the studio footprint.
- `v1.0.2`: user-customizable `.glb` figure models.
- `v1.0.3`: shadow light-bleeding fix (per-light "normal bias" slider + a "soft shadows (PCF)" toggle).

Full per-version history in [`CHANGELOG.md`](CHANGELOG.md).

## Features

- 🎬 **Studio + people** — adjustable white studio (size, wall/ceiling toggles, seamless cyclorama, wall/floor reflectance), a rigged simplified figure, multi-actor blocking (up to 5), pose presets and joint tuning.
- 🧍 **User-customizable figure models** — drop a `.glb` into `src/models/` and it auto-appears in the person panel's "Appearance → User Models" list, auto-scaled and grounded at runtime with no per-model config. The procedural dummy stays the default.
- 💡 **Lighting** — up to 6 lights (hard / soft / panel) with position, height, distance, angle, intensity, color, color temperature, beam angle, and softness; drag-to-place; target lock (manual / lock-to-person / center-of-people).
- 🔦 **Fixture library** — 8 semantic fixture presets (COB, Nanlux Evoke 600C, LED panel, RGB tube, Fresnel, etc.); apply default light quality in one click, then fine-tune by hand.
- 🎛️ **Modifiers + standalone control gear** — softbox / grid / reflector / diffusion on the light, plus black flag / reflector board / diffusion frame as in-studio gear, each with a director-readable approximate optic.
- 🏠 **Props & structures** — tables, chairs, plinths, mannequins, a round live-stream stage, backdrops; draggable, rotatable, resizable; people can be placed onto supports and follow them live.
- 🎥 **Views + camera** — camera / free-orbit / top / side views; camera azimuth, distance, height, focal length, aspect ratio, position presets, and "frame from free view".
- 🔀 **A/B compare · save · export** — presets saved to browser localStorage, frozen A/B compare with a difference summary, and preview-image export for sharing with the crew.
- 🌐 **Multilingual UI** — switch Simplified Chinese / English / Japanese at runtime; language only changes UI display and never enters scenes, presets, A/B snapshots, or custom fixture data.

## Screenshots

| Lower the key → the ground shadow stretches | Colored light tints the whole white studio | Switch to the camera's lens view |
| :---: | :---: | :---: |
| ![Long ground shadow from a low light](docs/media/shot-shadow.png) | ![Green colored light and a softbox tinting the studio](docs/media/shot-color.png) | ![Through-the-lens camera framing of the subject](docs/media/shot-lens.png) |

## Quick start

Prefer not to run it locally? Just open the [live demo](https://oukeming64-tech.github.io/direct-light/). Local dev needs **Node.js >= 20.19**:

```bash
npm install
npm run dev        # http://localhost:5173
```

It opens to a usable default studio (one actor, Key/Fill/Rim lights, a camera). Drag a light, change its height or color, add a prop — the image and shadows update live.

Scripts:

```bash
npm run lint
npm run build        # tsc -b type-check + vite production build to dist/
npm run build:tauri  # package the macOS desktop app
```

The desktop build is unsigned; on first launch open System Settings → Privacy & Security → "Open Anyway".

## Tech stack

Vite · React 19 · TypeScript · React Three Fiber + drei (Three.js) · Zustand · Tailwind CSS · Tauri (desktop packaging).

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/app` | App shell, layout, stage, A/B compare |
| `src/scene` | All Three.js / R3F 3D content (studio, people, light rig, gear, camera rig) |
| `src/state` | Zustand store (thin composition + `actions/*` factories) |
| `src/data` | Pure data & specs (default scene, rendering numbers, fixture/modifier/pose/camera presets) |
| `src/domain` | Pure logic (camera math, gear optics, scene diff/migration, light brief) |
| `src/ui` | Parameter panels, object list, top bar |
| `src/lib` | Utilities (color, geometry, localStorage) |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) (Chinese) for full module boundaries, and [`CONTRIBUTING.md`](CONTRIBUTING.md) to contribute.

## Known limits & design tradeoffs

- Up to 6 lights (`MAX_LIGHTS = 6`); the default scene still ships 3 (Key/Fill/Rim).
- Custom fixtures live in localStorage only — moving them across devices / sharing is via JSON export / import.
- Desktop-first; a narrow-mobile responsive layout is scheduled separately.
- The renderer is a communication-oriented approximation, not a physically accurate simulation: studio reflectance, soft light, colored spill, and gear optics all favor readable, stable, real-time output.

## Documentation map

Current entry points:

- [`COLLABORATION.md`](COLLABORATION.md) — current state, boundaries, doc map (Chinese).
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — current code boundaries (Chinese).
- [`RENDERING_SPEC.md`](RENDERING_SPEC.md) — current rendering rules (Chinese).
- [`ROADMAP.md`](ROADMAP.md) — current roadmap (Chinese).
- [`CHANGELOG.md`](CHANGELOG.md) — user-facing release notes.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution workflow.

History archive (the full old README + the complete PRD, plus old roadmap / architecture / rendering specs):

- Archive overview: [`docs/history/README.md`](docs/history/README.md)
- Full old README + PRD: [`docs/history/snapshots/README_FULL_2026-06-29.md`](docs/history/snapshots/README_FULL_2026-06-29.md)
- Phase specs: [`docs/history/specs/`](docs/history/specs/)

## License · Acknowledgements

- License: [MIT](LICENSE) © 2026 Keming Ou.
- Acknowledgements: special thanks to Dr. Zhang from Stanford ([@zczam](https://github.com/zczam)) for the user-customizable figure models — bringing a little philosophy and dungeon flavor to the otherwise boring white studio.
