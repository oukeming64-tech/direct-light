// Bottom preset bar: save input, save button, empty hint, and per-preset chrome.
// Saved-preset NAMES are user-authored data and stay as entered.

import type { AppLanguage } from '../languages'

const zh = {
  'presetBar.namePlaceholder': '方案名称…',
  'presetBar.save': '保存方案',
  'presetBar.empty': '还没有保存的方案。调好灯后点「保存方案」。',
  'presetBar.noPreview': '无预览',
  'presetBar.load': '点击载入方案',
  'presetBar.duplicate': '复制方案',
  'presetBar.delete': '删除方案',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'presetBar.namePlaceholder': 'Preset name…',
  'presetBar.save': 'Save preset',
  'presetBar.empty': 'No saved presets yet. Set up your lighting, then click “Save preset”.',
  'presetBar.noPreview': 'No preview',
  'presetBar.load': 'Click to load preset',
  'presetBar.duplicate': 'Duplicate preset',
  'presetBar.delete': 'Delete preset',
}

const ja: Record<Key, string> = {
  'presetBar.namePlaceholder': 'プリセット名…',
  'presetBar.save': 'プリセット保存',
  'presetBar.empty': '保存済みプリセットはありません。ライティングを決めて「プリセット保存」を押してください。',
  'presetBar.noPreview': 'プレビューなし',
  'presetBar.load': 'クリックで読み込み',
  'presetBar.duplicate': 'プリセットを複製',
  'presetBar.delete': 'プリセットを削除',
}

export const presetBar: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
