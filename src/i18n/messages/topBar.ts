// Top-bar copy. Each domain file owns its keys: zh-CN is the source of truth
// (`as const` → the key set); en/ja are typed `Record<Key, string>` so the
// compiler forces them to cover exactly the same keys. The aggregator in
// ./index.ts merges every domain into the final MESSAGES table.

import type { AppLanguage } from '../languages'

const zh = {
  'topBar.subtitle': '白棚灯光预演',
  'topBar.exportImage': '导出图片',
  'topBar.reset': '重置',
  'topBar.resetTitle': '重置为默认场景',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'topBar.subtitle': 'White-studio lighting preview',
  'topBar.exportImage': 'Export image',
  'topBar.reset': 'Reset',
  'topBar.resetTitle': 'Reset to the default scene',
}

const ja: Record<Key, string> = {
  'topBar.subtitle': '白ホリ ライティングプレビュー',
  'topBar.exportImage': '画像を書き出し',
  'topBar.reset': 'リセット',
  'topBar.resetTitle': 'デフォルトシーンに戻す',
}

export const topBar: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
