import { useStore } from '../state/store'
import type { AspectRatio, CameraTargetMode } from '../types'
import { CAMERA_PRESETS } from '../data/cameraPresets'
import { cameraAzimuthDeg, cameraHorizontalDistance, cameraPositionFromPolar } from '../domain/cameraMath'
import { Field, PanelSection, Segmented, Slider } from './controls'
import { Header } from './PanelHeader'
import { useT, useLanguage } from '../i18n/useT'
import { getCameraPresetLabel } from '../i18n/display'

export function CameraPanel() {
  const camera = useStore((s) => s.scene.camera)
  const people = useStore((s) => s.scene.people)
  const viewMode = useStore((s) => s.viewMode)
  const updateCamera = useStore((s) => s.updateCamera)
  const setViewMode = useStore((s) => s.setViewMode)
  const setCameraTargetMode = useStore((s) => s.setCameraTargetMode)
  const aimCameraAtPerson = useStore((s) => s.aimCameraAtPerson)
  const applyCameraPreset = useStore((s) => s.applyCameraPreset)
  const requestFreeCameraCapture = useStore((s) => s.requestFreeCameraCapture)

  const dist = cameraHorizontalDistance(camera.position, camera.target)
  const az = cameraAzimuthDeg(camera.position, camera.target)
  const setPolar = (d: number, a: number) =>
    updateCamera({ position: cameraPositionFromPolar(camera.target, d, a, camera.position.y) })

  const isFree = viewMode === 'free'
  const targetMode = camera.targetMode ?? 'manual'
  const lockedPersonId = camera.targetPersonId ?? people[0]?.id
  const aimName = people.find((p) => p.id === lockedPersonId)?.name ?? 'Actor A'
  const t = useT()
  const language = useLanguage()

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title={t('cameraPanel.title')} subtitle={t('cameraPanel.subtitle')} />

      <PanelSection title={t('cameraPanel.section.lens')}>
        <Slider
          label={t('cameraPanel.focal')}
          min={18}
          max={85}
          step={1}
          unit="mm"
          value={camera.focalLength}
          onChange={(v) => updateCamera({ focalLength: v })}
          format={(v) => v.toFixed(0)}
        />
        <Segmented<AspectRatio>
          label={t('cameraPanel.aspect')}
          value={camera.aspectRatio}
          onChange={(v) => updateCamera({ aspectRatio: v })}
          options={[
            { value: '16:9', label: '16:9' },
            { value: '4:3', label: '4:3' },
            { value: '1:1', label: '1:1' },
            { value: '9:16', label: '9:16' },
          ]}
        />
      </PanelSection>

      <PanelSection title={t('cameraPanel.section.position')}>
        <Slider label={t('cameraPanel.azimuth')} min={-180} max={180} step={1} unit="°" value={az} onChange={(v) => setPolar(dist, v)} format={(v) => v.toFixed(0)} />
        <Slider label={t('cameraPanel.distance')} min={2} max={10} step={0.1} unit="m" value={dist} onChange={(v) => setPolar(v, az)} />
        <Slider label={t('cameraPanel.elevation')} min={0.4} max={3.5} step={0.05} unit="m" value={camera.position.y} onChange={(v) => updateCamera({ position: { ...camera.position, y: v } })} />
        <Slider label={t('cameraPanel.lookHeight')} min={0.2} max={2.6} step={0.05} unit="m" value={camera.target.y} onChange={(v) => updateCamera({ target: { ...camera.target, y: v }, targetMode: 'manual' })} />
      </PanelSection>

      <PanelSection title={t('cameraPanel.section.target')}>
        <Segmented<CameraTargetMode>
          label={t('cameraPanel.mode')}
          value={targetMode}
          onChange={(m) => setCameraTargetMode(m, lockedPersonId)}
          options={[
            { value: 'manual', label: t('cameraPanel.mode.manual') },
            { value: 'person', label: t('cameraPanel.mode.person') },
            { value: 'peopleCenter', label: t('cameraPanel.mode.peopleCenter') },
          ]}
        />
        {targetMode === 'person' && (
          <Field label={t('cameraPanel.lockTarget')}>
            <select
              className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
              value={lockedPersonId}
              onChange={(e) => setCameraTargetMode('person', e.target.value)}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {people.length > 0 && (
          <button
            className="mt-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
            onClick={() => aimCameraAtPerson(lockedPersonId)}
          >
            {t('cameraPanel.aimOnce', { name: aimName })}
          </button>
        )}
      </PanelSection>

      <PanelSection title={t('cameraPanel.section.presets')}>
        <div className="flex flex-wrap gap-1.5">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className="rounded-lg bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700/60"
              onClick={() => applyCameraPreset(preset.id)}
            >
              {getCameraPresetLabel(language, preset.id)}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title={t('cameraPanel.section.fromFree')}>
        <button
          className="w-full rounded-lg bg-zinc-800/60 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/60"
          onClick={() => (isFree ? requestFreeCameraCapture() : setViewMode('free'))}
        >
          {isFree ? t('cameraPanel.setFromFree') : t('cameraPanel.switchToFree')}
        </button>
        <p className="text-[11px] text-zinc-500">{t('cameraPanel.fromFreeHint')}</p>
      </PanelSection>
    </div>
  )
}
