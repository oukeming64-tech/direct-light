// Prop / structure parameter panel. The raw `obj.kind` and material display
// names (`SCENE_OBJECT_MATERIALS[k].label`) stay data — only chrome here.

import type { AppLanguage } from '../languages'

const zh = {
  'objectPanel.subtitle': '道具 / 结构参数',
  'objectPanel.section.basic': '基础',
  'objectPanel.name': '名称',
  'objectPanel.kind': '类型',
  'objectPanel.visible': '显示',
  'objectPanel.section.transform': '位置 / 朝向',
  'objectPanel.section.size': '尺寸',
  'objectPanel.width': '宽',
  'objectPanel.depth': '深',
  'objectPanel.height': '高',
  'objectPanel.section.appearance': '外观',
  'objectPanel.material': '材质',
  'objectPanel.color': '颜色',
  'objectPanel.section.shadow': '阴影',
  'objectPanel.castShadow': '投射阴影',
  'objectPanel.receiveShadow': '接收阴影',
  'objectPanel.showLabel': '俯视标签',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'objectPanel.subtitle': 'Prop / structure settings',
  'objectPanel.section.basic': 'Basics',
  'objectPanel.name': 'Name',
  'objectPanel.kind': 'Type',
  'objectPanel.visible': 'Visible',
  'objectPanel.section.transform': 'Position / facing',
  'objectPanel.section.size': 'Size',
  'objectPanel.width': 'Width',
  'objectPanel.depth': 'Depth',
  'objectPanel.height': 'Height',
  'objectPanel.section.appearance': 'Appearance',
  'objectPanel.material': 'Material',
  'objectPanel.color': 'Color',
  'objectPanel.section.shadow': 'Shadow',
  'objectPanel.castShadow': 'Cast shadow',
  'objectPanel.receiveShadow': 'Receive shadow',
  'objectPanel.showLabel': 'Top-view label',
}

const ja: Record<Key, string> = {
  'objectPanel.subtitle': '小道具 / 構造パラメータ',
  'objectPanel.section.basic': '基本',
  'objectPanel.name': '名称',
  'objectPanel.kind': 'タイプ',
  'objectPanel.visible': '表示',
  'objectPanel.section.transform': '位置 / 向き',
  'objectPanel.section.size': 'サイズ',
  'objectPanel.width': '幅',
  'objectPanel.depth': '奥行',
  'objectPanel.height': '高さ',
  'objectPanel.section.appearance': '外観',
  'objectPanel.material': 'マテリアル',
  'objectPanel.color': '色',
  'objectPanel.section.shadow': 'シャドウ',
  'objectPanel.castShadow': '影を落とす',
  'objectPanel.receiveShadow': '影を受ける',
  'objectPanel.showLabel': '俯瞰ラベル',
}

export const objectPanel: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
