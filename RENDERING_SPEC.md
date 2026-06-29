# Direct Light Rendering Spec

This is the short current rendering spec. The full historical rendering notes are archived at [`docs/history/snapshots/RENDERING_SPEC_FULL_2026-06-29.md`](docs/history/snapshots/RENDERING_SPEC_FULL_2026-06-29.md).

## Rendering Goal

Direct Light is a communication-oriented lighting preview, not a physically accurate renderer.

The image should make these relationships readable:

- light position and shadow direction;
- light height and shadow length;
- hard / soft / panel light differences;
- colored light spill on people and white studio surfaces;
- white studio reflectance making shadows lighter and the image flatter.

## Current Scene Model

- White studio with adjustable dimensions and optional wall/ceiling surfaces.
- Seamless cyclorama-style background geometry.
- People, props, support surfaces, control gear, and camera.
- Up to 6 lights.
- Multiple view modes: camera, free, top, side.

## Lights

Lights expose:

- position, height, distance, angle;
- intensity;
- color and color temperature;
- beam angle;
- softness;
- fixture preset;
- modifier;
- target mode;
- normal bias.

Fixture and modifier semantics are approximate and director-readable.

## Shadows

Current public baseline: `v1.0.3`.

- Default shadow mode is variance-style shadows for smoother half tones.
- Optional soft-shadow / PCF mode is available for difficult light-bleeding cases.
- Per-light normal bias helps reduce light bleeding on curved imported figures.
- Runtime shadow-mode changes require material recompilation; do not re-add direct `gl.shadowMap.type` mutation to `ShadowModeSync`.

## White Studio Approximation

White studio bounce is intentionally simplified:

- shadows should not look like a black-box stage;
- colored lights should visibly tint white surfaces;
- control gear optics are derived approximations, not physically simulated mesh-light interactions.

## Validation

For rendering changes:

- run deterministic checks (`npm run lint`, `npm run build`);
- inspect the relevant view visually;
- rely on user visual acceptance for product feel;
- document what changed and what did not change.

## Documentation Note

Changed in the 2026-06-29 cleanup: this root rendering spec was shortened to current rendering behavior and guardrails.

Not changed: rendering code, default values, scene data, build behavior, or release status.
