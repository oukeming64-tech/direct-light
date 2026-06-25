// Studio parameter panel (size / reflectance / structure).

import type { AppLanguage } from '../languages'

const zh = {
  'studioPanel.title': '白色影棚',
  'studioPanel.subtitle': '空间与反射',
  'studioPanel.section.size': '尺寸',
  'studioPanel.width': '棚宽',
  'studioPanel.depth': '棚深',
  'studioPanel.height': '棚高',
  'studioPanel.section.reflect': '反射 / 环境',
  'studioPanel.wallReflectance': '墙面反射',
  'studioPanel.floorReflectance': '地面反射',
  'studioPanel.ambientLevel': '环境基础亮度',
  'studioPanel.section.rendering': '渲染',
  'studioPanel.softShadows': '柔和阴影（PCF，无锯齿）',
  'studioPanel.section.structure': '结构',
  'studioPanel.cyclorama': '无缝弧形背景',
  'studioPanel.sideWalls': '侧墙',
  'studioPanel.ceiling': '顶面',
  'studioPanel.wallColor': '墙面颜色',
  'studioPanel.floorColor': '地面颜色',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'studioPanel.title': 'White studio',
  'studioPanel.subtitle': 'Space & reflectance',
  'studioPanel.section.size': 'Dimensions',
  'studioPanel.width': 'Studio width',
  'studioPanel.depth': 'Studio depth',
  'studioPanel.height': 'Studio height',
  'studioPanel.section.reflect': 'Reflectance / environment',
  'studioPanel.wallReflectance': 'Wall reflectance',
  'studioPanel.floorReflectance': 'Floor reflectance',
  'studioPanel.ambientLevel': 'Ambient base level',
  'studioPanel.section.rendering': 'Rendering',
  'studioPanel.softShadows': 'Soft shadows (PCF, no ringing)',
  'studioPanel.section.structure': 'Structure',
  'studioPanel.cyclorama': 'Seamless cyclorama',
  'studioPanel.sideWalls': 'Side walls',
  'studioPanel.ceiling': 'Ceiling',
  'studioPanel.wallColor': 'Wall color',
  'studioPanel.floorColor': 'Floor color',
}

const ja: Record<Key, string> = {
  'studioPanel.title': '白ホリスタジオ',
  'studioPanel.subtitle': '空間と反射',
  'studioPanel.section.size': 'サイズ',
  'studioPanel.width': '幅',
  'studioPanel.depth': '奥行',
  'studioPanel.height': '高さ',
  'studioPanel.section.reflect': '反射 / 環境',
  'studioPanel.wallReflectance': '壁面反射',
  'studioPanel.floorReflectance': '床面反射',
  'studioPanel.ambientLevel': '環境ベース輝度',
  'studioPanel.section.rendering': 'レンダリング',
  'studioPanel.softShadows': 'ソフトシャドウ（PCF、リング無し）',
  'studioPanel.section.structure': '構造',
  'studioPanel.cyclorama': 'シームレスホリゾント',
  'studioPanel.sideWalls': '側壁',
  'studioPanel.ceiling': '天井',
  'studioPanel.wallColor': '壁面色',
  'studioPanel.floorColor': '床面色',
}

export const studioPanel: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
