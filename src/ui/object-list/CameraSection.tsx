import { useStore } from '../../state/store'
import { useT } from '../../i18n/useT'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function CameraSection() {
  const camera = useStore((s) => s.scene.camera)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const t = useT()

  return (
    <Group title={t('objectList.camera.title')}>
      <div
        className={`${rowBase} ${rowState(isSelected(selection, 'camera', 'camera'))}`}
        onClick={() => select({ kind: 'camera', id: 'camera' })}
      >
        <span className="text-base">🎥</span>
        <span className="flex-1">{t('objectList.camera.row')}</span>
        <span className="text-[11px] text-zinc-500">{camera.focalLength}mm</span>
      </div>
    </Group>
  )
}
