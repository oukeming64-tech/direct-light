// Hook that binds the translator to the current store language. Components call
// `const t = useT()` then `t('topBar.reset')`. The returned function is stable
// per-language, so it is safe in deps arrays.

import { useMemo } from 'react'
import { useStore } from '../state/store'
import { t, type TParams } from './index'
import type { MessageKey } from './messages'

export function useT() {
  const language = useStore((s) => s.language)
  return useMemo(
    () => (key: MessageKey, params?: TParams) => t(language, key, params),
    [language],
  )
}

// For call sites that pass `language` into pure display/domain helpers
// (getLightTypeLabel, compareScenes, …) rather than translating a key directly.
export function useLanguage() {
  return useStore((s) => s.language)
}
