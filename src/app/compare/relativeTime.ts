import { t } from '../../i18n'
import type { AppLanguage } from '../../i18n'

// Pure formatter (no React) — the caller passes the current language so the
// relative phrase ("3 分钟前" / "3m ago" / "3分前") follows each grammar.
export function formatRelativeTime(ts: number, language: AppLanguage): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 5) return t(language, 'relTime.justNow')
  if (sec < 60) return t(language, 'relTime.secondsAgo', { n: sec })
  const min = Math.floor(sec / 60)
  if (min < 60) return t(language, 'relTime.minutesAgo', { n: min })
  const hr = Math.floor(min / 60)
  if (hr < 24) return t(language, 'relTime.hoursAgo', { n: hr })
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
