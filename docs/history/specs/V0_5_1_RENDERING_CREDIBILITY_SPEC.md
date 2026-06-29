# v0.5.1 渲染可信度小修规格

状态：已由 Claude Code 实现，Codex 复核补交互，用户真机视觉验收通过。创建日期：2026-06-20；验收日期：2026-06-20。

## 1. 目标

v0.5.0 已经让灯具从“硬光/柔光/面光”升级到真实器械语义。v0.5.1 不新增灯具、不做控光附件，而是把当前渲染底座补得更可信：

- 白棚地面到后墙的无缝弧形更像真实 cyclorama。
- 柔光 / 面光 / 灯管在画面里有可读的发光面或灯体，不再只是一个发光小球。
- `floorReflectance` 对暗部和反弹的影响更明显，为后续反光板、黑旗、柔光箱打基础。

一句话目标：不追求物理精确，但让导演一眼觉得“这像一个白棚里的灯具和反弹”，而不是“几个参数在照假人”。

## 2. 分工边界

Codex 负责：

- 定义视觉目标、默认数值、验收标准。
- 判断白棚、面光源、反弹强度是否符合摄影沟通直觉。

Claude Code 负责：

- 工程实现、类型安全、构建检查。
- 保持现有 v0.5.0 灯具预设、A/B、保存/加载和摄影机功能不回退。
- 完成后更新 `COLLABORATION.md`、`ROADMAP.md`、`CLAUDE.md`。

Hermes 只允许在被明确指定时起草很小的纯函数或组件草稿，例如：

- `src/scene/studioGeometry.ts` 的 cyclorama geometry helper。
- `LightRig` 里的视觉灯体小组件。

Hermes 不允许：

- 改灯具预设数值。
- 改 `applyFixturePreset` 行为。
- 改 v0.6 控光附件数据结构。
- 自己扩大到“实现控光附件”。
- 在用户真机验收前，把 v0.5.1 标成“用户已验收完成”。

## 3. 范围

### 做

1. 真实一体感 cyclorama surface。
2. 柔光 / 面光 / RGB 灯管的可见灯体。
3. floor reflectance 对白色反弹和有色反弹的权重。
4. 文档同步和基础检查。

### 不做

- 不新增灯具预设。
- 不提高灯光数量上限。
- 不做柔光箱、蜂巢、黑旗、反光板、柔光布框；这些归 v0.6。
- 不引入路径追踪、GI、后处理管线。
- 不重写人物、摄影机、A/B。
- 不改变 v0.5.0 的 Direct Light 默认灯具数值。

## 4. 实现建议

### 4.1 一体 cyclorama

当前 `src/scene/Studio.tsx` 是 floor plane + back wall plane + quarter cylinder fillet。它可用，但地面/后墙/圆角仍像拼出来的。

建议新增：

- `src/scene/studioGeometry.ts`
- 导出 `buildCycloramaGeometry(width, depth, height, radius, segments): THREE.BufferGeometry`

推荐 geometry 逻辑：

- 用一条 `z/y` 截面曲线，沿 `x` 方向拉出一整张 surface。
- 截面包含：
  - 地面：`z = +depth/2` 到 `z = -depth/2 + radius`，`y = 0`
  - 圆角：从地面切线过渡到后墙，`radius = min(1.35, depth * 0.16, height * 0.35)`
  - 后墙：`z = -depth/2`，`y = radius` 到 `height`
- 横向两端：`x = -width/2` 和 `x = +width/2`
- 每个截面点生成左右两个顶点，连接成 strip faces。
- 调用 `geometry.computeVertexNormals()`，让圆角高光和阴影连续。

`Studio.tsx` 期望结果：

- `hasCyclorama: true` 时，floor + back wall + fillet 使用一个 mesh。
- `hasCyclorama: false` 时，保留平地面 + 后墙的简单表达。
- 侧墙和天花仍可单独 mesh，不需要本轮一体化。

验收直觉：

- 镜头视角下，地面到后墙不应出现明显拼接线。
- 硬光打到后墙/地面附近时，影子沿圆角过渡更自然。

### 4.2 可见灯体 / 面光源

当前 `LightRig.tsx` 里灯具视觉主要是一个 sphere gizmo，照明由 SpotLight 完成。v0.5.1 先加“可见灯体”，不要求它完全承担照明。

建议在 `LightRig.tsx` 内新增小组件，或拆到 `src/scene/LightVisual.tsx`：

```ts
type LightVisualKind = 'point' | 'softbox' | 'panel' | 'tube'
```

判断规则：

- fixture category 为 `tube`：显示一根细长 RGB 灯管。
- light.type 为 `panel` 且非 tube：显示方形/矩形 LED 面板。
- light.type 为 `soft`：显示较大的柔光面。
- light.type 为 `hard`：保留小点光源 / 小灯头表达。

尺寸建议：

- softbox：`width = 1.2 + softness * 0.9`，`height = 0.7 + softness * 0.45`
- panel：`width = 1.0`，`height = 1.0`
- tube：`length = 1.4`，`radius = 0.045`
- hard：`radius = 0.16`

视觉规则：

