import { useState } from 'react'
import { useStore } from '../state/store'
import { useT } from '../i18n/useT'
import { capturePreview } from '../scene/capture'
import { downscaleDataUrl } from './exportImage'

export function PresetBar() {
  const presets = useStore((s) => s.presets)
  const savePreset = useStore((s) => s.savePreset)
  const loadPreset = useStore((s) => s.loadPreset)
  const duplicatePreset = useStore((s) => s.duplicatePreset)
  const deletePreset = useStore((s) => s.deletePreset)
  const [name, setName] = useState('')
  const t = useT()

  const handleSave = async () => {
    const raw = capturePreview()
    const thumb = raw ? await downscaleDataUrl(raw, 320) : undefined
    savePreset(name, thumb)
    setName('')
  }

  return (
    <div className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
      <div className="flex shrink-0 items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={t('presetBar.namePlaceholder')}
          className="w-36 rounded-lg bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        />
        <button
          onClick={handleSave}
          className="rounded-lg bg-violet-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
        >
          {t('presetBar.save')}
        </button>
      </div>

      <div className="h-8 w-px bg-zinc-800" />

      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {presets.length === 0 && (
          <span className="text-xs text-zinc-600">{t('presetBar.empty')}</span>
        )}
        {presets.map((p) => (
          <div
            key={p.id}
            className="group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 py-1 pl-1 pr-2 hover:border-violet-400/50"
            onClick={() => loadPreset(p.id)}
            title={t('presetBar.load')}
          >
            {p.previewImage ? (
              <img src={p.previewImage} alt={p.name} className="h-10 w-16 rounded object-cover" />
            ) : (
              <div className="grid h-10 w-16 place-items-center rounded bg-zinc-800 text-[10px] text-zinc-500">
                {t('presetBar.noPreview')}
              </div>
            )}
            <span className="max-w-[100px] truncate text-xs text-zinc-200">{p.name}</span>
            <div className="flex flex-col opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  duplicatePreset(p.id)
                }}
                className="px-1 text-[10px] text-zinc-400 hover:text-violet-300"
                title={t('presetBar.duplicate')}
              >
                ⧉
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deletePreset(p.id)
                }}
                className="px-1 text-[10px] text-zinc-400 hover:text-red-300"
                title={t('presetBar.delete')}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
