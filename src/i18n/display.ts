// v0.10.1 pure display-label helpers. Each takes `language` (never reads the
// store) and maps a built-in id/enum to its localized label from the `display`
// message domain. Source data tables in src/data/* are untouched; custom
// fixtures and user-authored names always pass through unchanged.

import { t, type TParams } from './index'
import { DEFAULT_LANGUAGE, type AppLanguage } from './languages'
import { MESSAGES, type MessageKey } from './messages'
import type {
  FixturePreset,
  LightTargetMode,
  LightType,
  SceneObjectConfig,
  SceneObjectKind,
  SceneObjectMaterial,
} from '../types'

// zh-CN is the source-of-truth key set; a missing key falls back to source text.
function has(key: string): boolean {
  return key in MESSAGES[DEFAULT_LANGUAGE]
}
function tr(language: AppLanguage, key: string, fallback: string, params?: TParams): string {
  return has(key) ? t(language, key as MessageKey, params) : fallback
}

export function getLightTypeLabel(language: AppLanguage, type: LightType): string {
  return tr(language, `lightType.${type}`, type)
}

// Built-in fixtures localize by id; custom fixtures keep their authored label.
export function getFixtureDisplayLabel(language: AppLanguage, fixture: FixturePreset): string {
  if (fixture.source === 'custom') return fixture.label
  return tr(language, `fixture.${fixture.id}`, fixture.label)
}

export function getFixtureCapabilityLabel(language: AppLanguage, fixture: FixturePreset): string {
  if (fixture.supportsColor) return tr(language, 'fixtureCapability.fullColor', '全彩')
  if (fixture.colorEngine === 'bi-color') return tr(language, 'fixtureCapability.biColor', '双色温')
  if (fixture.colorEngine === 'tungsten') return tr(language, 'fixtureCapability.tungsten', '暖色')
  return tr(language, 'fixtureCapability.white', '白光')
}

export function getModifierLabel(language: AppLanguage, modifierId: string | undefined): string {
  if (!modifierId) return ''
  return tr(language, `modifierLabel.${modifierId}`, modifierId)
}

export function getModifierShortLabel(language: AppLanguage, modifierId: string | undefined): string {
  if (!modifierId) return ''
  return tr(language, `modifierShort.${modifierId}`, '')
}

export function getModifierEffectPhrase(language: AppLanguage, modifierId: string | undefined): string {
  const key = modifierId && has(`modifierEffect.${modifierId}`) ? `modifierEffect.${modifierId}` : 'modifierEffect.none'
  return tr(language, key, '')
}

export function getLightTargetModeLabel(language: AppLanguage, mode: LightTargetMode): string {
  return tr(language, `lightTargetMode.${mode}`, mode)
}

export function getColorPresetLabel(language: AppLanguage, name: string): string {
  return tr(language, `colorPreset.${name}`, name)
}

export function getCameraPresetLabel(language: AppLanguage, presetId: string): string {
  return tr(language, `cameraPreset.${presetId}`, presetId)
}

// Legacy pose ids that may still live in old saved snapshots → current ids.
const POSE_ALIASES: Record<string, string> = {
  neutral: 'natural',
  'side-standing': 'side',
  'raise-hand': 'raise-arm',
  'rim-stand': 'rim-test',
}

export function getPosePresetLabel(language: AppLanguage, presetId: string | undefined): string {
  if (!presetId) return tr(language, 'posePreset.standingFallback', 'standing')
  const id = POSE_ALIASES[presetId] ?? presetId
  return tr(language, `posePreset.${id}`, presetId)
}

export function getSceneObjectPresetLabel(language: AppLanguage, presetId: string): string {
  return tr(language, `sceneObjectPreset.${presetId}`, presetId)
}

export function getSceneObjectMaterialLabel(language: AppLanguage, material: SceneObjectMaterial): string {
  return tr(language, `sceneObjectMaterial.${material}`, material)
}

export function getSceneObjectKindLabel(language: AppLanguage, kind: SceneObjectKind): string {
  return tr(language, `sceneObjectKind.${kind}`, kind)
}

export function getDebugPresetTitle(language: AppLanguage, presetId: string): string {
  return tr(language, `debugPreset.${presetId}`, presetId)
}

// Which `surface.*` word a kind maps to (mirrors getObjectSupportLabel).
const SURFACE_KEY_BY_KIND: Partial<Record<SceneObjectKind, string>> = {
  chair: 'chair',
  sofa: 'sofa',
  platform: 'platform',
  table: 'table',
  stool: 'stool',
  plinth: 'plinth',
  cylinderPlinth: 'plinth',
  box: 'box',
}

// Full support-surface option: `{name} · {surface} {height}m（{role}）`. The
// object name stays user-authored; only the surface word, role, and format
// punctuation localize.
export function getSupportSurfaceLabel(
  language: AppLanguage,
  object: SceneObjectConfig,
  y: number,
  role: 'seat' | 'stand',
): string {
  const surface = tr(language, `surface.${SURFACE_KEY_BY_KIND[object.kind] ?? 'default'}`, '承载面')
  const roleWord = tr(language, `supportRole.${role}`, role)
  return tr(language, 'surface.format', `${object.name} · ${surface} ${y.toFixed(2)}m`, {
    name: object.name,
    surface,
    height: y.toFixed(2),
    role: roleWord,
  })
}