- 灯体位置等于 `light.position`。
- 灯体朝向 `target`。
- 视觉材质用 `meshBasicMaterial` 或轻 emissive 材质，`toneMapped={false}`，颜色取灯光有效颜色。
- 灯体只负责“看得懂是什么灯”，SpotLight 仍负责主要照明和阴影。
- 如果加 `RectAreaLight`，只能作为柔光/面光的轻量补充，不要替代现有 SpotLight 阴影。

推荐不要为了本轮引入复杂光度学：

- `RectAreaLight` 可以后置。
- 如果加，需要确认不破坏导出图和 A/B。
- 不要因为 RectAreaLight 无阴影而删 SpotLight。

验收直觉：

- 选 `LED 面板柔光` 后，场景里应看到一个面板式发光面。
- 选 `RGB 灯管` 后，场景里应看到一根蓝色/彩色灯管，而不是普通小球。
- 选 `菲涅尔硬光` 或 COB 时，灯体仍应更像小而硬的点源。

### 4.3 floor reflectance 权重

当前 `src/scene/lighting.ts` 的 `computeGlobalFill` 主要从 `wallReflectance` 推 ambient / hemisphere，`floorReflectance` 只通过 `hemisphereLight.groundColor` 间接参与，存在感偏弱。

建议更新 `src/data/rendering.ts` 的函数签名：

```ts
getAmbientIntensity(wallReflectance: number, floorReflectance: number): number
getHemisphereIntensity(wallReflectance: number, floorReflectance: number): number
getColorBounceIntensity(
  lightIntensity: number,
  saturation: number,
  wallReflectance: number,
  floorReflectance: number,
): number
```

建议公式：

```ts
export function getAmbientIntensity(wallReflectance: number, floorReflectance: number): number {
  return 0.10 + wallReflectance * 0.30 + floorReflectance * 0.12
}

export function getHemisphereIntensity(wallReflectance: number, floorReflectance: number): number {
  return 0.18 + wallReflectance * 0.28 + floorReflectance * 0.23
}

export function getColorBounceIntensity(
  lightIntensity: number,
  saturation: number,
  wallReflectance: number,
  floorReflectance: number,
): number {
  const reflectance = wallReflectance * 0.6 + floorReflectance * 0.4
  return Math.min(0.34, lightIntensity * saturation * (0.08 + reflectance * 0.12))
}
```

默认棚体下的变化应接近但略强于当前版本：

- 旧默认 ambient 约 `0.37`，新默认约 `0.36`。
- 旧默认 hemisphere 约 `0.49`，新默认约 `0.49`。
- 差别主要体现在拖动 `floorReflectance` 时更明显。

`computeGlobalFill` 要把 `studio.floorReflectance` 传入这些函数。

验收直觉：

- `floorReflectance` 降低时，人物暗部和地面阴影更沉。
- `floorReflectance` 提高时，阴影侧被白棚反弹托起来，但不能糊成没有方向的平光。
- RGB Rim / RGB Tube 开启时，高反射白棚应出现更明显的彩色环境染色。

## 5. 允许修改的文件

允许改：

- `src/scene/Studio.tsx`
- `src/scene/studioGeometry.ts`（新增）
- `src/scene/LightRig.tsx`
- `src/scene/LightVisual.tsx`（可选新增）
- `src/scene/lighting.ts`
- `src/data/rendering.ts`
- `RENDERING_SPEC.md`
- `ARCHITECTURE.md`
- `COLLABORATION.md`
- `CLAUDE.md`
- `HERMES.md`
- `ROADMAP.md`

不要改：

- `src/data/fixturePresets.ts`
- `src/state/actions/lightActions.ts`
- `src/state/store.ts`
- `src/types.ts`，除非实现灯体视觉时确实需要极小类型补充；优先不改。
- 人物姿态、摄影机、A/B 主交互、保存/加载逻辑。

## 6. 验收清单

代码检查：

- `npm run lint`
- `npm run build`

产品验收：

1. 默认镜头视角下，白棚地面到后墙的过渡更顺，不出现明显拼接线。
2. 硬光打向后墙/地面附近时，圆角上的阴影过渡自然。
3. `LED 面板柔光` 有可见面板灯体，且仍保持 v0.5.0 的软、宽画面。
4. `RGB 灯管` 有可见灯管形态，颜色跟当前灯色一致。
5. `菲涅尔硬光` / COB 不被误显示成大面板。
6. 调低 `floorReflectance` 时，阴影侧更沉；调高时，阴影侧被托亮。
7. 彩色灯在高反射白棚里产生更明显但不过量的彩色环境染色。
8. A/B 对比可用来比较改动前后，不黑屏，B 槽冻结逻辑不回退。
9. 保存、刷新、加载后，v0.5.0 灯具选择仍不丢。

## 7. 交接给 Claude 的建议顺序

1. 先做 `floorReflectance` 权重公式，风险最小。
2. 再做可见灯体，先只用视觉 mesh，不急着上 RectAreaLight。
3. 最后做 cyclorama geometry，因为它最容易牵涉相机视角和侧墙显示。
4. 每一步都跑 `lint/build`；完成后再让用户真机看画面。

如果 Claude 时间有限，优先级是：

1. 可见灯体。
2. floor reflectance 权重。
3. 一体 cyclorama。

原因：灯体和反弹对导演沟通更直接；cyclorama 是质感提升，但不是功能阻塞。
