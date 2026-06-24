// Left-hand object list chrome. Built-in data-derived labels live in
// `src/i18n/display.ts` so source data tables stay unchanged.

import type { AppLanguage } from '../languages'

const zh = {
  'objectList.studio.title': '白棚',
  'objectList.studio.row': '白色影棚',

  'objectList.people.title': '人物',
  'objectList.people.add': '添加人物',
  'objectList.people.duplicate': '复制人物',
  'objectList.people.delete': '删除人物',

  'objectList.lights.title': '灯光 {current}/{max}',
  'objectList.lights.add': '添加灯',
  'objectList.lights.on': '开灯',
  'objectList.lights.off': '关灯',
  'objectList.lights.duplicate': '复制灯',
  'objectList.lights.delete': '删除灯',

  'objectList.camera.title': '摄影机',
  'objectList.camera.row': '主摄影机',

  'objectList.objects.title': '道具 / 结构',
  'objectList.objects.addPlaceholder': '＋ 加道具',
  'objectList.objects.groupGear': '控光器材',
  'objectList.objects.show': '显示',
  'objectList.objects.hide': '隐藏',
  'objectList.objects.duplicate': '复制',
  'objectList.objects.delete': '删除',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'objectList.studio.title': 'Studio',
  'objectList.studio.row': 'White studio',

  'objectList.people.title': 'People',
  'objectList.people.add': 'Add person',
  'objectList.people.duplicate': 'Duplicate person',
  'objectList.people.delete': 'Remove person',

  'objectList.lights.title': 'Lights {current}/{max}',
  'objectList.lights.add': 'Add light',
  'objectList.lights.on': 'Turn on',
  'objectList.lights.off': 'Turn off',
  'objectList.lights.duplicate': 'Duplicate light',
  'objectList.lights.delete': 'Remove light',

  'objectList.camera.title': 'Camera',
  'objectList.camera.row': 'Main camera',

  'objectList.objects.title': 'Props / structures',
  'objectList.objects.addPlaceholder': '＋ Add object',
  'objectList.objects.groupGear': 'Control gear',
  'objectList.objects.show': 'Show',
  'objectList.objects.hide': 'Hide',
  'objectList.objects.duplicate': 'Duplicate',
  'objectList.objects.delete': 'Delete',
}

const ja: Record<Key, string> = {
  'objectList.studio.title': 'スタジオ',
  'objectList.studio.row': '白ホリゾント',

  'objectList.people.title': '人物',
  'objectList.people.add': '人物を追加',
  'objectList.people.duplicate': '人物を複製',
  'objectList.people.delete': '人物を削除',

  'objectList.lights.title': 'ライト {current}/{max}',
  'objectList.lights.add': 'ライトを追加',
  'objectList.lights.on': '点灯',
  'objectList.lights.off': '消灯',
  'objectList.lights.duplicate': 'ライトを複製',
  'objectList.lights.delete': 'ライトを削除',

  'objectList.camera.title': 'カメラ',
  'objectList.camera.row': 'メインカメラ',

  'objectList.objects.title': '小道具 / 構造',
  'objectList.objects.addPlaceholder': '＋ 追加',
  'objectList.objects.groupGear': 'ライトコントロール機材',
  'objectList.objects.show': '表示',
  'objectList.objects.hide': '非表示',
  'objectList.objects.duplicate': '複製',
  'objectList.objects.delete': '削除',
}

export const objectList: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
