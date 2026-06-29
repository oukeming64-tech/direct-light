# Hermes 交接：v0.6d 控光器材近似光学 —— 纯函数模块

派发人：Claude Code（用户授权，本轮 Codex 无额度）。验收人：Claude Code（集成 + 类型 + 边界）→ 用户（肉眼视觉）。
状态：**仅起草一个纯函数文件**。Hermes 不做 scene/store/LightRig/lighting 集成，不改任何已存在文件，不宣布 v0.6d 完成。

## 0. 先读

1. `V0_6D_OPTICS_SPEC.md`（本任务源规格，数值以它为准）。
2. `HERMES.md §2/§3/§5`（角色边界、架构规则、交接格式）。
3. `HERMES_LESSONS.md`（别把 candidate 当 done；报告要写已知边界）。
4. 本文件给出的精确签名与公式。

不要读取/修改 v0.6a 附件数值、v0.6c gear 预设、`MAX_LIGHTS`、人物姿态、摄影机。

## 1. 任务（一句话）

新建**唯一**文件 `src/domain/controlGearOptics.ts`，把 v0.6d 的几何判断、黑旗 cut、柔光布框 diffusion、反光板虚拟补光、负补光 factor 写成**纯函数**。scene 端集成由 Claude 做，本任务**不接线**。

## 2. 写入范围（只此一个文件）

- `src/domain/controlGearOptics.ts` —— 新建。**不要**编辑任何其他文件（不碰 `LightRig.tsx`、`lighting.ts`、`StudioScene.tsx`、`sceneDiff.ts`、`TopBar.tsx`、`types.ts`、`sceneObjects.ts`）。
- 文件**不被任何地方 import** 是正常的——Claude 集成时再接。`tsc`/`lint` 仍会把它当独立模块编译检查。

## 3. 精确 import（照抄，且只 import 用到的）

```ts
import type { LightConfig, PersonConfig, SceneObjectConfig, Vector3 } from '../types'
import type { EffectiveLightParams } from './lightModifiers'
import { EFFECTIVE_LIGHT_LIMITS, getEffectiveLightParams } from './lightModifiers'
import { getEffectiveLightTarget, getPersonAimTarget } from './lightTargets'
import { isControlGearKind } from '../data/sceneObjects'
```

已确认的现有契约（不要重复定义、不要改）：
- `Vector3 = { x: number; y: number; z: number }`。
- `SceneObjectConfig` 字段：`id,name,kind,geometry,position:Vector3,rotationY,size:{width,depth,height},color,material,castShadow,receiveShadow,visible,showLabel`。
- `EffectiveLightParams = { intensity, beamAngle, softness, distance, spillMultiplier, modifier? }`。
- `EFFECTIVE_LIGHT_LIMITS = { intensityMin:0, intensityMax:3.2, beamAngleMin:10, beamAngleMax:80, softnessMin:0, softnessMax:0.96 }`。
- `getEffectiveLightParams(light: LightConfig): EffectiveLightParams`。
- `getEffectiveLightTarget(light: LightConfig, people: PersonConfig[]): Vector3`。
- `getPersonAimTarget(person: PersonConfig): Vector3`（人物胸脸点）。
- `isControlGearKind(kind): boolean`（true 当 kind ∈ blackFlag/reflectorBoard/diffusionFrame）。

## 4. 导出类型（照抄，按 `V0_6D_OPTICS_SPEC.md §8`）

```ts
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
```

## 5. 文件内部本地 helper（照抄；不要 export 这些）

```ts
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
```

## 6. 四个导出函数（照抄逻辑与数值；数值全部来自 `V0_6D_OPTICS_SPEC.md`）

### 6.1 `getGearLightOptics(light, target, objects)` —— 黑旗 cut（§5.1）+ 柔光布框 diffusion（§7）

同一盏灯**只取最强的一个黑旗 cut 和最强的一个柔光布框 diffusion**（§3 原则 5）。

```ts
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
```

### 6.2 `applyGearOpticsToLightParams(params, optics)` —— 把 optics 合成到 v0.6a effective params 之上并 clamp

clamp 边界全部用 `EFFECTIVE_LIGHT_LIMITS`（§7 要求：叠加灯上柔光布附件后 softness 仍不能超 max——clamp 负责）。

```ts
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
```

### 6.3 `getNegativeFillFactor(objects, people)` —— 黑旗吃反弹（§5.2）

每块靠近人物且朝向人物的黑旗降 0.06，最多叠到 0.16；返回的是给 ambient/hemisphere/bounce 用的**乘子**（1 = 不变）。签名按 §8 只吃 objects + people。

```ts
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
```

### 6.4 `getReflectorFillLights(lights, people, objects)` —— 反光板虚拟补光（§6）

返回**原始**结果（`intensity` 是 §6 的 `appIntensity`，0..0.38，**不要**乘 `SPOT_INTENSITY_SCALE`——渲染缩放由 Claude 在 LightRig 做）。最多取 2 块贡献最高的反光板。

```ts
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
```

## 7. 风格

- 2 空格缩进、单引号、无分号（house style，见 `src/domain/lightModifiers.ts` / `src/data/cameraPresets.ts`）。
- 纯函数：不 import React / Three / scene / store；不读 `Date.now()`/随机；不改入参对象（返回新对象）。
- 顶部加一段注释说明本模块是 v0.6d 纯光学判断、数值来自 `V0_6D_OPTICS_SPEC.md`、scene 端集成由 Claude 做。

## 8. 不要做（边界）

- 不接线：不改 `LightRig.tsx` / `lighting.ts` / `StudioScene.tsx` / `sceneDiff.ts` / `TopBar.tsx`。
- 不开 gear 的 `castShadow`，不用 mesh 阴影模拟黑旗。
- 不改 v0.6a 附件数值、v0.6c gear 预设、`MAX_LIGHTS`、姿态、摄影机、`types.ts`、`SceneConfig`。
- 不自己发明数值/阈值——全部用本文件给出的（即 spec 的）值。如果某处 spec 与本文件冲突，**停下并在交接里标记**，不要猜。
- 不新增 gear 种类、不重新引入单独「旗板」。
- 不宣布 v0.6d 完成；不把文档从 candidate 改成 done。

## 9. 验证

- `npm run lint` 通过。
- `npm run build` 通过（文件未被引用，但 tsc 会独立编译检查类型）。
- 不需要也不应跑预览/截图（本任务无可视产物，集成后由 Claude/用户验收）。

## 10. 交接报告（按 `HERMES.md §5` 格式）

```md
## Hermes Handoff

Task:
- 新建 src/domain/controlGearOptics.ts（v0.6d 纯光学判断），不接线。

Changed files:
- `src/domain/controlGearOptics.ts` — 新建：4 个导出函数 + 2 个导出类型 + 本地 helper。

Behavior:
- getGearLightOptics / applyGearOpticsToLightParams / getNegativeFillFactor / getReflectorFillLights，逻辑与数值照交接文档。

Validation:
- `npm run lint`: passed / failed
- `npm run build`: passed / failed

Known limits:
- 任何与 spec 不一致或拿不准的地方逐条列出（不要猜值）。

Needs review from:
- Claude Code: 集成（LightRig/lighting/StudioScene 接线 + 反光板虚拟补光渲染 + computeGlobalFill 接 negativeFillFactor）、类型、边界。
- 用户: 集成后肉眼视觉验收。
```
