# v0.6d 棚内控光器材近似光学规格

状态：**已落地并通过用户真机视觉验收（2026-06-21）**。Hermes 起草纯模块，Claude Code 审核并集成；用户确认实际明暗/补光/软化效果通过。验收修复：控光器材在 `ObjectPanel` 中隐藏材质选择器，颜色/尺寸/接收阴影仍保留。本规格建立在 v0.6c 的 3 个 gear 对象之上。创建日期：2026-06-21。

## 1. 目标

v0.6c 已经让黑旗、反光板、柔光布框能像道具一样摆进白棚。v0.6d 不做真实物理光学，而是给这 3 个 gear 一个导演能看懂的近似效果：

1. 黑旗靠近人物或挡在灯和人之间时，画面局部/整体读起来更“吃光”。
2. 反光板被灯照到并朝向人物时，人物暗部多一点弱补光。
3. 柔光布框在灯和人物之间时，对那盏灯做轻微变暗、变软、变宽。

一句话目标：让导演拖动 gear 时，画面变化足够用于拍摄前沟通，但仍保持实时、稳定、可解释。

## 2. 非目标

本版不要做：

- 路径追踪、真实 GI、真实反射。
- WebGL 后期遮罩 / 局部阴影贴图。
- C 架、夹具、机械结构升级。
- 新增光源数量上限或多灯管理。
- 让 gear 成为人物承载面。
- 把 `castShadow` 打开来模拟黑旗。v0.6d 应用纯计算和虚拟补光做可控近似，不依赖 Three.js mesh 阴影硬切。
- 改 v0.6a 灯上附件数值，除非只是读取已有 effective params 作为输入。
- 做 v0.7 开源收口、多语言、桌面封包。

## 3. 核心实现原则

1. **纯 helper 先行**：所有“gear 是否影响某盏灯 / 某个人”的判断先放到 `src/domain/controlGearOptics.ts` 这类纯函数里，scene 只消费结果。
2. **不写入原始灯光参数**：v0.6d 只生成运行时 effective optics，不改 `light.intensity / beamAngle / softness / modifierId`。
3. **不写入原始 gear 参数**：拖动、旋转、尺寸仍走现有 object 系统；光学效果由当前场景推导。
4. **效果可以粗，但要稳定**：gear 移到灯和人之间有变化，移开恢复；旋转 edge-on 时效果明显减弱。
5. **同屏只取最强影响**：同一盏灯最多吃一个黑旗 cut 和一个柔光布框 diffusion；反光板补光最多取 2 个最强候选，避免叠加失控。

## 4. 几何约定

沿用 v0.6c 的 `gearPanel` 几何：

- 工作面中心：
  - `x = object.position.x`
  - `y = object.position.y + object.size.height * 0.725`
  - `z = object.position.z`
- 工作面宽：`object.size.width`
- 工作面高：`object.size.height * 0.55`
- 工作面法线：局部 `+Z` 经 `rotationY` 旋转：

```ts
normal = {
  x: Math.sin(object.rotationY),
  y: 0,
  z: Math.cos(object.rotationY),
}
```

判断“gear 是否挡在灯到目标之间”时，使用灯位 `light.position` 到有效目标 `getEffectiveLightTarget(light, people)` 的线段：

- 最近点在线段中间，不能只在灯后或人后。
- gear 工作面中心到线段的水平距离小于 `object.size.width * 0.65 + 0.25`。
- 最近点高度落在工作面上下边界外加 `0.25m` 容差内。
- gear 法线与灯到目标方向不能完全平行边缘；用 `abs(dot(normalXZ, lightToTargetXZ))` 做朝向系数，低于 `0.18` 视为 edge-on，效果衰减到接近 0。

这些阈值是第一版经验值，优先“拖起来可读”，不是物理精确。

## 5. 黑旗效果

黑旗有两种近似：

### 5.1 直接 cut

当 `blackFlag` 位于某盏 enabled light 到目标之间：

- `intensityMultiplier`: `0.62` 到 `0.82`，按遮挡程度插值。
- `beamAngleMultiplier`: `0.86`。
- `spillMultiplier`: `0.55`。
- `softnessDelta`: `0`，不要凭空让光变软。

