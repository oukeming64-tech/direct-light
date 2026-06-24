import { useStore } from '../state/store'
import { getLightBrief } from '../domain/lightBrief'

// v0.6b: a one-line director-facing status bar shown in camera view when a light
// is the selected object, so the lighting setup reads from the picture without
// opening the right panel. (V0_6B_VISUAL_BRIEF_SPEC §4)
export function DirectorLightBrief() {
  const viewMode = useStore((s) => s.viewMode)
  const language = useStore((s) => s.language)
  const customFixtures = useStore((s) => s.customFixtures)
  const light = useStore((s) => {
    const sel = s.selection
    return sel?.kind === 'light' ? s.scene.lights.find((l) => l.id === sel.id) : undefined
  })

  if (viewMode !== 'camera' || !light) return null

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 max-w-[85%] truncate rounded-md bg-zinc-950/70 px-2.5 py-1 text-[11px] text-zinc-200 ring-1 ring-zinc-700/60">
      {getLightBrief(light, language, customFixtures)}
    </div>
  )
}
