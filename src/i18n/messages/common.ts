// Cross-cutting labels reused by more than one component. Keep this small —
// prefer domain-specific keys so each language can phrase naturally; only put a
// string here when it is genuinely identical across unrelated places.

import type { AppLanguage } from '../languages'

const zh = {
  // Capacity badge shown when an add-limit is reached (people / lights / objects).
  'common.full': '满 {max}',
  // Language menu (lives in the top bar but is conceptually app-wide).
  'language.label': '语言',
  // Generic transform-axis labels shared by the person & object position sliders.
  'common.axisX': '左右 X',
  'common.axisYoffGround': '离地 Y',
  'common.axisZ': '前后 Z',
  'common.facing': '朝向',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'common.full': 'Max {max}',
  'language.label': 'Language',
  'common.axisX': 'Left/right X',
  'common.axisYoffGround': 'Off-floor Y',
  'common.axisZ': 'Front/back Z',
  'common.facing': 'Facing',
}

const ja: Record<Key, string> = {
  'common.full': '上限 {max}',
  'language.label': '言語',
  'common.axisX': '左右 X',
  'common.axisYoffGround': '地上高 Y',
  'common.axisZ': '前後 Z',
  'common.facing': '向き',
}

export const common: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
