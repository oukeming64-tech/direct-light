import { useStore } from '../state/store'
import { DEBUG_PRESETS } from '../data/rendering'
import { exportPreviewImage } from './exportImage'
import { useT, useLanguage } from '../i18n/useT'
import { getDebugPresetTitle } from '../i18n/display'
import { LanguageMenu } from './LanguageMenu'
import type { MessageKey } from '../i18n/messages'
import type { ViewMode } from '../types'

const VIEWS: { value: ViewMode; labelKey: MessageKey }[] = [
  { value: 'camera', labelKey: 'view.camera' },
  { value: 'free', labelKey: 'view.free' },
  { value: 'top', labelKey: 'view.top' },
  { value: 'side', labelKey: 'view.side' },
  { value: 'compare', labelKey: 'view.compare' },
]

export function TopBar() {
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const applyDebugPreset = useStore((s) => s.applyDebugPreset)
  const resetScene = useStore((s) => s.resetScene)
  const t = useT()
  const language = useLanguage()

  return (
    <header className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/20 text-violet-200">◐</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-100">Direct Light</div>
          <div className="text-[10px] text-zinc-500">{t('topBar.subtitle')} · v1.0.1</div>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-zinc-800/60 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setViewMode(v.value)}
            className={`rounded-md px-3 py-1.5 text-xs transition ${
              viewMode === v.value
                ? 'bg-violet-500/30 text-violet-100 ring-1 ring-violet-400/50'
                : 'text-zinc-300 hover:bg-zinc-700/60'
            }`}
          >
            {t(v.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1 md:flex">
          {DEBUG_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyDebugPreset(p.id)}
              title={getDebugPresetTitle(language, p.id)}
              className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-violet-400/60 hover:text-violet-200"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={exportPreviewImage}
          className="rounded-md bg-violet-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
        >
          {t('topBar.exportImage')}
        </button>
        <button
          onClick={resetScene}
          className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
          title={t('topBar.resetTitle')}
        >
          {t('topBar.reset')}
        </button>
        <LanguageMenu />
      </div>
    </header>
  )
}
