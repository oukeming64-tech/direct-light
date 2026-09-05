import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { getModifierLabel } from '../i18n/display'
import { useT } from '../i18n/useT'
import { capturePreview } from '../scene/capture'
import { makeLightingPlan, lightingPlanHtml, parseLightingPlan } from '../domain/lightingPlan'

export function LightingPlanActions() {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  async function exportPlan() {
    setBusy(true)
    setNotice('')
    const previousView = useStore.getState().viewMode
    try {
      useStore.getState().setViewMode('camera')
      // Allow React's camera swap and the next rendered frame to settle.
      for (let i = 0; i < 3; i++) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      const preview = capturePreview()
      if (!preview) throw new Error('Preview unavailable')
      const state = useStore.getState()
      const name = `Direct Light ${new Date().toISOString().slice(0, 10)}`
      const plan = makeLightingPlan(state.scene, state.customFixtures, name)
      const html = lightingPlanHtml(plan, preview, {
        note: t('plan.note'), camera: t('plan.camera'), top: t('plan.top'), lights: t('plan.lights'),
        name: t('plan.name'), fixture: t('plan.fixture'), target: t('plan.target'), settings: t('plan.settings'), restore: t('plan.restoreHint'),
      }, (id) => getModifierLabel(state.language, id))
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `direct-light-plan-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(t('plan.exported'))
    } catch {
      setNotice(t('plan.failed'))
    } finally {
      useStore.getState().setViewMode(previousView)
      setBusy(false)
    }
  }
  async function importPlan(file: File) {
    setBusy(true)
    setNotice('')
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('File too large')
      const text = await file.text()
      // Read only the inert JSON payload; never open or execute imported HTML.
      const match = text.match(/<script type="application\/json" id="direct-light-plan">([\s\S]*?)<\/script>/)
      const plan = parseLightingPlan(match ? match[1] : text)
      if (!useStore.getState().importLightingPlan(plan)) throw new Error('Save failed')
      setNotice(t('plan.imported'))
    } catch {
      setNotice(t('plan.failed'))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }
  return <div className="relative flex items-center gap-1">
    <button type="button" disabled={busy} onClick={() => void exportPlan()} className="whitespace-nowrap rounded-md border border-violet-500/50 px-2.5 py-1.5 text-xs text-violet-200 disabled:opacity-50">{t('plan.export')}</button>
    <button type="button" disabled={busy} onClick={() => input.current?.click()} className="whitespace-nowrap rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 disabled:opacity-50">{t('plan.import')}</button>
    <input ref={input} type="file" accept=".html,.json" className="hidden" aria-label={t('plan.import')} onChange={(e) => { const file = e.target.files?.[0]; if (file) void importPlan(file) }} />
    {notice && <button type="button" role="status" onClick={() => setNotice('')} className="fixed bottom-5 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-100 shadow-xl">{notice}</button>}
  </div>
}
