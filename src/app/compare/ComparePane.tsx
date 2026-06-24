import { summarizeLighting } from '../../domain/lightingSummary'
import { StudioScene } from '../../scene/StudioScene'
import type { SceneConfig } from '../../types'
import { useLanguage } from '../../i18n/useT'
import { ASPECT, letterbox, useElementSize } from '../canvasLayout'

// One non-interactive camera-locked render, letterboxed to its own aspect.
export function ComparePane({
  scene,
  label,
  badgeClass,
  primary,
  subtitle,
}: {
  scene: SceneConfig
  label: string
  badgeClass: string
  primary: boolean
  subtitle?: string
}) {
  const [ref, { w, h }] = useElementSize()
  const language = useLanguage()
  const ratio = ASPECT[scene.camera.aspectRatio] ?? 16 / 9
  const { boxW, boxH } = letterbox(w, h, ratio)

  return (
    <div ref={ref} className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-black">
      <div className="relative" style={{ width: `${boxW}px`, height: `${boxH}px` }}>
        {boxW > 0 && boxH > 0 && (
          <StudioScene scene={scene} view="camera" interactive={false} registerCapture={primary} />
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-violet-300/25" />
      </div>
      <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${badgeClass}`}>
          {label}
        </span>
        {subtitle && (
          <span className="rounded bg-zinc-950/75 px-2 py-0.5 text-[10px] text-zinc-400 ring-1 ring-zinc-700">
            {subtitle}
          </span>
        )}
        <span className="rounded bg-zinc-950/75 px-2 py-0.5 text-[10px] text-zinc-300 ring-1 ring-zinc-700">
          {summarizeLighting(scene, language)}
        </span>
      </div>
    </div>
  )
}
