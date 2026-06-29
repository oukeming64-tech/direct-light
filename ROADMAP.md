# Direct Light Roadmap

This file is the short current roadmap. Completed historical planning lives in [`docs/history/snapshots/ROADMAP_FULL_2026-06-29.md`](docs/history/snapshots/ROADMAP_FULL_2026-06-29.md).

## Current Baseline

Released baseline: `v1.0.3`.

Completed and released:

- v1.0.0 multilingual UI.
- v1.0.1 studio-footprint drag bounds.
- v1.0.2 user-customizable `.glb` figure models.
- v1.0.3 shadow light-bleeding fix.
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

## Next Candidate Work

Not committed until explicitly picked:

- More realistic fixture / photometric data.
- Mobile/narrow-screen workflow improvements for the app.
- More export/share flows for communicating lighting plans.
- Continued rendering polish when it fixes a concrete visual regression.

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

Not changed: product priorities, released version status, app code, build behavior, and release workflow.
