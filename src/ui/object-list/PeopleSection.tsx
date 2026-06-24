import { MAX_PEOPLE } from '../../data/defaults'
import { useStore } from '../../state/store'
import { useT } from '../../i18n/useT'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function PeopleSection() {
  const people = useStore((s) => s.scene.people)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const addPerson = useStore((s) => s.addPerson)
  const duplicatePerson = useStore((s) => s.duplicatePerson)
  const removePerson = useStore((s) => s.removePerson)
  const t = useT()

  return (
    <Group
      title={t('objectList.people.title')}
      action={
        people.length < MAX_PEOPLE ? (
          <button
            onClick={addPerson}
            className="rounded px-1.5 text-lg leading-none text-zinc-400 hover:text-violet-300"
            title={t('objectList.people.add')}
          >
            ＋
          </button>
        ) : (
          <span className="text-[10px] text-zinc-600">{t('common.full', { max: MAX_PEOPLE })}</span>
        )
      }
    >
      {people.map((person) => (
        <div
          key={person.id}
          className={`${rowBase} group ${rowState(isSelected(selection, 'person', person.id))}`}
          onClick={() => select({ kind: 'person', id: person.id })}
        >
          <span className="text-base">🧍</span>
          <span className="flex-1 truncate">{person.name}</span>
          <span className="text-[11px] text-zinc-500">{person.height.toFixed(2)}m</span>
          <div className="flex items-center opacity-0 transition group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                duplicatePerson(person.id)
              }}
              disabled={people.length >= MAX_PEOPLE}
              className="px-1 text-zinc-400 hover:text-violet-300 disabled:opacity-30"
              title={t('objectList.people.duplicate')}
            >
              ⧉
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removePerson(person.id)
              }}
              disabled={people.length <= 1}
              className="px-1 text-zinc-400 hover:text-red-300 disabled:opacity-30"
              title={t('objectList.people.delete')}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </Group>
  )
}
