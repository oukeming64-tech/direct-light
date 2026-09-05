import type { Store, StoreGet, StoreSet } from '../storeTypes'
import type { LightingPreset } from '../../types'
import { buildDefaultScene } from '../../data/defaults'
import { normalizePreset, normalizeScene } from '../../domain/sceneMigration'
import { newId, savePresets, saveCustomFixtures } from '../../lib/storage'

export function createPresetActions(
  set: StoreSet,
  get: StoreGet,
): Pick<
  Store,
  'importLightingPlan' | 'resetScene' | 'applyDebugPreset' | 'savePreset' | 'loadPreset' | 'duplicatePreset' | 'renamePreset' | 'deletePreset'
> {
  return {
    resetScene: () => set({ scene: buildDefaultScene(), selection: { kind: 'light', id: 'light-key' } }),

    applyDebugPreset: (id) =>
      set((s) => {
        const scene = structuredClone(s.scene)
        const byId = (lid: string) => scene.lights.find((l) => l.id === lid) ?? scene.lights[0]
        const key = byId('light-key')
        const fill = scene.lights.find((l) => l.id === 'light-fill')
        const rim = scene.lights.find((l) => l.id === 'light-rim')

        if (id === 'low-key-hard') {
          if (key) {
            key.type = 'hard'
            key.position = { x: 2.8, y: 1.8, z: 2.4 }
            key.intensity = 2.0
            key.softness = 0.1
            key.beamAngle = 30
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) fill.enabled = false
          if (rim) rim.enabled = false
          scene.studio.wallReflectance = 0.25
        } else if (id === 'high-soft') {
          if (key) {
            key.type = 'soft'
            key.position = { x: 2.8, y: 3.2, z: 2.4 }
            key.intensity = 1.8
            key.softness = 0.75
            key.beamAngle = 55
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) {
            fill.enabled = true
            fill.intensity = 0.7
          }
          if (rim) rim.enabled = false
          scene.studio.wallReflectance = 0.7
        } else if (id === 'rgb-rim') {
          if (key) {
            key.type = 'soft'
            key.position = { x: 0.6, y: 1.9, z: 3.2 }
            key.intensity = 0.9
            key.softness = 0.7
            key.color = '#ffffff'
            key.colorTemperature = 5600
            key.enabled = true
          }
          if (fill) fill.enabled = false
          if (rim) {
            rim.enabled = true
            rim.color = '#2f6bff'
            rim.colorTemperature = undefined
            rim.intensity = 1.15
          }
          scene.studio.wallReflectance = 0.55
        }
        return { scene }
      }),

    savePreset: (name, previewImage) => {
      const s = get()
      const preset: LightingPreset = {
        id: newId('preset'),
        name: name.trim() || `方案 ${s.presets.length + 1}`,
        sceneSnapshot: structuredClone(s.scene),
        previewImage,
        createdAt: Date.now(),
      }
      const presets = [...s.presets, preset]
      if (!savePresets(presets)) return false
      set({ presets })
      return true
    },

    importLightingPlan: (plan) => {
      const s = get()
      const ids = new Map(plan.customFixtures.map((f) => [f.id, newId('fixture')]))
      const customFixtures = [...s.customFixtures, ...plan.customFixtures.map((f) => ({ ...f, id: ids.get(f.id)! }))]
      const sceneSnapshot = structuredClone(plan.scene)
      sceneSnapshot.lights = sceneSnapshot.lights.map((l) => ({ ...l, fixturePresetId: ids.get(l.fixturePresetId ?? '') ?? l.fixturePresetId }))
      const presets = [...s.presets, { id: newId('preset'), name: plan.name, sceneSnapshot, createdAt: Date.now() }]
      if (!saveCustomFixtures(customFixtures)) return false
      if (!savePresets(presets)) {
        // Existing presets are intact; restore the original fixture library.
        if (!saveCustomFixtures(s.customFixtures)) set({ customFixtures })
        return false
      }
      set({ presets, customFixtures })
      return true
    },

    loadPreset: (id) =>
      set((s) => {
        const preset = s.presets.find((p) => p.id === id)
        if (!preset) return s
        return { scene: normalizeScene(preset.sceneSnapshot), selection: null }
      }),

    duplicatePreset: (id) => {
      const s = get()
      const preset = s.presets.find((p) => p.id === id)
      if (!preset) return false
      const copy: LightingPreset = {
        ...normalizePreset(structuredClone(preset)),
        id: newId('preset'),
        name: `${preset.name} Copy`,
        createdAt: Date.now(),
      }
      const presets = [...s.presets, copy]
      if (!savePresets(presets)) return false
      set({ presets })
      return true
    },

    renamePreset: (id, name) => {
      const s = get()
      if (!s.presets.some((preset) => preset.id === id)) return false
      const presets = s.presets.map((preset) => (preset.id === id ? { ...preset, name } : preset))
      if (!savePresets(presets)) return false
      set({ presets })
      return true
    },

    deletePreset: (id) => {
      const s = get()
      const presets = s.presets.filter((preset) => preset.id !== id)
      if (presets.length === s.presets.length || !savePresets(presets)) return false
      set({ presets })
      return true
    },
  }
}
