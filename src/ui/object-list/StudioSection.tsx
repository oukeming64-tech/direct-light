import { useStore } from '../../state/store'
import { useT } from '../../i18n/useT'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function StudioSection() {
  const studio = useStore((s) => s.scene.studio)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const t = useT()

  return (
    <Group title={t('objectList.studio.title')}>
      <div
        className={`${rowBase} ${rowState(isSelected(selection, 'studio', 'studio'))}`}
        onClick={() => select({ kind: 'studio', id: 'studio' })}
      >
        <span className="text-base">⬜</span>
        <span className="flex-1">{t('objectList.studio.row')}</span>
        <span className="text-[11px] text-zinc-500">
          {studio.width}×{studio.depth}
        </span>
      </div>
    </Group>
  )
}
