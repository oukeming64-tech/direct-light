import type { StoreApi } from 'zustand'
import type {
  CameraConfig,
  CameraTargetMode,
  CustomFixturePreset,
  LightConfig,
  LightTargetMode,
  LightingPreset,
  PersonConfig,
  SceneConfig,
  SceneObjectConfig,
  Selection,
  StudioConfig,
  Vector3,
  ViewMode,
} from '../types'
import type { AppLanguage } from '../i18n/languages'

export type DragTarget = { kind: 'light' | 'person' | 'object' | 'camera'; id: string } | null

// Slot B of the A/B compare view: a frozen scene snapshot the live scene (A)
// is compared against. Stored as a clone so editing A never mutates B.
// `frozenAt` records when B was created, so the user can remember whether the
// reference is seconds old or from last week (v0.4.6 guidance).
export type CompareSnapshot = { name: string; scene: SceneConfig; frozenAt?: number }

export type Store = {
  scene: SceneConfig
  selection: Selection
  viewMode: ViewMode
  // v0.10: app UI language. A top-level preference, NOT part of `scene` or any
  // saved/exported data. Persisted separately to `direct-light.language.v1`.
  language: AppLanguage
  presets: LightingPreset[]
  // v0.9c: user-authored fixture library (persisted to localStorage), merged
  // with the built-in FIXTURE_PRESETS in the 器械 dropdown + applyFixturePreset.
  customFixtures: CustomFixturePreset[]
  dragTarget: DragTarget
  compareB: CompareSnapshot | null
  // v0.4c: bumped when the camera panel asks the free-view bridge to capture the
  // current orbit camera into scene.camera. The bridge watches this id.
  freeCameraCaptureRequestId: number

  // selection / view
  select: (selection: Selection) => void
  setViewMode: (mode: ViewMode) => void
  setDragTarget: (target: DragTarget) => void
  // v0.10: switch the app UI language (also persists it).
  setLanguage: (language: AppLanguage) => void

  // A/B compare
  setCompareB: (b: CompareSnapshot | null) => void
  freezeCompareB: () => void
  swapCompare: () => void

  // scene edits
  updateStudio: (patch: Partial<StudioConfig>) => void
  updatePerson: (id: string, patch: Partial<PersonConfig>) => void
  updateCamera: (patch: Partial<CameraConfig>) => void
  // v0.4c camera control
  setCameraPositionXZ: (x: number, z: number) => void
  setCameraTargetMode: (mode: CameraTargetMode, personId?: string) => void
  aimCameraAtPerson: (personId?: string) => void
  applyCameraPreset: (presetId: string) => void
  requestFreeCameraCapture: () => void
  setCameraFromFree: (position: Vector3, target: Vector3) => void

  // lights
  updateLight: (id: string, patch: Partial<LightConfig>) => void
  setLightPositionXZ: (id: string, x: number, z: number) => void
  setPersonPositionXZ: (id: string, x: number, z: number) => void
  toggleLight: (id: string) => void
  addLight: () => void
  duplicateLight: (id: string) => void
  removeLight: (id: string) => void
  aimLightAtPerson: (id: string, personId?: string) => void
  setLightTargetMode: (id: string, mode: LightTargetMode, personId?: string) => void
  // v0.5: seed a light from a fixture preset (undefined → back to 自定义参数).
  // v0.9c: resolves across built-in + custom fixtures.
  applyFixturePreset: (lightId: string, fixturePresetId: string | undefined) => void

  // v0.9c: custom fixture library management (all persisted to localStorage).
  // saveCurrentLightAsFixture snapshots a light's quality params into a new
  // custom fixture and points that light at it. removeCustomFixture drops a
  // custom fixture and clears the marker on any light that referenced it (raw
  // params untouched). importCustomFixtures parses a pack file and returns a
  // summary. exportCustomFixtures serializes the whole custom library.
  saveCurrentLightAsFixture: (lightId: string, name: string) => void
  removeCustomFixture: (fixtureId: string) => void
  importCustomFixtures: (text: string) => { added: number; errors: string[]; warnings: string[] }
  exportCustomFixtures: () => string
  // v0.6a: attach a control modifier to a light (undefined → 无附件); only writes
  // modifierId, never the raw intensity/beamAngle/softness.
  applyLightModifier: (lightId: string, modifierId: string | undefined) => void

  // people
  addPerson: () => void
  duplicatePerson: (id: string) => void
  removePerson: (id: string) => void
  rotatePerson: (id: string, rotationY: number) => void

  // objects (v0.3 white-studio structure / props)
  addObject: (presetId: string) => void
  duplicateObject: (id: string) => void
  removeObject: (id: string) => void
  updateObject: (id: string, patch: Partial<SceneObjectConfig>) => void
  setObjectPositionXZ: (id: string, x: number, z: number) => void
  rotateObject: (id: string, rotationY: number) => void
  toggleObjectVisibility: (id: string) => void

  // scene-level
  resetScene: () => void
  applyDebugPreset: (id: string) => void

  // presets (localStorage)
  savePreset: (name: string, previewImage?: string) => void
  loadPreset: (id: string) => void
  duplicatePreset: (id: string) => void
  renamePreset: (id: string, name: string) => void
  deletePreset: (id: string) => void
}

// Shared signatures for the per-group action factories in `./actions/*`.
export type StoreSet = StoreApi<Store>['setState']
export type StoreGet = StoreApi<Store>['getState']
