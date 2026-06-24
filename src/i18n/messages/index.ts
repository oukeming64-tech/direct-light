// Message catalog aggregator.
//
// Each domain file (topBar, views, …) owns its own keys + zh/en/ja copy and
// enforces per-language completeness internally. This file merges them into the
// final MESSAGES table and derives `MessageKey` from the merged zh-CN source.
//
// To EXTEND:
//   • add a UI string  → add the key to one domain file (or create a new domain
//                         file) and register it in the three spreads below.
//   • add a language   → add its dict to every domain file and one spread here.
// The compiler flags any domain whose en/ja drifts out of sync with its zh-CN.

import type { AppLanguage } from '../languages'
import { topBar } from './topBar'
import { views } from './views'
import { common } from './common'
import { objectList } from './objectList'
import { presetBar } from './presetBar'
import { paramPanel } from './paramPanel'
import { studioPanel } from './studioPanel'
import { cameraPanel } from './cameraPanel'
import { personPanel } from './personPanel'
import { objectPanel } from './objectPanel'
import { lightPanel } from './lightPanel'
import { compare } from './compare'
import { display } from './display'

const zhCN = {
  ...topBar['zh-CN'],
  ...views['zh-CN'],
  ...common['zh-CN'],
  ...objectList['zh-CN'],
  ...presetBar['zh-CN'],
  ...paramPanel['zh-CN'],
  ...studioPanel['zh-CN'],
  ...cameraPanel['zh-CN'],
  ...personPanel['zh-CN'],
  ...objectPanel['zh-CN'],
  ...lightPanel['zh-CN'],
  ...compare['zh-CN'],
  ...display['zh-CN'],
}

// zh-CN is the source of truth for the key set.
export type MessageKey = keyof typeof zhCN
export type MessageDict = Record<MessageKey, string>

const en: MessageDict = {
  ...topBar.en,
  ...views.en,
  ...common.en,
  ...objectList.en,
  ...presetBar.en,
  ...paramPanel.en,
  ...studioPanel.en,
  ...cameraPanel.en,
  ...personPanel.en,
  ...objectPanel.en,
  ...lightPanel.en,
  ...compare.en,
  ...display.en,
}

const ja: MessageDict = {
  ...topBar.ja,
  ...views.ja,
  ...common.ja,
  ...objectList.ja,
  ...presetBar.ja,
  ...paramPanel.ja,
  ...studioPanel.ja,
  ...cameraPanel.ja,
  ...personPanel.ja,
  ...objectPanel.ja,
  ...lightPanel.ja,
  ...compare.ja,
  ...display.ja,
}

export const MESSAGES: Record<AppLanguage, MessageDict> = { 'zh-CN': zhCN, en, ja }
