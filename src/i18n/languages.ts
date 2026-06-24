// v0.10 i18n foundation: the set of UI languages the app can run in.
// Language is an APP PREFERENCE only — it never enters SceneConfig, saved
// presets, custom fixtures, or exported data (see V0_10_I18N_SPEC.md §2).

export type AppLanguage = 'zh-CN' | 'en' | 'ja'

// Simplified Chinese is the source language and the fallback for missing keys.
export const DEFAULT_LANGUAGE: AppLanguage = 'zh-CN'

// Metadata for the language menu. `label` is each language's name in its own
// script (intentionally never translated).
export const SUPPORTED_LANGUAGES: { value: AppLanguage; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'zh-CN' || value === 'en' || value === 'ja'
}
