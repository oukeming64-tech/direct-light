// Composes Codex's spec constants into a runnable default SceneConfig.
// Opening the app loads this scene (README §17 / RENDERING_SPEC §4-8).

import type { LightConfig, PersonConfig, SceneConfig, SceneObjectConfig, StudioConfig } from '../types'
import {
  DEFAULT_CAMERA,
  DEFAULT_COLOR_RIM_LIGHT,
  DEFAULT_FILL_LIGHT,
  DEFAULT_KEY_LIGHT,
  DEFAULT_PERSON,
  DEFAULT_STUDIO,
  PERSON_STAGING_PRESETS,
} from './rendering'
import { DEFAULT_POSE } from './poses'
import { PERSON_MODELS } from './personModels'

export function buildDefaultStudio(): StudioConfig {
  return {
    width: DEFAULT_STUDIO.width,
    depth: DEFAULT_STUDIO.depth,
    height: DEFAULT_STUDIO.height,
    wallReflectance: DEFAULT_STUDIO.wallReflectance,
    floorReflectance: DEFAULT_STUDIO.floorReflectance,
    hasCyclorama: DEFAULT_STUDIO.hasCyclorama,
    ambientLevel: DEFAULT_STUDIO.ambientLevel,
    wallColor: DEFAULT_STUDIO.wallColor,
    floorColor: DEFAULT_STUDIO.floorColor,
    showSideWalls: true,
    showCeiling: false,
  }
}

export function buildPersonFromPreset(index: number, id: string = DEFAULT_PERSON.id): PersonConfig {
  const preset = PERSON_STAGING_PRESETS[index] ?? PERSON_STAGING_PRESETS[PERSON_STAGING_PRESETS.length - 1]
  return {
    id,
    name: preset.name,
    position: { ...preset.position },
    rotationY: preset.rotationY,
    height: DEFAULT_PERSON.height,
    skinTone: preset.skinTone,
    clothingColor: preset.clothingColor,
    showFacePlane: true,
    pose: { ...DEFAULT_POSE },
    modelVariant: PERSON_MODELS[0]?.id ?? 'dummy',
  }
}

export function buildDefaultPerson(): PersonConfig {
  return buildPersonFromPreset(0, DEFAULT_PERSON.id)
}

export function buildDefaultLights(): LightConfig[] {
  // structuredClone keeps nested position/target objects independent.
  return [
    structuredClone(DEFAULT_KEY_LIGHT),
    structuredClone(DEFAULT_FILL_LIGHT),
    structuredClone(DEFAULT_COLOR_RIM_LIGHT),
  ]
}

export function buildDefaultObjects(): SceneObjectConfig[] {
  // v0.3 object presets are opt-in. Keep the opening scene clean for lighting checks.
  return []
}

export function buildDefaultScene(): SceneConfig {
  return {
    studio: buildDefaultStudio(),
    people: [buildDefaultPerson()],
    objects: buildDefaultObjects(),
    lights: buildDefaultLights(),
    camera: {
      position: { ...DEFAULT_CAMERA.position },
      target: { ...DEFAULT_CAMERA.target },
      focalLength: DEFAULT_CAMERA.focalLength,
      aspectRatio: DEFAULT_CAMERA.aspectRatio,
    },
  }
}

export const MAX_LIGHTS = 6
export const MAX_PEOPLE = 5
export const MAX_OBJECTS = 12
