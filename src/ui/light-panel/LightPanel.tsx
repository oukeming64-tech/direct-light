import { LIGHT_TYPE_DEFAULTS } from '../../data/rendering'
import { findFixtureById } from '../../domain/customFixtures'
import { formatEffectiveLightSummary, getEffectiveLightParams } from '../../domain/lightModifiers'
import { azimuthDeg, horizontalDistance, positionFromPolar } from '../../lib/geometry'
import { useStore } from '../../state/store'
import { useT, useLanguage } from '../../i18n/useT'
import { getFixtureDisplayLabel, getLightTypeLabel, getModifierLabel } from '../../i18n/display'
import type { LightConfig, LightTargetMode, LightType } from '../../types'
import { Header } from '../PanelHeader'
import { LightBaseSection } from './LightBaseSection'
import { LightBeamSection } from './LightBeamSection'
import { LightColorSection } from './LightColorSection'
import { LightModifierSection } from './LightModifierSection'
import { LightPositionSection } from './LightPositionSection'
import { LightTargetSection } from './LightTargetSection'

export function LightPanel({ id }: { id: string }) {
  const light = useStore((s) => s.scene.lights.find((candidate) => candidate.id === id))
  const people = useStore((s) => s.scene.people)
  const customFixtures = useStore((s) => s.customFixtures)
  const updateLight = useStore((s) => s.updateLight)
  const toggleLight = useStore((s) => s.toggleLight)
  const aimLightAtPerson = useStore((s) => s.aimLightAtPerson)
  const setLightTargetMode = useStore((s) => s.setLightTargetMode)
  const applyFixturePreset = useStore((s) => s.applyFixturePreset)
  const applyLightModifier = useStore((s) => s.applyLightModifier)
  const t = useT()
  const language = useLanguage()

  if (!light || !people.length) return null

  const fixture = findFixtureById(light.fixturePresetId, customFixtures)
  const effective = getEffectiveLightParams(light)
  const modifier = effective.modifier
  const fixtureLabel = fixture ? getFixtureDisplayLabel(language, fixture) : getLightTypeLabel(language, light.type)
  const targetMode = light.targetMode ?? 'manual'
  const targetPerson = people.find((person) => person.id === light.targetPersonId) ?? people[0]
  const distance = horizontalDistance(targetPerson, light.position)
  const azimuth = azimuthDeg(targetPerson, light.position)

  const patchLight = (patch: Partial<LightConfig>) => updateLight(id, patch)

  const setPolar = (nextDistance: number, nextAzimuth: number) =>
    patchLight({ position: positionFromPolar(targetPerson, nextDistance, nextAzimuth, light.position.y) })

  const changeTargetMode = (mode: LightTargetMode) => {
    setLightTargetMode(id, mode, targetPerson.id)
  }

  const changeType = (type: LightType) => {
    const def = LIGHT_TYPE_DEFAULTS[type]
    patchLight({ type, softness: def.softness, distance: def.distance })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header
        title={light.name}
        subtitle={`${fixtureLabel} · ${modifier ? getModifierLabel(language, modifier.id) : t('lightPanel.paramsFallback')}`}
      />

      <LightBaseSection
        light={light}
        fixture={fixture}
        customFixtures={customFixtures}
        onApplyFixture={(fixturePresetId) => applyFixturePreset(id, fixturePresetId)}
        onNameChange={(name) => patchLight({ name })}
        onTypeChange={changeType}
        onToggle={() => toggleLight(id)}
      />
      <LightModifierSection
        modifierId={light.modifierId}
        onApply={(modifierId) => applyLightModifier(id, modifierId)}
      />
      <LightColorSection light={light} onPatch={patchLight} />
      <LightPositionSection
        light={light}
        distance={distance}
        azimuth={azimuth}
        onPatch={patchLight}
        onSetPolar={setPolar}
      />
      <LightTargetSection
        people={people}
        targetMode={targetMode}
        targetPerson={targetPerson}
        onChangeMode={changeTargetMode}
        onChangePerson={(personId) => setLightTargetMode(id, 'person', personId)}
        onAim={() => aimLightAtPerson(id, targetPerson.id)}
      />
      <LightBeamSection
        light={light}
        onPatch={patchLight}
        effectiveSummary={modifier ? formatEffectiveLightSummary(effective, language) : undefined}
      />
    </div>
  )
}
