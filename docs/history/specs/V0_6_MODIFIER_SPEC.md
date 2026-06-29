# v0.6 控光附件规格

状态：Codex 产品/渲染规格；v0.6a 已通过用户真机验收，v0.6b 已通过用户视觉验收，v0.6c 已通过用户真机视觉验收，v0.6d 已通过用户真机视觉验收。下一步不是 v0.7，而是按 `V0_6E_CLOSEOUT_SPEC.md` 推进 v0.6e 收口。创建日期：2026-06-20；最近调整：2026-06-21。

## 1. 总目标

v0.5 让灯具有了“器械语义”，v0.5.1 让白棚、灯体和反弹更可信。v0.6 开始处理摄影现场更常见的问题：同一盏灯加不加附件，画面差别是什么。

一句话目标：让导演能用 A/B 看懂“裸灯 / 柔光箱 / 蜂巢 / 反光罩 / 柔光布”的差异，而不是只在面板里看到一串参数。

## 2. 拆分版本

### v0.6a：灯上附件 MVP

只做“绑在某盏灯上的附件”，不做可摆放的棚内独立器材。

范围：

- 中号柔光箱。
- 蜂巢。
- 标准反光罩。
- 柔光布。

核心实现：

- `LightConfig` 增加可选 `modifierId?: string`。
- 新增附件预设数据表。
- 新增有效光质计算 helper：附件影响“有效亮度 / 有效光束角 / 有效柔硬 / 彩色反弹溢光”，但不破坏灯光原始参数。
- `LightPanel` 增加“附件”选择。
- A/B、保存、加载、导出自然携带附件字段。

### v0.6b：附件视觉和导演视角简介

执行规格：`V0_6B_VISUAL_BRIEF_SPEC.md`。
状态：已落地并通过用户视觉验收。

让灯上附件能被看见，并补一个轻量导演视角简介。

范围：

- 柔光箱显示为更大的柔光面。
- 蜂巢 / 标准反光罩显示为灯头前方的小罩体。
- 柔光布显示为半透明扩散片。
- 镜头视角选中灯时，画面角落显示一行简介，例如：`Key Light · Nanlux Evoke 600C · 中号柔光箱 · 柔光主光`。

### v0.6c：棚内独立控光器材

执行规格：`V0_6C_GEAR_SPEC.md`。
状态：已落地并通过用户真机视觉验收。

把黑旗、反光板、柔光布框做成可拖动的棚内对象。用户已定稿：旗板 = 黑旗，白旗板 = 反光板，不再单独做「旗板」。

范围：

- 黑旗。
- 反光板。
- 柔光布框。

第一版先像道具一样可摆位、旋转、改尺寸、显示标签，不急着做真实遮挡/反射。

### v0.6d：近似光学效果

在 v0.6c 的对象基础上再做光学近似：

- 黑旗减少局部反弹或吃光。
- 反光板给人物暗部一个弱补光。
- 柔光布在灯与人物之间时，让有效光更软更暗。
- 黑旗对某些方向的溢光做简化遮挡。

### v0.6e：收口验收

- A/B 差异摘要能提示“附件”变化。
- 保存/加载/复制/交换 A/B 不丢附件。
- 导出图正常。
- 文档同步。
- v0.7 可开源第一版和 v0.7.1 桌面图标 / Release 已完成；更多光源放到 v0.8，多语言后置。

## 3. v0.6a 产品原则

1. 附件不是另一个灯具库。灯具回答“这是什么灯”，附件回答“这盏灯前面装了什么”。
2. 附件第一版只影响有效光质，不直接覆盖用户手动调过的原始亮度、光束角、柔硬。
3. 用户清空附件时，原始灯光参数应该回到可见状态，不需要猜软件到底改坏了什么。
4. v0.6a 不做物理准确，只做摄影沟通直觉：柔光箱明显更软更宽且略暗，蜂巢更窄更少溢光，反光罩更集中更硬更亮，柔光布明显更暗、只轻微变软和扩散。
5. A/B 是默认验收容器：同一灯位同一器械，只切附件，画面应该有明显差别。

## 4. 数据结构建议

### 4.1 类型

`src/types.ts`：

```ts
export type LightConfig = {
  // existing fields...
  fixturePresetId?: string
  modifierId?: string
}
```

`modifierId` 用 string，与 `fixturePresetId` 保持一致。未知 id 必须 no-op / fallback 到无附件，不允许崩溃。

### 4.2 附件数据表

新增：

- `src/data/lightModifiers.ts`

建议类型：

