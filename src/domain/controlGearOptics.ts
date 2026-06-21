// v0.6d 控光器材近似光学 —— 纯函数模块
//
// This file implements the geometric / optical helpers used by the scene to
// approximate what an in-front-of-light flag / reflector board / diffusion
// frame does to a light's effective quality. It is wired through LightRig,
// lighting.ts, and StudioScene; keep it pure and do not write derived optics
// back into SceneConfig.
//
// Numerical values and thresholds come from V0_6D_OPTICS_SPEC.md. Do not tune
// here without updating that spec first.

import type { LightConfig, PersonConfig, SceneObjectConfig, Vector3 } from '../types'
import type { EffectiveLightParams } from './lightModifiers'
import { EFFECTIVE_LIGHT_LIMITS, getEffectiveLightParams } from './lightModifiers'
import { getEffectiveLightTarget, getPersonAimTarget } from './lightTargets'
import { isControlGearKind } from '../data/sceneObjects'

export type GearLightOptics = {
  intensityMultiplier: number
  beamAngleMultiplier: number
  beamAngleDelta: number
  softnessDelta: number
  spillMultiplier: number
  notes: string[]
}

export type ReflectorFillLight = {
  id: string
  position: Vector3
  target: Vector3
  color: string
  intensity: number
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
function clamp01(v: number): number {
  return clamp(v, 0, 1)
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t)
}
function dist(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

// v0.6c gearPanel 几何约定（V0_6D_OPTICS_SPEC.md §4）：工作面中心、宽、高、法线。
type GearGeom = {
  obj: SceneObjectConfig
  center: Vector3
  width: number
  panelHeight: number
  normalXZ: { x: number; z: number }
}
function toGearGeom(obj: SceneObjectConfig): GearGeom {
  return {
    obj,
    center: {
      x: obj.position.x,
      y: obj.position.y + obj.size.height * 0.725,
      z: obj.position.z,
    },
    width: obj.size.width,
    panelHeight: obj.size.height * 0.55,
    normalXZ: { x: Math.sin(obj.rotationY), z: Math.cos(obj.rotationY) },
  }
}

// gear 工作面法线与「从中心指向某点」的水平朝向系数（0..1，1=正对）。
function facingTo(g: GearGeom, point: Vector3): number {
  const toX = point.x - g.center.x
  const toZ = point.z - g.center.z
  const len = Math.hypot(toX, toZ) || 1
  return Math.abs(g.normalXZ.x * (toX / len) + g.normalXZ.z * (toZ / len))
}

// gear 是否挡在灯 L 到目标 T 之间，返回 pathScore / facingScore（均 0..1）。
// 阈值逐字按 V0_6D_OPTICS_SPEC.md §4。
function blockScore(L: Vector3, T: Vector3, g: GearGeom): { pathScore: number; facingScore: number } {
  const segX = T.x - L.x
  const segY = T.y - L.y
  const segZ = T.z - L.z
  const segLen2 = segX * segX + segY * segY + segZ * segZ || 1
  // 最近点参数 t；必须落在线段中间，不能在灯后或目标后
  const t = ((g.center.x - L.x) * segX + (g.center.y - L.y) * segY + (g.center.z - L.z) * segZ) / segLen2
  if (t <= 0.05 || t >= 0.95) return { pathScore: 0, facingScore: 0 }
  const nx = L.x + t * segX
  const ny = L.y + t * segY
  const nz = L.z + t * segZ
  // 高度落在工作面上下边界 + 0.25m 容差内
  if (Math.abs(ny - g.center.y) > g.panelHeight / 2 + 0.25) return { pathScore: 0, facingScore: 0 }
  // 工作面中心到线段的水平距离 < width*0.65 + 0.25
  const dh = Math.hypot(g.center.x - nx, g.center.z - nz)
  const maxH = g.width * 0.65 + 0.25
  if (dh >= maxH) return { pathScore: 0, facingScore: 0 }
  const pathScore = clamp01(1 - dh / maxH)
  // 朝向系数：法线与灯→目标水平方向的 |dot|；< 0.18 视为 edge-on，衰减到 0
  const segHLen = Math.hypot(segX, segZ) || 1
  const facing = Math.abs(g.normalXZ.x * (segX / segHLen) + g.normalXZ.z * (segZ / segHLen))
  const facingScore = facing < 0.18 ? 0 : clamp01((facing - 0.18) / 0.82)
  return { pathScore, facingScore }
}

// 65% 白 + 35% 源灯颜色（V0_6D_OPTICS_SPEC.md §6）。输入 #rrggbb，输出 #rrggbb。
function mixToward(white: string, src: string, srcWeight: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [wr, wg, wb] = parse(white)
  const [sr, sg, sb] = parse(src)
  const mix = (w: number, s: number) => Math.round(w * (1 - srcWeight) + s * srcWeight)
  const toHex = (n: number) => clamp(n, 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(mix(wr, sr))}${toHex(mix(wg, sg))}${toHex(mix(wb, sb))}`
}

export function getGearLightOptics(
  light: LightConfig,
  target: Vector3,
  objects: SceneObjectConfig[],
): GearLightOptics {
  const optics: GearLightOptics = {
    intensityMultiplier: 1,
    beamAngleMultiplier: 1,
    beamAngleDelta: 0,
    softnessDelta: 0,
    spillMultiplier: 1,
    notes: [],
  }
  if (!light.enabled) return optics

  let bestCut = 0
  let bestDiff = 0
  for (const obj of objects) {
    if (obj.visible === false || !isControlGearKind(obj.kind)) continue
    if (obj.kind !== 'blackFlag' && obj.kind !== 'diffusionFrame') continue
    const g = toGearGeom(obj)
    const { pathScore, facingScore } = blockScore(light.position, target, g)
    const s = clamp01(pathScore * facingScore)
    if (s <= 0) continue
    if (obj.kind === 'blackFlag') bestCut = Math.max(bestCut, s)
    else bestDiff = Math.max(bestDiff, s)
  }

  if (bestCut > 0) {
    optics.intensityMultiplier *= lerp(1, 0.62, bestCut)
    optics.beamAngleMultiplier *= lerp(1, 0.86, bestCut)
    optics.spillMultiplier *= lerp(1, 0.55, bestCut)
    // softnessDelta 保持 0：黑旗不凭空让光变软（§5.1）
    optics.notes.push(`黑旗 cut ${bestCut.toFixed(2)}`)
  }
  if (bestDiff > 0) {
    optics.intensityMultiplier *= lerp(1, 0.76, bestDiff)
    optics.beamAngleDelta += lerp(0, 8, bestDiff)
    optics.softnessDelta += lerp(0, 0.16, bestDiff)
    optics.spillMultiplier *= lerp(1, 0.82, bestDiff)
    optics.notes.push(`柔光布框 diffusion ${bestDiff.toFixed(2)}`)
  }
  return optics
}

export function applyGearOpticsToLightParams(
  params: EffectiveLightParams,
  optics: GearLightOptics,
): EffectiveLightParams {
  return {
    ...params,
    intensity: clamp(
      params.intensity * optics.intensityMultiplier,
      EFFECTIVE_LIGHT_LIMITS.intensityMin,
      EFFECTIVE_LIGHT_LIMITS.intensityMax,
    ),
    beamAngle: clamp(
      params.beamAngle * optics.beamAngleMultiplier + optics.beamAngleDelta,
      EFFECTIVE_LIGHT_LIMITS.beamAngleMin,
      EFFECTIVE_LIGHT_LIMITS.beamAngleMax,
    ),
    softness: clamp(
      params.softness + optics.softnessDelta,
      EFFECTIVE_LIGHT_LIMITS.softnessMin,
      EFFECTIVE_LIGHT_LIMITS.softnessMax,
    ),
    spillMultiplier: params.spillMultiplier * optics.spillMultiplier,
  }
}

export function getNegativeFillFactor(
  objects: SceneObjectConfig[],
  people: PersonConfig[],
): number {
  const person = people[0]
  if (!person) return 1
  const target = getPersonAimTarget(person)
  let total = 0
  for (const obj of objects) {
    if (obj.visible === false || obj.kind !== 'blackFlag') continue
    const g = toGearGeom(obj)
    if (dist(g.center, target) > 1.6) continue
    if (facingTo(g, target) < 0.18) continue // edge-on 不吃反弹
    total += 0.06
  }
  return 1 - clamp(total, 0, 0.16)
}

export function getReflectorFillLights(
  lights: LightConfig[],
  people: PersonConfig[],
  objects: SceneObjectConfig[],
): ReflectorFillLight[] {
  const enabled = lights.filter((l) => l.enabled)
  // 主目标：优先第一个人物胸脸点；没有人物时用第一盏 enabled 灯的有效目标
  const personTarget = people[0]
    ? getPersonAimTarget(people[0])
    : enabled[0]
      ? getEffectiveLightTarget(enabled[0], people)
      : null
  if (!personTarget) return []

  type Candidate = { board: GearGeom; lightColor: string; intensity: number }
  const candidates: Candidate[] = []

  for (const obj of objects) {
    if (obj.visible === false || obj.kind !== 'reflectorBoard') continue
    const board = toGearGeom(obj)
    const dTarget = dist(board.center, personTarget)
    if (dTarget > 3.2) continue

    let best: Candidate | null = null
    for (const light of enabled) {
      const eff = getEffectiveLightParams(light)
      const dLight = dist(light.position, board.center)
      if (dLight >= eff.distance) continue // 灯照不到这块板
      const facing = 0.35 + 0.65 * Math.max(facingTo(board, light.position), facingTo(board, personTarget))
      const sourceFalloff = clamp01(1 - dLight / eff.distance)
      const targetFalloff = clamp01(1 - dTarget / 3.2)
      const intensity = clamp(eff.intensity * 0.1 * sourceFalloff * targetFalloff * facing, 0, 0.38)
      if (intensity <= 0.001) continue
      if (!best || intensity > best.intensity) best = { board, lightColor: light.color, intensity }
    }
    if (best) candidates.push(best)
  }

  candidates.sort((a, b) => b.intensity - a.intensity)
  return candidates.slice(0, 2).map((c) => ({
    id: `gearfill-${c.board.obj.id}`,
    position: c.board.center,
    target: personTarget,
    color: mixToward('#ffffff', c.lightColor, 0.35),
    intensity: c.intensity,
  }))
}
