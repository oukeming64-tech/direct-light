// A/B compare view: top controls, the diff strip, the empty-B state, and the
// relative-time formatter. The per-category diff `d.label` / `d.hint` come from
// domain/sceneDiff (tier C) and stay raw until v0.10.1.

import type { AppLanguage } from '../languages'

const zh = {
  'compare.title': 'A/B 对比',
  'compare.subtitle': '左 A=当前编辑（右侧面板改这里） · 右 B=冻结参考（不会跟着变）',
  'compare.bPresetLabel': 'B 对照方案',
  'compare.pickFromPresets': '从已存方案选…',
  'compare.noPresets': '（还没有已存方案）',
  'compare.freeze': '冻结当前为 B',
  'compare.freezeTitle': '把当前 A 场景拷一份固定到 B，然后改 A 看前后差异',
  'compare.swap': '⇄ 交换 A/B',
  'compare.swapTitle': '把 B 变成正在编辑的 A（左边），原来的 A 退到 B（右边）',
  'compare.bStatusPrefix': 'B：',
  'compare.notSet': '未设置',
  'compare.diffPrefix': '差异：',
  'compare.same': '同',
  'compare.paneA': 'A · 当前编辑（可改）',
  'compare.frozenAt': '冻结于 {time}',
  'compare.empty.title': '开始一次 A/B 对比',
  'compare.empty.desc': '先把一份画面放到 B 作为不动参考，再改左边 A 看差异。',
  'compare.empty.pickFromPresets': '从已存方案选 ·',
  'compare.empty.pickCount': '{count} 个可选…',
  'compare.empty.noPresets': '还没有已存方案 · 退回普通视图保存一份再来对比',
  'compare.empty.exit': '退出对比 · 回到普通视图继续调整',
  'relTime.justNow': '刚刚',
  'relTime.secondsAgo': '{n}秒前',
  'relTime.minutesAgo': '{n}分钟前',
  'relTime.hoursAgo': '{n}小时前',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'compare.title': 'A/B compare',
  'compare.subtitle': 'Left A = live edit (panel edits this) · right B = frozen reference (static)',
  'compare.bPresetLabel': 'B reference preset',
  'compare.pickFromPresets': 'Pick from saved presets…',
  'compare.noPresets': '(No saved presets)',
  'compare.freeze': 'Freeze current as B',
  'compare.freezeTitle': 'Copy the current A scene to B as a fixed reference, then edit A to see the diff',
  'compare.swap': '⇄ Swap A/B',
  'compare.swapTitle': 'Make B the live edit A (left); move the current A to B (right)',
  'compare.bStatusPrefix': 'B: ',
  'compare.notSet': 'Not set',
  'compare.diffPrefix': 'Diff: ',
  'compare.same': 'same',
  'compare.paneA': 'A · live edit (editable)',
  'compare.frozenAt': 'Frozen at {time}',
  'compare.empty.title': 'Start an A/B compare',
  'compare.empty.desc': 'Freeze a frame to B as a static reference, then edit A on the left to see the diff.',
  'compare.empty.pickFromPresets': 'Pick from saved presets ·',
  'compare.empty.pickCount': '{count} available…',
  'compare.empty.noPresets': 'No saved presets · exit to the normal view, save one, then compare',
  'compare.empty.exit': 'Exit compare · back to the normal view',
  'relTime.justNow': 'Just now',
  'relTime.secondsAgo': '{n}s ago',
  'relTime.minutesAgo': '{n}m ago',
  'relTime.hoursAgo': '{n}h ago',
}

const ja: Record<Key, string> = {
  'compare.title': 'A/B 比較',
  'compare.subtitle': '左 A=現在編集中（右パネルで変更） · 右 B=固定参照（連動しない）',
  'compare.bPresetLabel': 'B 参照プリセット',
  'compare.pickFromPresets': '保存済みプリセットから選択…',
  'compare.noPresets': '（保存済みプリセットなし）',
  'compare.freeze': '現在をBに固定',
  'compare.freezeTitle': '現在のAシーンをコピーしてBに固定し、Aを変更して前後の差分を確認',
  'compare.swap': '⇄ A/Bを入れ替え',
  'compare.swapTitle': 'Bを編集中のA（左）にし、元のAをB（右）に退避',
  'compare.bStatusPrefix': 'B：',
  'compare.notSet': '未設定',
  'compare.diffPrefix': '差分：',
  'compare.same': '同',
  'compare.paneA': 'A · 現在編集中（変更可）',
  'compare.frozenAt': '固定 {time}',
  'compare.empty.title': 'A/B比較を開始',
  'compare.empty.desc': 'まず1つの画面をBに固定参照として置き、左のAを変更して差分を確認。',
  'compare.empty.pickFromPresets': '保存済みプリセットから選択 ·',
  'compare.empty.pickCount': '{count}件選択可能…',
  'compare.empty.noPresets': '保存済みプリセットなし · 通常ビューに戻って保存してからもう一度比較',
  'compare.empty.exit': '比較を終了 · 通常ビューに戻って調整を継続',
  'relTime.justNow': 'たった今',
  'relTime.secondsAgo': '{n}秒前',
  'relTime.minutesAgo': '{n}分前',
  'relTime.hoursAgo': '{n}時間前',
}

export const compare: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
