import type { SceneConfig } from '../types'
import { t, type AppLanguage } from '../i18n'
import { getLightTypeLabel } from '../i18n/display'

export function summarizeLighting(scene: SceneConfig, language: AppLanguage): string {
  const on = scene.lights.filter((l) => l.enabled === true)
  if (on.length === 0) return t(language, 'lightingSummary.none')

  const key = on.reduce((a, b) => (b.intensity > a.intensity ? b : a))
  const colorDesc =
    key.colorTemperature != null ? `${Math.round(key.colorTemperature)}K` : key.color.toUpperCase()

  return t(language, 'lightingSummary.line', {
    count: on.length,
    type: getLightTypeLabel(language, key.type),
    intensity: key.intensity.toFixed(1),
    softPct: Math.round(key.softness * 100),
    color: colorDesc,
  })
}
