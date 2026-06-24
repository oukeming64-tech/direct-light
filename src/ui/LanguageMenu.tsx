import { useStore } from '../state/store'
import { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n/languages'
import { useT } from '../i18n/useT'

// Compact top-bar language selector. A plain <select> keeps the control small
// and avoids any custom-dropdown layout risk across the three languages.
export function LanguageMenu() {
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const t = useT()

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as AppLanguage)}
      title={t('language.label')}
      aria-label={t('language.label')}
      className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 hover:border-violet-400/60 hover:text-violet-200 focus:outline-none focus:ring-1 focus:ring-violet-400/50"
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