```ts
export type LightModifierCategory = 'softener' | 'control' | 'reflector'
export type LightModifierVisualKind = 'none' | 'softbox' | 'grid' | 'reflector' | 'diffusion'

export type LightModifierPreset = {
  id: string
  label: string
  shortLabel: string
  category: LightModifierCategory
  description: string
  compatibleFixtureCategories?: string[]
  effect: {
    intensityMultiplier: number
    beamAngleMultiplier?: number
    beamAngleDelta?: number
    softnessDelta: number
    spillMultiplier: number
  }
  visualKind: LightModifierVisualKind
}
```

首批 4 个预设：

| id | UI 文案 | 直觉 | intensity | beamAngle | softness | spill |
|---|---|---|---:|---:|---:|---:|
| `softbox-medium` | 中号柔光箱 | 明显更软、更宽，亮度略降 | `*0.76` | `+24°` | `+0.36` | `*0.95` |
| `honeycomb-grid` | 蜂巢 | 收束光线，背景和地面溢光减少 | `*0.82` | `*0.55` | `-0.08` | `*0.42` |
| `standard-reflector` | 标准反光罩 | 更集中、更硬、更亮 | `*1.18` | `*0.72` | `-0.06` | `*0.78` |
| `diffusion-cloth` | 柔光布 | 明显变暗，只轻微变软和扩散 | `*0.48` | `+4°` | `+0.12` | `*1.12` |

夹紧规则：

- 有效亮度：`0..3.2`
- 有效光束角：`10..80`
- 有效柔硬：`0..0.96`
- `spillMultiplier` 用于彩色反弹 / 白棚溢光近似，第一版只影响 colored bounce 即可。

### 4.3 有效光质 helper

新增：

- `src/domain/lightModifiers.ts`

建议导出：

```ts
export type EffectiveLightParams = {
  intensity: number
  beamAngle: number
  softness: number
  distance: number
  spillMultiplier: number
  modifier?: LightModifierPreset
}

export function getEffectiveLightParams(light: LightConfig): EffectiveLightParams
```

计算规则：

1. 从 light 原始字段开始：`intensity / beamAngle / softness / distance`。
2. 找不到 modifier：原样返回，`spillMultiplier = 1`。
3. 找到 modifier：按表格乘/加，再 clamp。
4. 不改 `light` 本身。

使用位置：

- `src/scene/LightRig.tsx`：SpotLight 的 `intensity / angle / penumbra / shadow.radius / blurSamples / shadow.bias` 使用 effective params。
- `src/scene/LightVisual.tsx` 或 `LightRig.tsx`：v0.6a 可以暂时只把柔光面尺寸随 effective softness 变化；完整附件视觉放 v0.6b。
- `src/scene/lighting.ts`：colored bounce 计算应乘 `effective.spillMultiplier`，蜂巢的彩色溢光要明显减少。
- `src/ui/light-panel/LightModifierSection.tsx`：显示附件选择和有效光质摘要；`src/ui/light-panel/LightPanel.tsx` 只负责组合 section。

## 5. UI 规格

`LightPanel` 的“基础”区，在“器械”下方增加“附件”：

```txt
附件
[无附件                  v]
```

选项：

- 无附件
- 中号柔光箱
- 蜂巢
- 标准反光罩
- 柔光布

辅助文案：

```txt
附件只改变有效光质，原始亮度、光束角和柔硬仍可手动微调。
```

选中附件后显示一枚小标签：

- 中号柔光箱：`柔化`
- 蜂巢：`控光`
- 标准反光罩：`集中`
- 柔光布：`扩散`

Header 副标题建议：

- 无器械无附件：`柔光 · 灯光参数`
- 有器械无附件：`Nanlux Evoke 600C · 灯光参数`
- 有器械有附件：`Nanlux Evoke 600C · 中号柔光箱`
- 无器械有附件：`柔光 · 中号柔光箱`

在“光束 / 柔硬”区顶部增加一行只读摘要：

```txt
有效光质：亮度 1.58 · 光束 63° · 柔硬 0.96
```

说明：

- 滑杆仍显示原始参数。
- 摘要显示附件后的有效结果。
- 这能避免用户疑惑“我明明亮度是 1.8，为什么画面暗了”。

## 6. Store / 保存 / A-B

`LightConfig.modifierId` 可选，所以旧方案不需要迁移即可工作。

仍建议在 `sceneMigration.ts` 做轻量兜底：

- 如果旧 light 没有 `modifierId`：保持 undefined。
- 如果 `modifierId` 是未知字符串：可保留但渲染 fallback 到无附件；或在 migration 中清掉。v0.6a 建议渲染 fallback，不主动删用户数据。

Store 可选实现：

```ts
applyLightModifier(lightId: string, modifierId: string | undefined): void
```

行为：

