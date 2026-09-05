import { useStore } from '../state/store'
import { DEBUG_PRESETS } from '../data/rendering'
import { LightingPlanActions } from './LightingPlanActions'
import { exportPreviewImage } from './exportImage'
import { useT, useLanguage } from '../i18n/useT'
import { getDebugPresetTitle } from '../i18n/display'
import { LanguageMenu } from './LanguageMenu'
import type { MessageKey } from '../i18n/messages'
import type { ViewMode } from '../types'
import { useOnboarding } from './onboarding/OnboardingContext'

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
  const { openOnboarding } = useOnboarding()

  return (
    <header className="flex items-center justify-between gap-3 overflow-x-auto border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/20 text-violet-200">◐</span>
        <div className="hidden leading-tight lg:block">
          <div className="text-sm font-semibold text-zinc-100">Direct Light</div>
          <div className="text-[10px] text-zinc-500">{t('topBar.subtitle')} · v1.0.5</div>
        </div>
      </div>

      <div data-onboarding="views" className="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-800/60 p-1">
        {VIEWS.map((v) => (
          <button
            type="button"
            key={v.value}
            onClick={() => setViewMode(v.value)}
            aria-pressed={viewMode === v.value}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
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
        <div className="hidden items-center gap-1 2xl:flex">
          {DEBUG_PRESETS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => applyDebugPreset(p.id)}
              title={getDebugPresetTitle(language, p.id)}
              className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-violet-400/60 hover:text-violet-200"
            >
              {p.name}
            </button>
          ))}
        </div>
        <select
          value=""
          onChange={(event) => {
            if (event.target.value) applyDebugPreset(event.target.value)
          }}
          aria-label={t('topBar.quickLooks')}
          title={t('topBar.quickLooks')}
          className="max-w-32 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none hover:border-violet-400/60 focus:ring-1 focus:ring-violet-400 2xl:hidden"
        >
          <option value="" disabled>{t('topBar.quickLooks')}</option>
          {DEBUG_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportPreviewImage}
          data-onboarding="export"
          className="whitespace-nowrap rounded-md bg-violet-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          {t('topBar.exportImage')}
        </button>
        <LightingPlanActions />
        <button
          type="button"
          onClick={resetScene}
          className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
          title={t('topBar.resetTitle')}
        >
          {t('topBar.reset')}
        </button>
        <button
          type="button"
          onClick={openOnboarding}
          aria-label={t('onboarding.help')}
          title={t('onboarding.help')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-zinc-700 text-sm font-semibold text-zinc-400 hover:border-violet-400/60 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          ?
        </button>
        <LanguageMenu />
      </div>
    </header>
  )
}
