import type { Store, StoreSet } from '../storeTypes'
import { saveLanguage } from '../../lib/storage'

export function createViewActions(
  set: StoreSet,
): Pick<Store, 'select' | 'setViewMode' | 'setDragTarget' | 'setLanguage'> {
  return {
    select: (selection) => set({ selection }),
    setViewMode: (viewMode) => set({ viewMode, dragTarget: null }),
    setDragTarget: (dragTarget) => set({ dragTarget }),
    // v0.10: language is an app preference. set({ language }) shallow-merges, so
    // scene / customFixtures / presets / compareB keep their identity — switching
    // language never mutates scene or saved data (V0_10_I18N_SPEC.md §2/§9).
    setLanguage: (language) => {
      saveLanguage(language)
      set({ language })
    },
  }
}
