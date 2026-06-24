import { useEffect, useRef, useState } from 'react'
import type { AspectRatio } from '../types'

export const ASPECT: Record<AspectRatio, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
}

// v0.10: per-view hint copy moved into the i18n catalog (`view.hint.*`) and is
// rendered by ViewBadge through `t(...)`.

// Letterbox a pane to its scene's aspect ratio inside the available box.
export function letterbox(w: number, h: number, ratio: number) {
  if (!w || !h) return { boxW: w, boxH: h }
  return w / h > ratio ? { boxW: h * ratio, boxH: h } : { boxW: w, boxH: w / ratio }
}

export function useElementSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}
