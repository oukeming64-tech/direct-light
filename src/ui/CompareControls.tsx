import { useStore } from '../state/store'
import { useT } from '../i18n/useT'

// Top strip for the A/B compare view. See ROADMAP §10 for v0.4.6 guidance:
// - A is always the live, editable scene on the left.
// - B on the right is a frozen reference; we show its name + when it was
//   frozen/selected, so the director remembers what they're comparing against.
// - Swap text stays explicit: "把 B 变成正在编辑的 A，原来的 A 退到 B".
export function CompareControls() {
  const presets = useStore((s) => s.presets)
  const compareB = useStore((s) => s.compareB)
  const setCompareB = useStore((s) => s.setCompareB)
  const freezeCompareB = useStore((s) => s.freezeCompareB)
  const swapCompare = useStore((s) => s.swapCompare)
  const t = useT()

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-zinc-800 bg-zinc-950/85 px-4 py-2 text-xs">
      <span className="font-medium text-zinc-300">{t('compare.title')}</span>
      <span className="text-zinc-500">{t('compare.subtitle')}</span>

      <div className="h-5 w-px bg-zinc-800" />

      <label className="flex items-center gap-1.5 text-zinc-400">
        {t('compare.bPresetLabel')}
        <select
          value=""
          onChange={(e) => {
            const preset = presets.find((p) => p.id === e.target.value)
            if (preset) setCompareB({ name: preset.name, scene: preset.sceneSnapshot, frozenAt: preset.createdAt })
          }}
          className="rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-violet-400"
        >
          <option value="" disabled>
            {presets.length ? t('compare.pickFromPresets') : t('compare.noPresets')}
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={freezeCompareB}
        title={t('compare.freezeTitle')}
        className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-violet-400/60 hover:text-violet-200"
      >
        {t('compare.freeze')}
      </button>

      <button
        onClick={swapCompare}
        disabled={!compareB}
        title={t('compare.swapTitle')}
        className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-violet-400/60 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('compare.swap')}
      </button>

      <span className="ml-auto truncate text-zinc-500">
        {t('compare.bStatusPrefix')}
        {compareB ? `${compareB.name}${compareB.frozenAt ? ` · ${formatShortTime(compareB.frozenAt)}` : ''}` : t('compare.notSet')}
      </span>
    </div>
  )
}

function formatShortTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