建议计算：

```ts
cutStrength = clamp01(pathScore * facingScore)
intensityMultiplier = lerp(1, 0.62, cutStrength)
beamAngleMultiplier = lerp(1, 0.86, cutStrength)
spillMultiplier = lerp(1, 0.55, cutStrength)
```

### 5.2 负补光 / 吃反弹

当黑旗不在灯路线上，但距离人物目标点 1.6m 内，并且工作面朝向人物附近：

- 全局 ambient / hemisphere 小幅下降。
- 每块有效黑旗降低 `0.06`，最多叠到 `0.16`。
- 只影响 `ambientIntensity`、`hemisphereIntensity` 和 colored bounce 的最终强度，不改变白棚 reflectance 滑杆数值。

建议：

```ts
negativeFillFactor = 1 - clamp(totalNegativeFill, 0, 0.16)
ambientIntensity *= negativeFillFactor
hemisphereIntensity *= negativeFillFactor
bounceIntensity *= negativeFillFactor
```

## 6. 反光板效果

反光板不改主光本身，而是在 scene 里生成一个**运行时虚拟补光**：

- 只来自 `kind === 'reflectorBoard'` 的对象。
- 不写入 `scene.lights`，不占 `MAX_LIGHTS`。
- 不 castShadow。
- 位置在反光板工作面中心。
- 目标指向当前主目标：优先第一个人物胸脸点；没有人物时用 enabled light target。
- 颜色：`65% 白 + 35% 源灯颜色`，让彩色主光有一点反色但不过量。
- 强度：弱，默认只做暗部补一点，不要像新增一盏灯。

候选判断：

1. 反光板距离人物目标点不超过 `3.2m`。
2. 至少有一盏 enabled light 能“照到”反光板：灯到反光板中心距离小于 light effective distance，且反光板大致面向灯或人物。
3. 取贡献最高的最多 2 块反光板。

建议强度：

```ts
sourcePower = effectiveLight.intensity
sourceFalloff = clamp01(1 - distance(light, boardCenter) / effectiveLight.distance)
targetFalloff = clamp01(1 - distance(boardCenter, personTarget) / 3.2)
facing = 0.35 + 0.65 * max(facingToLight, facingToTarget)
appIntensity = clamp(sourcePower * 0.10 * sourceFalloff * targetFalloff * facing, 0, 0.38)
```

渲染建议：

- 用 `pointLight` 或较宽的 `spotLight` 作为虚拟补光。
- 如果用 `pointLight`：`distance = 4.5`，`decay = 1.6`，`intensity = appIntensity * SPOT_INTENSITY_SCALE`。
- 如果用 `spotLight`：朝向人物，`angle = 55°`，`penumbra = 0.8`，`castShadow = false`。

第一版优先稳定，建议用 no-shadow `pointLight`。

## 7. 柔光布框效果

当 `diffusionFrame` 位于某盏 enabled light 到目标之间：

- 主光轻微变暗。
- 光束略宽。
- 柔硬程度增加。
- 彩色 spill 略降。

建议：

```ts
diffusionStrength = clamp01(pathScore * facingScore)
intensityMultiplier = lerp(1, 0.76, diffusionStrength)
beamAngleDelta = lerp(0, 8, diffusionStrength)
softnessDelta = lerp(0, 0.16, diffusionStrength)
spillMultiplier = lerp(1, 0.82, diffusionStrength)
```

注意：

- 不要把柔光布框做成 v0.6a `diffusion-cloth` 的替代品。灯上附件和棚内框是两套机制，可以叠加，但要 clamp。
- 如果同一盏灯已有 `diffusion-cloth` 附件，再穿过柔光布框，最终 softness 仍不能超过 `EFFECTIVE_LIGHT_LIMITS.softnessMax`。

## 8. 建议数据结构

新增纯结果类型即可，不需要改 `SceneConfig`：

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

建议 helper：

```ts
getGearLightOptics(light, target, objects): GearLightOptics
applyGearOpticsToLightParams(params, optics): EffectiveLightParams
getReflectorFillLights(lights, people, objects): ReflectorFillLight[]
getNegativeFillFactor(objects, people): number
```

