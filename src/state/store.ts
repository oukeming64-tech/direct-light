import { create } from 'zustand'
import { buildDefaultScene } from '../data/defaults'
import { normalizePreset } from '../domain/sceneMigration'
import { loadCustomFixtures, loadLanguage, loadPresets } from '../lib/storage'
import type { Store } from './storeTypes'
import { createViewActions } from './actions/viewActions'
import { createCompareActions } from './actions/compareActions'
import { createStudioActions } from './actions/studioActions'
import { createCameraActions } from './actions/cameraActions'
import { createLightActions } from './actions/lightActions'
import { createPersonActions } from './actions/personActions'
import { createObjectActions } from './actions/objectActions'
import { createPresetActions } from './actions/presetActions'
import { createFixtureActions } from './actions/fixtureActions'

// Public type surface preserved from the pre-split store.
export type { DragTarget, CompareSnapshot, Store } from './storeTypes'

// store.ts now only holds initial state + composes the per-group action
// factories from `./actions/*`. Each group's logic lives in its own file; the
// shared helpers and types are in `./storeHelpers.ts` / `./storeTypes.ts`.
export const useStore = create<Store>((set, get) => ({
  scene: buildDefaultScene(),
  selection: { kind: 'light', id: 'light-key' },
  viewMode: 'camera',
  language: loadLanguage(),
  presets: loadPresets().map(normalizePreset),
  customFixtures: loadCustomFixtures(),
  dragTarget: null,
  compareB: null,
  freeCameraCaptureRequestId: 0,

  ...createViewActions(set),
  ...createCompareActions(set),
  ...createStudioActions(set),
  ...createCameraActions(set),
  ...createLightActions(set, get),
  ...createPersonActions(set, get),
  ...createObjectActions(set, get),
  ...createPresetActions(set),
  ...createFixtureActions(set, get),
}))
