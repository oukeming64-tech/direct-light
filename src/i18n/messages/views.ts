// View switcher labels + the floating view-badge hints (one per ViewMode).

import type { AppLanguage } from '../languages'

const zh = {
  'view.camera': '镜头',
  'view.free': '自由',
  'view.top': '俯视',
  'view.side': '侧视',
  'view.compare': '对比',

  'view.hint.camera': '镜头预览 · 导演构图（机位锁定）',
  'view.hint.free': '自由视角 · 拖拽旋转 / 滚轮缩放 / 拖灯改灯位',
  'view.hint.top': '俯视灯位图 · 人物·灯·摄影机关系',
  'view.hint.side': '侧视 · 高度与俯仰关系',
  'view.hint.compare': 'A/B 对比 · 左 A 当前编辑 / 右 B 冻结参考',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'view.camera': 'Camera',
  'view.free': 'Free',
  'view.top': 'Top',
  'view.side': 'Side',
  'view.compare': 'Compare',

  'view.hint.camera': 'Camera preview · director framing (camera locked)',
  'view.hint.free': 'Free view · drag to orbit / scroll to zoom / drag a light to move it',
  'view.hint.top': 'Top-down light map · people · lights · camera layout',
  'view.hint.side': 'Side view · height and pitch relationships',
  'view.hint.compare': 'A/B compare · left A live edit / right B frozen reference',
}

const ja: Record<Key, string> = {
  'view.camera': 'カメラ',
  'view.free': 'フリー',
  'view.top': 'トップ',
  'view.side': 'サイド',
  'view.compare': '比較',

  'view.hint.camera': 'カメラプレビュー · 構図確認（カメラ固定）',
  'view.hint.free': 'フリービュー · ドラッグで回転 / ホイールでズーム / ライトをドラッグで移動',
  'view.hint.top': 'トップビュー配置図 · 人物・ライト・カメラの関係',
  'view.hint.side': 'サイドビュー · 高さとあおりの関係',
  'view.hint.compare': 'A/B比較 · 左A 編集中 / 右B 固定参照',
}

export const views: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