具体命名 Claude 可按现有风格微调，但逻辑要保持纯函数、可单独读懂。

## 9. 写入范围

Claude 主实现建议：

- `src/domain/controlGearOptics.ts`：新增，承载几何判断、黑旗 cut、柔光布框 diffusion、反光板虚拟补光、负补光 factor。
- `src/scene/LightRig.tsx`：读取 `objects`，把 gear optics 应用到 SpotLight effective params，并渲染反光板虚拟补光。
- `src/scene/lighting.ts`：`computeGlobalFill` 增加可选 `objects/people` 或 `negativeFillFactor`，用于黑旗吃反弹。
- `src/scene/StudioScene.tsx`：把 `scene.objects` 和 `scene.people` 传给 `GlobalFill` / `LightRig`。
- `src/domain/sceneDiff.ts`：v0.6e 已把 A/B 摘要中的「控光器材」从「道具」拆出。
- `src/ui/TopBar.tsx`：v0.6d 完成时版本号曾升为 `v0.6d`；v0.6e 收口后当前可见版本号为 `v0.6e`。
- 文档：实现后同步 `COLLABORATION.md`、`ROADMAP.md`、`CLAUDE.md`、`HERMES.md`。

不应该触碰：

- `src/types.ts`，除非 TypeScript 类型必须导出纯 helper 类型；不需要改 `SceneConfig`。
- `src/data/sceneObjects.ts` 的 v0.6c 预设数值，除非用户明确要调 gear 默认位置/尺寸。
- v0.6a `src/data/lightModifiers.ts` 的附件数值。
- v0.5 灯具预设。
- 人物姿态、承载面逻辑、camera controls。
- `MAX_LIGHTS`。

## 10. Hermes / 候补 agent 边界

Hermes 可以做：

- 在 Claude/Codex 明确指定时，起草 `src/domain/controlGearOptics.ts` 的纯函数。
- 在 Claude/Codex 明确指定时，补小型 fixture-like demo case 或注释例子。
- 在 Claude/Codex 明确指定时，做很小的文档同步。

Hermes 不可以做：

- 自己决定光学数值。
- 自己改 v0.6a 附件数据。
- 自己打开 gear 的 `castShadow` 并宣称完成。
- 自己增加新的 gear 种类或重新引入单独「旗板」。
- 自己把 v0.6d/e/v0.7 一起做掉。

## 11. 验收清单

黑旗：

1. 把黑旗拖到 Key Light 与 Actor A 中间，人物受光明显变暗或光束更收；移开后恢复。
2. 旋转黑旗到接近 edge-on，效果明显减弱。
3. 黑旗靠近人物侧面但不在线路中间时，白棚反弹/暗部轻微变暗，不应整场景突然黑掉。

反光板：

4. 反光板放在人物暗侧、被主光照到并朝向人物时，暗部出现弱补光。
5. 反光板移远或转背后，补光消失。
6. 反光板补光不能强到像新增一盏主光；默认应是“能看见，但克制”。

柔光布框：

7. 柔光布框放在灯和人物之间时，对该灯略微降亮、变软、变宽。
8. 移开柔光布框后，光质恢复。
9. 柔光布框与灯上柔光布附件可叠加，但 softness / beamAngle / intensity 必须 clamp，不崩、不过曝。

回归：

10. gear 仍可拖动、旋转、改尺寸、显隐、复制、删除。
11. gear 仍不出现在人物“放到承载物”列表。
12. v0.6a/b 附件视觉和导演简介不回退。
13. A/B 对比不黑屏，冻结 B 后移动 gear 能看到差异。
14. 保存/加载/刷新后 gear 和效果仍可由场景重新推导。
15. `npm run lint` 和 `npm run build` 通过。

## 12. 完成后进入哪里

v0.6d 已完成并通过用户真机验收；后续 v0.6e 也已完成并通过用户视觉验收。再往后的 v0.7 可开源第一版和 v0.7.1 桌面图标 / Release 也已完成。2026-06-22 后续路线调整为：v0.8 更多光源 / 多灯管理，v0.9 自定义灯具预设导入/导出，多语言 UI 后置。
4. 然后 v0.7 / v0.7.1 已完成；不要从本规格重新启动 v0.7。
