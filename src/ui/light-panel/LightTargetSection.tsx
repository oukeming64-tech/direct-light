import type { LightTargetMode, PersonConfig } from '../../types'
import { useT, useLanguage } from '../../i18n/useT'
import { getLightTargetModeLabel } from '../../i18n/display'
import { Field, PanelSection, Segmented } from '../controls'

export function LightTargetSection({
  people,
  targetMode,
  targetPerson,
  onChangeMode,
  onChangePerson,
  onAim,
}: {
  people: PersonConfig[]
  targetMode: LightTargetMode
  targetPerson: PersonConfig
  onChangeMode: (mode: LightTargetMode) => void
  onChangePerson: (personId: string) => void
  onAim: () => void
}) {
  const t = useT()
  const language = useLanguage()
  return (
    <PanelSection title={t('lightPanel.section.target')}>
      <Segmented<LightTargetMode>
        label={t('lightPanel.mode')}
        value={targetMode}
        onChange={onChangeMode}
        options={[
          { value: 'manual', label: getLightTargetModeLabel(language, 'manual') },
          { value: 'person', label: getLightTargetModeLabel(language, 'person') },
          { value: 'peopleCenter', label: getLightTargetModeLabel(language, 'peopleCenter') },
        ]}
      />
      {targetMode === 'person' && (
        <Field label={t('lightPanel.targetPerson')}>
          <select
            value={targetPerson.id}
            onChange={(e) => onChangePerson(e.target.value)}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <button
        onClick={onAim}
        className="mt-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
      >
        {t('lightPanel.aimOnce')}
      </button>
    </PanelSection>
  )
}
