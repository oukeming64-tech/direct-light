import { LIGHT_MODIFIER_PRESETS } from '../../data/lightModifiers'
import { getLightModifierPreset } from '../../domain/lightModifiers'
import { useT, useLanguage } from '../../i18n/useT'
import { getModifierLabel, getModifierShortLabel } from '../../i18n/display'
import { PanelSection } from '../controls'

// v0.6a: pick a control modifier (softbox / grid / reflector / diffusion) for the
// selected light. It only sets modifierId; effective light quality is recomputed
// at render, the raw sliders below stay editable.
export function LightModifierSection({
  modifierId,
  onApply,
}: {
  modifierId: string | undefined
  onApply: (modifierId: string | undefined) => void
}) {
  const modifier = getLightModifierPreset(modifierId)
  const t = useT()
  const language = useLanguage()
  return (
    <PanelSection title={t('lightPanel.section.modifier')}>
      <div className="flex items-center gap-2">
        <select
          value={modifierId ?? ''}
          onChange={(e) => onApply(e.target.value || undefined)}
          className="min-w-0 flex-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        >
          <option value="">{t('lightPanel.noModifier')}</option>
          {LIGHT_MODIFIER_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {getModifierLabel(language, preset.id)}
            </option>
          ))}
        </select>
        {modifier && (
          <span className="shrink-0 rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-700">
            {getModifierShortLabel(language, modifier.id)}
          </span>
        )}
      </div>
      <p className="text-[11px] text-zinc-500">{t('lightPanel.modifierHint')}</p>
    </PanelSection>
  )
}
