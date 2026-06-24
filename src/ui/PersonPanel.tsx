import { useStore } from '../state/store'
import { PERSON_MODELS } from '../data/personModels'
import { buildSupportBinding, CLEAR_SUPPORT_BINDING, getPersonSupportSurfaces } from '../domain/supportSurfaces'
import { DEFAULT_POSE, POSE_PRESETS, SEATED_HIP_HEIGHT } from '../data/poses'
import type { PoseConfig } from '../types'
import { useT, useLanguage } from '../i18n/useT'
import { getPosePresetLabel } from '../i18n/display'
import { ColorField, Field, PanelSection, Slider, Toggle } from './controls'
import { Header } from './PanelHeader'

export function PersonPanel({ id }: { id: string }) {
  const person = useStore((s) => s.scene.people.find((p) => p.id === id))
  const objects = useStore((s) => s.scene.objects)
  const updatePerson = useStore((s) => s.updatePerson)
  const t = useT()
  const language = useLanguage()
  if (!person) return null

  const pose = { ...DEFAULT_POSE, ...(person.pose ?? {}) }
  const posePresetValue = POSE_PRESETS.some((p) => p.id === pose.presetId) ? pose.presetId : 'custom'
  const setPose = (patch: Partial<PoseConfig>) => updatePerson(id, { pose: { ...pose, presetId: 'custom', ...patch } })
  const supportSurfaces = getPersonSupportSurfaces(objects, language)

  // Seated hips sit at the group origin, so a floor-standing actor (y≈0) needs a
  // lift to seat height for the feet to land on the floor; standing back up from
  // that lifted height returns to the floor. Real seats set the exact Y instead.
  const reconcileY = (nextSeated: boolean) => {
    if (nextSeated && person.position.y < 0.1) return SEATED_HIP_HEIGHT
    if (!nextSeated && Math.abs(person.position.y - SEATED_HIP_HEIGHT) < 0.08) return 0
    return person.position.y
  }
  const applyPosePreset = (presetId: string) => {
    const preset = POSE_PRESETS.find((pp) => pp.id === presetId)
    if (!preset) return
    updatePerson(id, {
      pose: { ...preset.pose },
      position: { ...person.position, y: reconcileY(!!preset.pose.seated) },
    })
  }
  const setSeated = (nextSeated: boolean) =>
    updatePerson(id, {
      pose: { ...pose, presetId: 'custom', seated: nextSeated },
      position: { ...person.position, y: reconcileY(nextSeated) },
    })

  const placeOnSurface = (objectId: string) => {
    const surface = supportSurfaces.find((s) => s.object.id === objectId)
    if (!surface) return
    const position = { x: surface.object.position.x, y: surface.y, z: surface.object.position.z }
    // Build the attach-to-support binding BEFORE mutating the person's
    // position/rotationY — we want the offset to match the support placement
    // point, not any subsequent manual tweak.
    const binding = buildSupportBinding(
      // project the person to the future (post-placement) position so the
      // binding reflects it
      { ...person, position, rotationY: person.rotationY },
      surface.object,
    )
    if (surface.role === 'seat') {
      // sit on the seat: clean seated preset, hips at the seat top
      const seatedPose = POSE_PRESETS.find((pp) => pp.id === 'seated')?.pose ?? { ...DEFAULT_POSE, seated: true }
      updatePerson(id, { position, pose: { ...seatedPose }, ...binding })
    } else {
      // stand on the surface: feet at the top; stand up if we were seated
      updatePerson(id, { position, pose: pose.seated ? { ...DEFAULT_POSE } : pose, ...binding })
    }
  }

  const activeVariant = person.modelVariant ?? PERSON_MODELS[0]?.id ?? 'dummy'
  const poseDisabled = activeVariant !== 'dummy'
  const modelOptions = [
    { id: 'dummy', label: t('personPanel.modelVariant.dummy') },
    ...PERSON_MODELS.map(m => ({ id: m.id, label: m.label })),
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title={person.name} subtitle={t('personPanel.subtitle')} />
      <PanelSection title={t('personPanel.section.basic')}>
        <Field label={t('personPanel.name')}>
          <input
            value={person.name}
            onChange={(e) => updatePerson(id, { name: e.target.value })}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          />
        </Field>
        <Slider label={t('personPanel.height')} min={1.4} max={2.05} step={0.01} unit="m" value={person.height} onChange={(v) => updatePerson(id, { height: v })} />
        <Slider label={t('common.facing')} min={-180} max={180} step={1} unit="°" value={(person.rotationY * 180) / Math.PI} onChange={(v) => updatePerson(id, { rotationY: (v * Math.PI) / 180 })} format={(v) => v.toFixed(0)} />
      </PanelSection>
      <PanelSection title={t('personPanel.section.position')}>
        <Slider label={t('common.axisX')} min={-4} max={4} step={0.05} unit="m" value={person.position.x} onChange={(v) => updatePerson(id, { position: { ...person.position, x: v } })} />
        <Slider label={t('common.axisYoffGround')} min={0} max={1.5} step={0.05} unit="m" value={person.position.y} onChange={(v) => updatePerson(id, { position: { ...person.position, y: v } })} />
        <Slider label={t('common.axisZ')} min={-4} max={4} step={0.05} unit="m" value={person.position.z} onChange={(v) => updatePerson(id, { position: { ...person.position, z: v } })} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          {supportSurfaces.length > 0 ? (
            <Field label={t('personPanel.placeOnSupport')}>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) placeOnSurface(e.target.value)
                  e.target.value = ''
                }}
                className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="" disabled>
                  {t('personPanel.placeOnSupport.placeholder')}
                </option>
                {supportSurfaces.map((surface) => (
                  <option key={surface.object.id} value={surface.object.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={t('personPanel.placeOnSupport')}>
              <span className="rounded-lg bg-zinc-800/30 px-3 py-2 text-sm text-zinc-500">{t('personPanel.placeOnSupport.empty')}</span>
            </Field>
          )}
          <button
            onClick={() =>
              updatePerson(id, {
                position: { ...person.position, y: 0 },
                // standing back up on the floor: drop the seated fold + detach
                // from the support so future object moves don't drag the actor.
                pose: pose.seated ? { ...DEFAULT_POSE } : pose,
                ...CLEAR_SUPPORT_BINDING,
              })
            }
            className="self-end rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
          >
            {pose.seated ? t('personPanel.standUpSeated') : t('personPanel.standUp')}
          </button>
        </div>
      </PanelSection>
      <div className={poseDisabled ? 'pointer-events-none select-none opacity-40' : ''}>
      <PanelSection title={t('personPanel.section.pose')}>
        <Field label={t('personPanel.posePreset')}>
          <select
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
            value={posePresetValue}
            onChange={(e) => applyPosePreset(e.target.value)}
          >
            {posePresetValue === 'custom' && <option value="custom">{t('personPanel.poseCustom')}</option>}
            {POSE_PRESETS.map((pp) => (
              <option key={pp.id} value={pp.id}>
                {getPosePresetLabel(language, pp.id)}
              </option>
            ))}
          </select>
        </Field>
        <Toggle label={t('personPanel.seated')} checked={!!pose.seated} onChange={setSeated} />
        <p className="text-[11px] text-zinc-500">{t('personPanel.poseHint')}</p>
      </PanelSection>
      <PanelSection title={t('personPanel.section.poseTune')}>
        <Slider label={t('personPanel.headYaw')} min={-80} max={80} step={1} unit="°" value={pose.headYaw} onChange={(v) => setPose({ headYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.headPitch')} min={-45} max={45} step={1} unit="°" value={pose.headPitch} onChange={(v) => setPose({ headPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.torsoYaw')} min={-60} max={60} step={1} unit="°" value={pose.torsoYaw} onChange={(v) => setPose({ torsoYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.torsoPitch')} min={-20} max={40} step={1} unit="°" value={pose.torsoPitch} onChange={(v) => setPose({ torsoPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.leftUpperArmPitch')} min={-170} max={170} step={1} unit="°" value={pose.leftUpperArmPitch} onChange={(v) => setPose({ leftUpperArmPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.leftUpperArmRoll')} min={0} max={170} step={1} unit="°" value={pose.leftUpperArmRoll} onChange={(v) => setPose({ leftUpperArmRoll: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.leftForearmBend')} min={0} max={150} step={1} unit="°" value={pose.leftForearmBend} onChange={(v) => setPose({ leftForearmBend: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.leftForearmYaw')} min={-90} max={90} step={1} unit="°" value={pose.leftForearmYaw} onChange={(v) => setPose({ leftForearmYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.rightUpperArmPitch')} min={-170} max={170} step={1} unit="°" value={pose.rightUpperArmPitch} onChange={(v) => setPose({ rightUpperArmPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.rightUpperArmRoll')} min={0} max={170} step={1} unit="°" value={pose.rightUpperArmRoll} onChange={(v) => setPose({ rightUpperArmRoll: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.rightForearmBend')} min={0} max={150} step={1} unit="°" value={pose.rightForearmBend} onChange={(v) => setPose({ rightForearmBend: v })} format={(v) => v.toFixed(0)} />
        <Slider label={t('personPanel.rightForearmYaw')} min={-90} max={90} step={1} unit="°" value={pose.rightForearmYaw} onChange={(v) => setPose({ rightForearmYaw: v })} format={(v) => v.toFixed(0)} />
      </PanelSection>
      </div>
      <PanelSection title={t('personPanel.section.appearance')}>
        <Field label={t('personPanel.modelVariant')}>
          <div className="flex max-h-28 flex-col gap-0.5 overflow-y-auto rounded-lg bg-zinc-900/60 p-1">
            {modelOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => updatePerson(id, { modelVariant: opt.id })}
                className={`rounded-md px-3 py-1.5 text-left text-xs transition ${
                  activeVariant === opt.id
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-700/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
        <ColorField label={t('personPanel.skinTone')} value={person.skinTone} onChange={(v) => updatePerson(id, { skinTone: v })} />
        <ColorField label={t('personPanel.clothingColor')} value={person.clothingColor} onChange={(v) => updatePerson(id, { clothingColor: v })} />
        <Toggle label={t('personPanel.showFacePlane')} checked={person.showFacePlane} onChange={(v) => updatePerson(id, { showFacePlane: v })} />
      </PanelSection>
    </div>
  )
}
