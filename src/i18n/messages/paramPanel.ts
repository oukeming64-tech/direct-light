// Parameter-panel shell. Only the empty-state copy for now; the individual
// panels (light / person / object / camera / studio) are extracted in later
// v0.10b batches and may get their own message files.

import type { AppLanguage } from '../languages'

const zh = {
  'paramPanel.empty.line1': '在左侧或场景中选择一个对象',
  'paramPanel.empty.line2': '（人物 / 灯光 / 摄影机 / 白棚）',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'paramPanel.empty.line1': 'Select an object from the list or the scene',
  'paramPanel.empty.line2': '(person / light / camera / studio)',
}

const ja: Record<Key, string> = {
  'paramPanel.empty.line1': 'リストまたはシーンからオブジェクトを選択',
  'paramPanel.empty.line2': '（人物 / ライト / カメラ / スタジオ）',
}

export const paramPanel: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
