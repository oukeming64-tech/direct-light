import { MAX_LIGHTS } from '../../data/defaults'
import { effectiveLightColor } from '../../lib/color'
import { useStore } from '../../state/store'
import { useT, useLanguage } from '../../i18n/useT'
import { getLightTypeLabel } from '../../i18n/display'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function LightsSection() {
  const lights = useStore((s) => s.scene.lights)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const toggleLight = useStore((s) => s.toggleLight)
  const addLight = useStore((s) => s.addLight)
  const duplicateLight = useStore((s) => s.duplicateLight)
  const removeLight = useStore((s) => s.removeLight)
  const t = useT()
  const language = useLanguage()

  return (
    <Group
      title={t('objectList.lights.title', { current: lights.length, max: MAX_LIGHTS })}
      action={
        lights.length < MAX_LIGHTS ? (
          <button
            onClick={addLight}
            className="rounded px-1.5 text-lg leading-none text-zinc-400 hover:text-violet-300"
            title={t('objectList.lights.add')}
          >
            ＋
          </button>
        ) : (
          <span className="text-[10px] text-zinc-600">{t('common.full', { max: MAX_LIGHTS })}</span>
        )
      }
    >
      {lights.map((light) => {
        const swatch = `#${effectiveLightColor(light).getHexString()}`
        return (
          <div
            key={light.id}
            className={`${rowBase} group ${rowState(isSelected(selection, 'light', light.id))}`}
            onClick={() => select({ kind: 'light', id: light.id })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLight(light.id)
              }}
              className="h-3.5 w-3.5 shrink-0 rounded-full border"
              style={{
                background: light.enabled ? swatch : 'transparent',
                borderColor: light.enabled ? swatch : '#52525b',
              }}
              title={light.enabled ? t('objectList.lights.off') : t('objectList.lights.on')}
            />
            <span className={`flex-1 truncate ${light.enabled ? '' : 'text-zinc-500'}`}>{light.name}</span>
            <span className="text-[10px] text-zinc-500">{getLightTypeLabel(language, light.type)}</span>
            <div className="flex items-center opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateLight(light.id)
                }}
                disabled={lights.length >= MAX_LIGHTS}
                className="px-1 text-zinc-400 hover:text-violet-300 disabled:opacity-30"
                title={t('objectList.lights.duplicate')}
              >
                ⧉
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLight(light.id)
                }}
                className="px-1 text-zinc-400 hover:text-red-300"
                title={t('objectList.lights.delete')}
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </Group>
  )
}
