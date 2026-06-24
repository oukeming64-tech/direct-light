import type { LightConfig } from '../../types'
import { useT } from '../../i18n/useT'
import { PanelSection, Slider } from '../controls'

export function LightPositionSection({
  light,
  distance,
  azimuth,
  onPatch,
  onSetPolar,
}: {
  light: LightConfig
  distance: number
  azimuth: number
  onPatch: (patch: Partial<LightConfig>) => void
  onSetPolar: (distance: number, azimuth: number) => void
}) {
  const t = useT()
  return (
    <PanelSection title={t('lightPanel.section.intensity')}>
      <Slider
        label={t('lightPanel.intensity')}
        min={0}
        max={3}
        step={0.05}
        value={light.intensity}
        onChange={(value) => onPatch({ intensity: value })}
      />
      <Slider
        label={t('lightPanel.height')}
        min={0.5}
        max={5}
        step={0.05}
        unit="m"
        value={light.position.y}
        onChange={(value) => onPatch({ position: { ...light.position, y: value } })}
      />
      <Slider
        label={t('lightPanel.distanceToPerson')}
        min={1.5}
        max={12}
        step={0.1}
        unit="m"
        value={distance}
        onChange={(value) => onSetPolar(value, azimuth)}
      />
      <Slider
        label={t('lightPanel.azimuth')}
        min={-180}
        max={180}
        step={1}
        unit="°"
        value={azimuth}
        onChange={(value) => onSetPolar(distance, value)}
        format={(value) => value.toFixed(0)}
      />
    </PanelSection>
  )
}
