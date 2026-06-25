import type { LightConfig } from '../../types'
import { useT } from '../../i18n/useT'
import { PanelSection, Slider } from '../controls'

export function LightBeamSection({
  light,
  onPatch,
  effectiveSummary,
}: {
  light: LightConfig
  onPatch: (patch: Partial<LightConfig>) => void
  // v0.6a: only set when a modifier is active — shows the post-modifier result so
  // the raw sliders below don't look "wrong" (e.g. slider 1.8 but image dimmer).
  effectiveSummary?: string
}) {
  const t = useT()
  return (
    <PanelSection title={t('lightPanel.section.beam')}>
      {effectiveSummary && (
        <p className="text-[11px] text-zinc-400">{t('lightPanel.effectiveQuality', { summary: effectiveSummary })}</p>
      )}
      <Slider
        label={t('lightPanel.beamAngle')}
        min={10}
        max={80}
        step={1}
        unit="°"
        value={light.beamAngle}
        onChange={(value) => onPatch({ beamAngle: value })}
        format={(value) => value.toFixed(0)}
      />
      <Slider
        label={t('lightPanel.softness')}
        min={0}
        max={1}
        step={0.01}
        value={light.softness}
        onChange={(value) => onPatch({ softness: value })}
        format={(value) =>
          value < 0.25
            ? `${t('lightPanel.softnessHard')} ${value.toFixed(2)}`
            : value > 0.7
              ? `${t('lightPanel.softnessSoft')} ${value.toFixed(2)}`
              : value.toFixed(2)
        }
      />
      <Slider
        label={t('lightPanel.normalBias')}
        min={0}
        max={0.05}
        step={0.001}
        value={light.normalBias ?? 0}
        onChange={(value) => onPatch({ normalBias: value })}
        format={(value) => value.toFixed(3)}
      />
    </PanelSection>
  )
}
