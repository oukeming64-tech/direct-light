import { MAX_OBJECTS } from '../../data/defaults'
import { SCENE_OBJECT_PRESETS } from '../../data/sceneObjects'
import { useStore } from '../../state/store'
import { useT, useLanguage } from '../../i18n/useT'
import { getSceneObjectKindLabel, getSceneObjectPresetLabel } from '../../i18n/display'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function SceneObjectsSection() {
  const objects = useStore((s) => s.scene.objects)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const addObject = useStore((s) => s.addObject)
  const duplicateObject = useStore((s) => s.duplicateObject)
  const removeObject = useStore((s) => s.removeObject)
  const toggleObjectVisibility = useStore((s) => s.toggleObjectVisibility)
  const t = useT()
  const language = useLanguage()

  return (
    <Group
      title={t('objectList.objects.title')}
      action={
        objects.length < MAX_OBJECTS ? (
          <select
            className="rounded bg-zinc-800/60 px-1 py-0.5 text-[11px] text-zinc-300 outline-none"
            value=""
            onChange={(e) => {
              if (e.target.value) addObject(e.target.value)
              e.target.value = ''
            }}
          >
            <option value="" disabled>
              {t('objectList.objects.addPlaceholder')}
            </option>
            <optgroup label={t('objectList.objects.title')}>
              {SCENE_OBJECT_PRESETS.filter((p) => p.group !== 'gear').map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {getSceneObjectPresetLabel(language, preset.id)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('objectList.objects.groupGear')}>
              {SCENE_OBJECT_PRESETS.filter((p) => p.group === 'gear').map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {getSceneObjectPresetLabel(language, preset.id)}
                </option>
              ))}
            </optgroup>
          </select>
        ) : (
          <span className="text-[10px] text-zinc-600">{t('common.full', { max: MAX_OBJECTS })}</span>
        )
      }
    >
      {objects.map((object) => (
        <div
          key={object.id}
          className={`${rowBase} group ${rowState(isSelected(selection, 'object', object.id))}`}
          onClick={() => select({ kind: 'object', id: object.id })}
        >
          <button
            className="px-0.5 text-[11px]"
            title={object.visible ? t('objectList.objects.hide') : t('objectList.objects.show')}
            onClick={(e) => {
              e.stopPropagation()
              toggleObjectVisibility(object.id)
            }}
          >
            {object.visible ? '👁' : '🚫'}
          </button>
          <span className={`flex-1 truncate ${object.visible ? '' : 'text-zinc-500'}`}>{object.name}</span>
          <span className="text-[10px] text-zinc-500">{getSceneObjectKindLabel(language, object.kind)}</span>
          <div className="flex items-center opacity-0 transition group-hover:opacity-100">
            <button
              className="px-1 text-zinc-400 hover:text-violet-300 disabled:opacity-30"
              title={t('objectList.objects.duplicate')}
              disabled={objects.length >= MAX_OBJECTS}
              onClick={(e) => {
                e.stopPropagation()
                duplicateObject(object.id)
              }}
            >
              ⧉
            </button>
            <button
              className="px-1 text-zinc-400 hover:text-red-300"
              title={t('objectList.objects.delete')}
              onClick={(e) => {
                e.stopPropagation()
                removeObject(object.id)
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </Group>
  )
}
