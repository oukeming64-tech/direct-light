# Direct Light Roadmap

This file is the short current roadmap. Completed historical planning lives in [`docs/history/snapshots/ROADMAP_FULL_2026-06-29.md`](docs/history/snapshots/ROADMAP_FULL_2026-06-29.md).

## Current Baseline

Released baseline: `v1.0.5`.

Completed and released:

- v1.0.0 multilingual UI.
- v1.0.1 studio-footprint drag bounds.
- v1.0.2 user-customizable `.glb` figure models.
- v1.0.3 shadow light-bleeding fix.
- v1.0.4 onboarding, accessibility, A/B correctness, persistence reliability, custom fixture / GLB compatibility, and production code splitting.
- v1.0.5 Japanese copy humanization with no architecture, schema, or rendering changes.
- GitHub Pages app root and `/showcase/` project page.
- macOS desktop packaging through Tauri CI.

## Current Product Goal

Keep Direct Light useful as a lightweight white-studio lighting previz tool for directors, DPs, and gaffers.

The most important behavior remains:

- Light changes visibly affect people and shadows in real time.
- Lower lights create longer ground shadows; higher lights create shorter shadows.
- Hard, soft, and panel lights read differently.
- Colored lights tint people and white studio surfaces.
- White studio reflectance keeps shadows lighter and flatter than a black-box scene.

## Available on main · web update

2026-09-05: an offline lighting-plan file combines the camera preview, top view, light schedule and editable scene. Import adds a saved preset and its referenced custom fixtures. Further collaboration and cloud sharing remain candidates.

## Next Candidate Work

These are invitation areas for real-use feedback and scoped proposals, not pre-approved features:

- More realistic fixture / photometric data.
- A full mobile/narrow-screen workspace beyond the current under-960px guidance gate.
- Additional sharing workflows beyond the local lighting-plan file.
- Continued rendering polish when it fixes a concrete visual regression.

Use [Discussions](https://github.com/oukeming64-tech/direct-light/discussions) to share workflow context or explore an early idea. Use [Issues](https://github.com/oukeming64-tech/direct-light/issues) for reproducible problems and proposals with a concrete scope. A roadmap candidate becomes implementation work only after that scope is agreed.

## Completed Lines

Do not reopen unless fixing a concrete regression:

- v0.2 multi-person blocking.
- v0.3 props, structures, supports.
- v0.4 pose and camera controls.
- v0.5 fixture presets and rendering credibility.
- v0.6 modifiers and in-studio control gear.
- v0.7 open-source release, GitHub Pages, Tauri packaging.
- v0.8 multi-light management.
- v0.9 custom fixtures.
- v0.10 multilingual UI.

## Documentation Note

Changed in the 2026-06-29 cleanup: this root roadmap was shortened to current state and next candidates.

Changed on 2026-07-10: candidate work now links to public feedback and contribution entry points, while remaining explicitly uncommitted until scoped.

Changed on 2026-07-10: moved the onboarding / accessibility / A-B correctness line into released `v1.0.4`, together with persistence, fixture / GLB, performance, and code-splitting fixes; full mobile layout remains a candidate rather than being implied complete by the narrow-screen notice.

Changed on 2026-07-11: moved the Japanese copy humanization pass into released `v1.0.5`; product priorities and next-candidate scope remain unchanged.

Not changed by the roadmap update: product priorities, release workflow, rendering goals, or public URLs.
