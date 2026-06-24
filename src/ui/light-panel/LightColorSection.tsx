import { COLOR_PRESETS, COLOR_TEMPERATURE_PRESETS } from '../../data/rendering'
import type { LightConfig } from '../../types'
import { useT, useLanguage } from '../../i18n/useT'
import { getColorPresetLabel } from '../../i18n/display'
import { ColorField, Field, PanelSection, Slider, SwatchRow } from '../controls'

export function LightColorSection({
  light,
  onPatch,
}: {
  light: LightConfig
  onPatch: (patch: Partial<LightConfig>) => void
}) {
  const t = useT()
  const language = useLanguage()
  return (
    <PanelSection title={t('lightPanel.section.color')}>
      <SwatchRow
        swatches={COLOR_PRESETS.map((color) => ({ label: getColorPresetLabel(language, color.name), color: color.color }))}
        activeColor={light.color}
        onPick={(swatch) => {
          const preset = COLOR_PRESETS.find((color) => color.color === swatch.color)
          onPatch({ color: swatch.color, colorTemperature: preset?.temperature })
        }}
      />
      <ColorField
        label={t('lightPanel.customColor')}
        value={light.color}
        onChange={(value) => onPatch({ color: value, colorTemperature: undefined })}
      />
      <Field
        label={`${t('lightPanel.colorTemp')}${
          light.colorTemperature ? ` · ${light.colorTemperature}K` : ` · ${t('lightPanel.colorTempOff')}`
        }`}
      >
        <SwatchRow
          swatches={COLOR_TEMPERATURE_PRESETS.map((color) => ({ label: color.label, color: color.color }))}
          onPick={(swatch) => {
            const preset = COLOR_TEMPERATURE_PRESETS.find((color) => color.color === swatch.color)
            onPatch({ color: '#ffffff', colorTemperature: preset?.value })
          }}
        />
      </Field>
      {light.colorTemperature != null && (
        <Slider
          label={t('lightPanel.colorTempFine')}
          min={3000}
          max={6800}
          step={50}
          unit="K"
          value={light.colorTemperature}
          onChange={(value) => onPatch({ color: '#ffffff', colorTemperature: value })}
        />
      )}
    </PanelSection>
  )
}