- `undefined` / empty：只清 `modifierId`，不改其他参数。
- 未知 id：no-op。
- 已知 id：只写 `modifierId`，不改原始 `intensity / beamAngle / softness / distance`。

`updateLight` 也可以完成这件事，但独立 action 更清楚，便于验收。

## 7. v0.6a 写入范围

Claude Code 主实现建议：

- `src/types.ts`（Codex 已加 `modifierId?: string`）
- `src/data/lightModifiers.ts`（Codex 已新增）
- `src/domain/lightModifiers.ts`（Codex 已新增）
- `src/state/storeTypes.ts`
- `src/state/actions/lightActions.ts`
- `src/ui/light-panel/LightModifierSection.tsx`（新增）
- `src/ui/light-panel/LightPanel.tsx`（只负责组合新增 section）
- `src/ui/LightPanel.tsx` 是兼容导出壳，不放实现逻辑
- `src/scene/LightRig.tsx`
- `src/scene/lighting.ts`
- `src/domain/sceneMigration.ts`（如需）
- `src/domain/sceneDiff.ts`（如需 A/B 摘要提示附件变化）

不应该触碰：

- `src/data/fixturePresets.ts` 的 v0.5.0 灯具数值。
- `MAX_LIGHTS`。
- v0.4 人物姿态。
- v0.4c 摄影机控制。
- v0.5.1 cyclorama / LightVisual 主体逻辑，除非只是读取 effective softness。

## 8. Hermes / 候补 agent 边界

Hermes 可以做：

- 在被明确指定时复核 `src/data/lightModifiers.ts` 或 `src/domain/lightModifiers.ts` 是否逐字符合本规格。
- 在被明确指定时补很小的 clamp 测试样例。
- 只补 `HERMES.md` 交接记录。

Hermes 不可以做：

- 自己修改 `LightPanel` + `LightRig` + store 并宣称 v0.6a 完成。
- 重新起草已经由 Codex 写好的 `src/data/lightModifiers.ts` / `src/domain/lightModifiers.ts`，除非用户/Codex/Claude 明确要求修某个具体问题。
- 改 v0.5.0 fixture 数值。
- 改 v0.5.1 渲染公式。
- 发明新的附件值、UI 文案或验收标准。
- 把 v0.6b/c/d 的棚内 gear、近似光学、A/B 收口一起做掉，或重新引入单独「旗板」。

## 9. v0.6a 验收清单

基础：

1. Key Light 选择“中号柔光箱”，画面明显更软，亮度略降，光束更宽。
2. 同一盏灯选择“蜂巢”，背景/地面溢光明显减少，光束更窄。
3. 选择“标准反光罩”，亮度略升，光更集中、更硬。
4. 选择“柔光布”，画面明显更暗、稍微更软，但不要像中号柔光箱那样明显变宽。
5. 清空附件后，原始灯光参数不被重置，画面回到无附件效果。

UI：

6. 灯光面板能看到“附件”选择和有效光质摘要。
7. Header 副标题能读出器械 + 附件组合。
8. 手动改亮度/光束/柔硬后，附件仍然保留，并重新计算有效光质。

A/B / 保存：

9. A/B 能比较同一盏灯有无附件。
10. 保存方案、刷新、加载后，附件选择不丢。
11. 复制灯光时附件跟随复制。
12. 删除附件预设或遇到未知 id 时不崩溃。

回归：

13. v0.5.0 灯具预设选择仍正常。
14. v0.5.1 灯体可点击/拖拽不回退。
15. `lint` / `build` 通过。

## 10. Codex 对 Claude 限额的建议

如果 Claude Code 暂时限额：

- Codex 可以先完成规格、文档同步、附件数值、UI 文案、验收标准。
- Codex 也可以接小范围代码：`lightModifiers.ts` 数据表、纯 helper、文档、开源前结构拆分，以及不牵动 store 的展示草稿。
- 主集成建议等 Claude 恢复，尤其是 store/action、LightRig effective params、A/B diff 和保存加载回归。这些点牵动主干，Claude 做最终审核更稳。

如果用户希望马上推进，推荐顺序：

1. Codex 已先写 `src/data/lightModifiers.ts` + `src/domain/lightModifiers.ts` 草稿，并在 `LightConfig` 加 `modifierId?: string`。
2. Codex 已完成 `AppShell`、`LightPanel`、`ObjectList` 的开源前拆分；v0.6a UI 已落到 `src/ui/light-panel/LightModifierSection.tsx`。
3. Claude 已完成 store/UI/scene 主集成；v0.6a/b 只处理明确的验收 bug。
4. v0.6d 已通过用户真机视觉验收；后续已按 `V0_6E_CLOSEOUT_SPEC.md` 完成 v0.6e 收口，并已完成 v0.7 / v0.7.1。
