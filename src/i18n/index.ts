// v0.10 i18n entry point: the pure `t(language, key, params?)` translator and
// the public type/metadata exports. No React or store coupling lives here so
// the translator can be unit-tested and used outside components.

import { DEFAULT_LANGUAGE, type AppLanguage } from './languages'
import { MESSAGES, type MessageDict, type MessageKey } from './messages'

export type { AppLanguage } from './languages'
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, isAppLanguage } from './languages'
export type { MessageKey } from './messages'

export type TParams = Record<string, string | number>

// Translate a key for a language. Missing keys fall back to the source
// (`zh-CN`) dictionary; a key absent everywhere renders as ⟦key⟧ so it is
// obvious during development.
export function t(language: AppLanguage, key: MessageKey, params?: TParams): string {
  const dict: MessageDict = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  const template = dict[key] ?? MESSAGES[DEFAULT_LANGUAGE][key]
  if (template === undefined) return `⟦${key}⟧`
  return params ? interpolate(template, params) : template
}

// Replace {name} placeholders with params; leave unknown placeholders intact so
// a missing param is visible rather than silently dropped.
function interpolate(template: string, params: TParams): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  )
}
