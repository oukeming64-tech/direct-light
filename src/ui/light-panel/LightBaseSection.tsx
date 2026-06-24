import { FIXTURE_PRESETS } from '../../data/fixturePresets'
import { isCustomFixture } from '../../domain/customFixtures'
import type { CustomFixturePreset, FixturePreset, LightConfig, LightType } from '../../types'
import { useT, useLanguage } from '../../i18n/useT'
import { getFixtureCapabilityLabel, getFixtureDisplayLabel, getLightTypeLabel } from '../../i18n/display'
import { Field, PanelSection, Segmented, Toggle } from '../controls'
import { LightFixtureActions } from './LightFixtureActions'

export function LightBaseSection({
  light,
  fixture,
  customFixtures,
  onApplyFixture,
  onNameChange,
  onTypeChange,
  onToggle,
}: {
  light: LightConfig
  fixture?: FixturePreset
  customFixtures: CustomFixturePreset[]
  onApplyFixture: (fixturePresetId: string | undefined) => void
  onNameChange: (name: string) => void
  onTypeChange: (type: LightType) => void
  onToggle: () => void
}) {
  const fixtureSelectValue = fixture ? light.fixturePresetId ?? '' : ''
  const t = useT()
  const language = useLanguage()

  return (
    <PanelSection title={t('lightPanel.section.base')}>
      <Field label={t('lightPanel.fixture')}>
        <div className="flex items-center gap-2">
          <select
            value={fixtureSelectValue}
            onChange={(e) => onApplyFixture(e.target.value || undefined)}
            className="min-w-0 flex-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="">{t('lightPanel.customParams')}</option>
            <optgroup label={t('lightPanel.builtinFixtures')}>
              {FIXTURE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {getFixtureDisplayLabel(language, preset)}
                </option>
              ))}
            </optgroup>
            {customFixtures.length > 0 && (
              <optgroup label={t('lightPanel.myFixtures')}>
                {customFixtures.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {fixture && (
            <span className="shrink-0 rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-700">
              {getFixtureCapabilityLabel(language, fixture)}
            </span>
          )}
          {fixture && isCustomFixture(fixture) && (
            <span className="shrink-0 rounded-md bg-violet-500/20 px-2 py-1 text-[11px] text-violet-200 ring-1 ring-violet-400/40">
              {t('lightPanel.customBadge')}
            </span>
          )}
        </div>
      </Field>
      <p className="text-[11px] text-zinc-500">{t('lightPanel.fixtureHint')}</p>
      <LightFixtureActions lightId={light.id} selectedFixture={fixture} />
      <Field label={t('lightPanel.name')}>
        <input
          value={light.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        />
      </Field>
      <Segmented
        label={t('lightPanel.type')}
        value={light.type}
        onChange={onTypeChange}
        options={[
          { value: 'hard', label: getLightTypeLabel(language, 'hard') },
          { value: 'soft', label: getLightTypeLabel(language, 'soft') },
          { value: 'panel', label: getLightTypeLabel(language, 'panel') },
        ]}
      />
      <Toggle label={t('lightPanel.toggle')} checked={light.enabled} onChange={onToggle} />
    </PanelSection>
  )
}
