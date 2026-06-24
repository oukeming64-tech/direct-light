import type { FixtureCategory, LightConfig } from '../types'
import { LIGHT_MODIFIER_PRESETS, type LightModifierPreset } from '../data/lightModifiers'
import { t, type AppLanguage } from '../i18n'

export const EFFECTIVE_LIGHT_LIMITS = {
  intensityMin: 0,
  intensityMax: 3.2,
  beamAngleMin: 10,
  beamAngleMax: 80,
  softnessMin: 0,
  softnessMax: 0.96,
} as const

export type EffectiveLightParams = {
  intensity: number
  beamAngle: number
  softness: number
  distance: number
  spillMultiplier: number
  modifier?: LightModifierPreset
}

export function getLightModifierPreset(modifierId: string | undefined): LightModifierPreset | undefined {
  if (!modifierId) return undefined
  return LIGHT_MODIFIER_PRESETS.find((modifier) => modifier.id === modifierId)
}

export function isLightModifierCompatible(
  modifier: LightModifierPreset,
  fixtureCategory: FixtureCategory | undefined,
): boolean {
  if (!modifier.compatibleFixtureCategories || !fixtureCategory) return true
  return modifier.compatibleFixtureCategories.includes(fixtureCategory)
}

export function getEffectiveLightParams(light: LightConfig): EffectiveLightParams {
  const modifier = getLightModifierPreset(light.modifierId)
  if (!modifier) {
    return {
      intensity: light.intensity,
      beamAngle: light.beamAngle,
      softness: light.softness,
      distance: light.distance,
      spillMultiplier: 1,
    }
  }

  const beamAngle =
    light.beamAngle * (modifier.effect.beamAngleMultiplier ?? 1) + (modifier.effect.beamAngleDelta ?? 0)

  return {
    intensity: clamp(
      light.intensity * modifier.effect.intensityMultiplier,
      EFFECTIVE_LIGHT_LIMITS.intensityMin,
      EFFECTIVE_LIGHT_LIMITS.intensityMax,
    ),
    beamAngle: clamp(
      beamAngle,
      EFFECTIVE_LIGHT_LIMITS.beamAngleMin,
      EFFECTIVE_LIGHT_LIMITS.beamAngleMax,
    ),
    softness: clamp(
      light.softness + modifier.effect.softnessDelta,
      EFFECTIVE_LIGHT_LIMITS.softnessMin,
      EFFECTIVE_LIGHT_LIMITS.softnessMax,
    ),
    distance: light.distance,
    spillMultiplier: modifier.effect.spillMultiplier,
    modifier,
  }
}

export function formatEffectiveLightSummary(params: EffectiveLightParams, language: AppLanguage): string {
  return [
    t(language, 'effective.intensity', { value: params.intensity.toFixed(2) }),
    t(language, 'effective.beam', { value: params.beamAngle.toFixed(0) }),
    t(language, 'effective.softness', { value: params.softness.toFixed(2) }),
  ].join(t(language, 'effective.separator'))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
