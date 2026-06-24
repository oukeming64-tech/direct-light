import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useStore } from '../../state/store'
import { isCustomFixture } from '../../domain/customFixtures'
import { useT } from '../../i18n/useT'
import { downloadDataUrl } from '../exportImage'
import type { FixturePreset } from '../../types'

// v0.9c: custom-fixture row under the 器械 dropdown — save the current light as a
// fixture, import/export a pack file, and remove the selected custom fixture.
export function LightFixtureActions({ lightId, selectedFixture }: { lightId: string; selectedFixture?: FixturePreset }) {
  const customFixtures = useStore((s) => s.customFixtures)
  const saveCurrentLightAsFixture = useStore((s) => s.saveCurrentLightAsFixture)
  const importCustomFixtures = useStore((s) => s.importCustomFixtures)
  const exportCustomFixtures = useStore((s) => s.exportCustomFixtures)
  const removeCustomFixture = useStore((s) => s.removeCustomFixture)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const t = useT()

  const removable = selectedFixture != null && isCustomFixture(selectedFixture)

  const onSave = () => {
    const name = window.prompt(t('lightPanel.fa.savePrompt'), selectedFixture?.label ?? t('lightPanel.fa.saveDefaultName'))
    if (name == null) return
    const trimmed = name.trim()
    if (!trimmed) return
    saveCurrentLightAsFixture(lightId, trimmed)
    setStatus(t('lightPanel.fa.saved', { name: trimmed }))
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    const text = await file.text()
    const res = importCustomFixtures(text)
    const parts = [t('lightPanel.fa.imported', { count: res.added })]
    if (res.warnings.length > 0) parts.push(t('lightPanel.fa.warnings', { count: res.warnings.length }))
    if (res.errors.length > 0) parts.push(t('lightPanel.fa.errors', { count: res.errors.length }))
    setStatus(parts.join(t('lightPanel.fa.statusSep')))
    if (res.errors.length > 0 || res.warnings.length > 0) {
      // Surface the details for debugging without a heavy UI.
      console.info('[custom-fixture import]', { errors: res.errors, warnings: res.warnings })
    }
  }

  const onExport = () => {
    if (customFixtures.length === 0) {
      setStatus(t('lightPanel.fa.exportEmpty'))
      return
    }
    const text = exportCustomFixtures()
    downloadDataUrl('data:application/json;charset=utf-8,' + encodeURIComponent(text), 'direct-light-fixtures.json')
    setStatus(t('lightPanel.fa.exported', { count: customFixtures.length }))
  }

  const onRemove = () => {
    if (!removable || !selectedFixture) return
    const ok = window.confirm(t('lightPanel.fa.removeConfirm', { name: selectedFixture.label }))
    if (!ok) return
    removeCustomFixture(selectedFixture.id)
    setStatus(t('lightPanel.fa.removed', { name: selectedFixture.label }))
  }

  const btn = 'rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-700/60'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={onSave} className={btn}>
          {t('lightPanel.fa.save')}
        </button>
        <button onClick={() => fileRef.current?.click()} className={btn}>
          {t('lightPanel.fa.import')}
        </button>
        <button onClick={onExport} className={btn}>
          {t('lightPanel.fa.export')}
        </button>
        {removable && (
          <button onClick={onRemove} className="rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20">
            {t('lightPanel.fa.remove')}
          </button>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </div>
      {status && <p className="text-[11px] text-zinc-400">{status}</p>}
    </div>
  )
}
