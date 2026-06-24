import type { CustomFixturePreset, LightConfig } from '../types'
import { findFixtureById } from './customFixtures'
import { getLightModifierPreset } from './lightModifiers'
import { t, type AppLanguage } from '../i18n'
import { getFixtureDisplayLabel, getModifierEffectPhrase, getModifierLabel } from '../i18n/display'

// v0.6b director-facing brief. Generates a one-line summary for the selected
// light in camera view. v0.10.1: localized via display helpers. Examples:
// - built-in + modifier: `Key Light · Nanlux Evoke 600C · medium softbox · soft key`
// - built-in + none:     `Key Light · Nanlux Evoke 600C · no modifier`
// - custom + none:       `Key Light · <authored label> · no modifier`
// `light.name` and custom fixture labels stay user-authored.
export function getLightBrief(
  light: LightConfig,
  language: AppLanguage,
  customFixtures: CustomFixturePreset[] = [],
): string {
  const fixture = findFixtureById(light.fixturePresetId, customFixtures)
  const modifier = getLightModifierPreset(light.modifierId)

  const namePart = light.name || t(language, 'lightBrief.unnamed')
  const fixturePart = fixture ? getFixtureDisplayLabel(language, fixture) : t(language, 'lightBrief.customFixture')

  if (modifier) {
    const modifierPart = getModifierLabel(language, modifier.id)
    const effectPart = getModifierEffectPhrase(language, modifier.id)
    return `${namePart} · ${fixturePart} · ${modifierPart} · ${effectPart}`
  }

  return `${namePart} · ${fixturePart} · ${t(language, 'lightBrief.noModifier')}`
}
