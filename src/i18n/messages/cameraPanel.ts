// Camera parameter panel (lens / position / target / presets / free-view grab).

import type { AppLanguage } from '../languages'

const zh = {
  'cameraPanel.title': '主摄影机',
  'cameraPanel.subtitle': '镜头与机位',
  'cameraPanel.section.lens': '镜头',
  'cameraPanel.focal': '焦段（等效）',
  'cameraPanel.aspect': '画幅',
  'cameraPanel.section.position': '机位',
  'cameraPanel.azimuth': '方位角',
  'cameraPanel.distance': '距离',
  'cameraPanel.elevation': '高度',
  'cameraPanel.lookHeight': '看向高度',
  'cameraPanel.section.target': '目标',
  'cameraPanel.mode': '模式',
  'cameraPanel.mode.manual': '手动',
  'cameraPanel.mode.person': '锁定人物',
  'cameraPanel.mode.peopleCenter': '多人中心',
  'cameraPanel.lockTarget': '锁定对象',
  'cameraPanel.aimOnce': '对准 {name} 一次',
  'cameraPanel.section.presets': '机位预设',
  'cameraPanel.section.fromFree': '从自由视角取景',
  'cameraPanel.setFromFree': '设为当前自由视角',
  'cameraPanel.switchToFree': '切到自由视角调整',
  'cameraPanel.fromFreeHint': '在自由视角找好角度后，把它写入主摄影机。',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'cameraPanel.title': 'Main camera',
  'cameraPanel.subtitle': 'Lens & position',
  'cameraPanel.section.lens': 'Lens',
  'cameraPanel.focal': 'Focal length (equiv.)',
  'cameraPanel.aspect': 'Aspect ratio',
  'cameraPanel.section.position': 'Camera position',
  'cameraPanel.azimuth': 'Azimuth',
  'cameraPanel.distance': 'Distance',
  'cameraPanel.elevation': 'Height',
  'cameraPanel.lookHeight': 'Look-at height',
  'cameraPanel.section.target': 'Target',
  'cameraPanel.mode': 'Mode',
  'cameraPanel.mode.manual': 'Manual',
  'cameraPanel.mode.person': 'Lock to person',
  'cameraPanel.mode.peopleCenter': 'Group center',
  'cameraPanel.lockTarget': 'Locked target',
  'cameraPanel.aimOnce': 'Aim at {name} once',
  'cameraPanel.section.presets': 'Position presets',
  'cameraPanel.section.fromFree': 'Frame from free view',
  'cameraPanel.setFromFree': 'Use current free view',
  'cameraPanel.switchToFree': 'Switch to free view',
  'cameraPanel.fromFreeHint': 'Find an angle in free view, then write it to the main camera.',
}

const ja: Record<Key, string> = {
  'cameraPanel.title': 'メインカメラ',
  'cameraPanel.subtitle': 'レンズとカメラ位置',
  'cameraPanel.section.lens': 'レンズ',
  'cameraPanel.focal': '焦点距離（等価）',
  'cameraPanel.aspect': 'アスペクト比',
  'cameraPanel.section.position': 'カメラ位置',
  'cameraPanel.azimuth': '方位角',
  'cameraPanel.distance': '距離',
  'cameraPanel.elevation': '高さ',
  'cameraPanel.lookHeight': '注視高',
  'cameraPanel.section.target': 'ターゲット',
  'cameraPanel.mode': 'モード',
  'cameraPanel.mode.manual': '手動',
  'cameraPanel.mode.person': '人物ロック',
  'cameraPanel.mode.peopleCenter': '複数人中心',
  'cameraPanel.lockTarget': 'ロック対象',
  'cameraPanel.aimOnce': '{name} に一度合わせる',
  'cameraPanel.section.presets': 'カメラ位置プリセット',
  'cameraPanel.section.fromFree': 'フリービューから構図',
  'cameraPanel.setFromFree': '現在のフリービューに設定',
  'cameraPanel.switchToFree': 'フリービューに切替',
  'cameraPanel.fromFreeHint': 'フリービューで角度を決めたら、メインカメラに書き込みます。',
}

export const cameraPanel: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
