# Direct Light · White-Studio Lighting Previz

> A lightweight lighting-previsualization sandbox for directors, DPs, and gaffers. Inside a standard white studio, preview in real time how actor blocking, light position, fixtures, modifiers, and white/colored light shape your subject and shadows.
>
> 中文文档（主文档）: [`README.md`](README.md)

**🔗 Live demo: https://oukeming64-tech.github.io/direct-light/** — no install, works on mobile too, auto-updated on every push to `main`.

A frontend-only web app, no backend. It optimizes for **communication, real-time feedback, and readability** — not physically accurate rendering.

## Features

- 🎬 **Studio + people** — adjustable white studio (size, wall/ceiling toggles, seamless cyclorama, wall/floor reflectance), a rigged simplified figure, multi-actor blocking (up to 5), pose presets and joint tuning.
- 💡 **Lighting** — up to 3 lights (hard / soft / panel) with position, height, distance, angle, intensity, color, color temperature, beam angle, and softness; drag-to-place; target lock (manual / lock-to-person / center-of-people).
- 🔦 **Fixture library** — 8 semantic fixture presets (COB, Nanlux Evoke 600C, LED panel, RGB tube, Fresnel, etc.); apply default light quality in one click, then fine-tune by hand.
- 🎛️ **Modifiers + standalone control gear** — softbox / grid / reflector / diffusion on the light, plus black flag / reflector board / diffusion frame as in-studio gear, each with a director-readable approximate optic.
- 🏠 **Props & structures** — tables, chairs, plinths, mannequins, a round live-stream stage, backdrops; draggable, rotatable, resizable; people can be placed onto supports and follow them live.
- 🎥 **Views + camera** — camera / free-orbit / top / side views; camera azimuth, distance, height, focal length, aspect ratio, position presets, and "frame from free view".
- 🔀 **A/B compare · save · export** — presets saved to browser localStorage, frozen A/B compare with a difference summary, and preview-image export for sharing with the crew.

## Quick start

Prefer not to run it locally? Just open the [live demo](https://oukeming64-tech.github.io/direct-light/). To develop locally:

Requires **Node.js >= 20.19** (20 / 22 LTS recommended) + npm.

```bash
git clone https://github.com/oukeming64-tech/direct-light.git
cd direct-light
npm install
npm run dev        # http://localhost:5173
```

It opens to a usable default studio (one actor, Key/Fill/Rim lights, a camera). Drag a light, change its height or color, add a prop — the image and shadows update live.

Scripts:

```bash
npm run build      # tsc -b type-check + vite production build to dist/
npm run lint       # eslint
npm run preview    # preview the production build
```

## Tech stack

Vite · React 19 · TypeScript · React Three Fiber + drei (Three.js) · Zustand · Tailwind CSS.

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

## Known limits (first release)

- Up to 3 lights (`MAX_LIGHTS = 3`); more lights / multi-light management is post-release **v0.9**.
- Simplified-Chinese-only UI; English / Japanese localization is post-release **v0.8**.
- Desktop-first; narrow mobile responsive layout is scheduled separately.
- The renderer is a communication-oriented approximation, not a physically accurate simulation. Studio reflectance, soft light, colored spill, and gear optics all favor readable, stable, real-time output.
- Black flag / reflector board / diffusion frame optics are runtime-derived approximations (no real mesh shadow for the flag; the reflector is a virtual weak fill; the diffusion frame modifies effective light quality).

## License

[MIT](LICENSE) © 2026 Keming Ou. Changelog: [`CHANGELOG.md`](CHANGELOG.md). Roadmap: [`ROADMAP.md`](ROADMAP.md) (Chinese).
