# v0.5 灯具器械预设库规格

状态：✅ v0.5.0 已通过用户真机验收（2026-06-20）。`fixturePresets.ts` 8 预设由 Hermes 逐字起草、Claude 审核；fixture 类型 / `LightConfig.fixturePresetId` / `applyFixturePreset`(lightActions) / `LightPanel` 器械下拉与能力标签由 Claude/Codex 集成复核。`tsc·lint·build` 全绿、确定性自测通过，用户已确认 §10 产品验收可用。下方为原规格（Codex 定稿）。Owner：Claude Code 集成。创建/定稿：2026-06-20。

## 1. 目标

v0.5 的目标不是做官方光度曲线数据库，而是让导演和摄影师在白棚里用真实拍摄语言沟通：

- “这盏像大功率 COB 主光。”
- “这盏是全彩效果光。”
- “这盏像 LED 面板，天生更软。”
- “这盏用 Nanlux Evoke 600C 作为参考。”

一句话目标：

- 灯具预设负责“这是什么灯”。
- 当前灯光参数仍负责“怎么摆、打多亮、软硬多少”。
- 选择灯具后要让画面立刻有合理变化，但仍允许用户继续手动微调。

## 1.1 分工边界

Codex 负责：

- 灯具产品语言。
- 首批预设名单和 Direct Light 内部映射数值。
- UI 文案和验收标准。
- 判断画面变化是否符合摄影直觉。

Claude Code 负责：

- 最终数据结构和类型落地。
- `fixturePresets.ts` 集成。
- `applyFixturePreset` 集成。
- `LightPanel` 接线。
- 旧方案兼容、A/B、保存/加载验证。
- `lint/build` 和最终交接文档。

Hermes 只允许做：

- 在 Claude/Codex 明确指定时，起草 `src/data/fixturePresets.ts`。
- 在 Claude/Codex 明确指定时，起草 `LightPanel` 的“器械”下拉小段。
- 按本文件给定字段和文案机械实现，不新增预设，不改数值。

Hermes 不允许做：

- 独立完成整个 v0.5。
- 自己增加或删减灯具预设。
- 自己改 Evoke 600C 参数。
- 改灯光渲染算法。
- 改 A/B 主交互。
- 改附件系统或提前实现 v0.6。
- 把未经过 Claude/Codex 审核的草稿标成完成。

## 2. 与 v0.6 控光附件的边界

v0.5 做灯具本体：

- COB / panel / tube / fresnel / practical 等器械语义。
- 默认亮度、柔硬、光束角、色彩能力。
- 常见用途：主光、补光、轮廓光、背景光、效果光。

v0.6 再做附件：

- 柔光箱、灯笼、蜂巢、标准反光罩、菲涅尔、投影筒、旗板、反光板。
- 附件改变同一盏灯的柔硬、光束、溢光、遮挡或反射。

所以 v0.5 不要把“加柔光箱”做成一盏新灯。第一版可以给 `defaultModifiers`，但不实现附件系统。

## 2.1 与多灯数量的边界

当前 Direct Light 已支持多灯，但上限是 3 盏：

- 默认三灯：Key / Fill / Rim。
- 左侧灯光列表支持添加、复制、删除。
- `MAX_LIGHTS = 3`，满 3 后显示“满 3”。

v0.5 灯具库不负责提高灯光数量上限。原因是这轮重点是“每盏灯是什么器械”，不是“如何管理更多灯”。如果要提高到 6 或 8 盏，应单独开 v0.5.x 小任务，先补灯光列表体验和性能验收。

## 3. 数据结构

在 `src/types.ts` 增加：

```ts
export type FixtureCategory = 'cob' | 'panel' | 'tube' | 'fresnel' | 'practical' | 'effect'

export type FixtureColorEngine =
  | 'daylight'
  | 'tungsten'
  | 'bi-color'
  | 'rgb'
  | 'rgbww'
  | 'rgbacl'
  | 'nebula-c8'

export type FixturePowerClass = 'small' | 'medium' | 'large' | 'very-large'

export type FixtureUse = 'key' | 'fill' | 'rim' | 'background' | 'effect'
```

给 `LightConfig` 增加一个可选字段：

```ts
fixturePresetId?: string
```

兼容要求：

- 旧方案没有 `fixturePresetId` 时保持 `undefined`，不需要迁移成默认值。
- 保存方案、A/B、导出图自然带上这个字段。
- 用户手动改亮度、柔硬、颜色、位置时不清空 `fixturePresetId`。它表示“这盏灯以哪个器械为起点”，不是锁死参数。

## 4. 预设模块

新增 `src/data/fixturePresets.ts`。

建议类型：

```ts
import type { FixtureCategory, FixtureColorEngine, FixturePowerClass, FixtureUse, LightType } from '../types'

export type FixturePreset = {
  id: string
  label: string
  brand: string
  model: string
  category: FixtureCategory
  colorEngine: FixtureColorEngine
  powerClass: FixturePowerClass
  supportsColor: boolean
  nativeCctRange?: [number, number]
  nativeBeamAngle?: number
  officialPowerW?: number
  recommendedUses: FixtureUse[]
  defaultModifiers: string[]
  directLightDefaults: {
    type: LightType
    intensity: number
    beamAngle: number
    softness: number
    distance: number
    color: string
    colorTemperature?: number
  }
  notes: string
  sourceUrl?: string
  sourceCheckedAt?: string
}
```

说明：

- `native*` 字段记录现实器械资料。
- `directLightDefaults` 才是写入当前 app 的实际参数。
- 第一版不需要 CRI/TLCI/TM-30 参与渲染，只放进 `notes`。

## 5. 首批预设

第一版做 8 个，覆盖导演沟通常见语义。

### 5.1 通用 600W COB 白光

```ts
{
  id: 'generic-cob-600d',
  label: '600W COB 白光',
  brand: 'Generic',
  model: '600D',
  category: 'cob',
  colorEngine: 'daylight',
  powerClass: 'large',
  supportsColor: false,
  nativeCctRange: [5600, 5600],
  nativeBeamAngle: 55,
  officialPowerW: 600,
  recommendedUses: ['key', 'rim', 'background'],
  defaultModifiers: ['standard-reflector'],
  directLightDefaults: {
    type: 'hard',
    intensity: 2.2,
    beamAngle: 45,
    softness: 0.12,
    distance: 9,
    color: '#ffffff',
    colorTemperature: 5600,
  },
  notes: '大功率白光 COB 语义预设。适合主光、逆光、背景打亮；裸灯偏硬。'
}
```

### 5.2 通用 600W COB 双色温

```ts
{
  id: 'generic-cob-600b',
  label: '600W COB 双色温',
  brand: 'Generic',
  model: '600B',
  category: 'cob',
  colorEngine: 'bi-color',
  powerClass: 'large',
  supportsColor: false,
  nativeCctRange: [2700, 6500],
  nativeBeamAngle: 55,
  officialPowerW: 600,
  recommendedUses: ['key', 'fill', 'background'],
  defaultModifiers: ['standard-reflector'],
  directLightDefaults: {
    type: 'hard',
    intensity: 2.0,
    beamAngle: 50,
    softness: 0.16,
    distance: 9,
    color: '#ffffff',
    colorTemperature: 5600,
  },
  notes: '双色温大功率 COB。用于日光/钨丝之间快速切换，不作为彩色效果灯。'
}
```

### 5.3 Nanlux Evoke 600C

```ts
{
  id: 'nanlux-evoke-600c',
  label: 'Nanlux Evoke 600C',
  brand: 'Nanlux',
  model: 'Evoke 600C',
  category: 'cob',
  colorEngine: 'nebula-c8',
  powerClass: 'large',
  supportsColor: true,
  nativeCctRange: [1000, 20000],
  nativeBeamAngle: 65,
  officialPowerW: 600,
  recommendedUses: ['key', 'rim', 'background', 'effect'],
  defaultModifiers: ['bare', '25-degree-reflector'],
  directLightDefaults: {
    type: 'hard',
    intensity: 2.15,
    beamAngle: 65,
    softness: 0.14,
    distance: 9,
    color: '#ffffff',
    colorTemperature: 5600,
  },
  notes: '全彩点光源参考。官方页列 Rated Power 600W、Beam Angle 65°、Nebula C8 Light Engine、CCT 1000K-20000K。ASC/B&H 资料提到 25°反光罩、IP66、±200 G/M、全彩控制。Direct Light 第一版只映射为大功率全彩 COB，不复刻光度曲线。'
}
```

### 5.4 通用 LED 面板

```ts
{
  id: 'generic-led-panel-soft',
  label: 'LED 面板柔光',
  brand: 'Generic',
  model: 'Soft Panel',
  category: 'panel',
  colorEngine: 'bi-color',
  powerClass: 'medium',
  supportsColor: false,
  nativeCctRange: [2700, 6500],
  nativeBeamAngle: 110,
  recommendedUses: ['fill', 'key'],
  defaultModifiers: ['built-in-diffusion'],
  directLightDefaults: {
    type: 'panel',
    intensity: 1.2,
    beamAngle: 80,
    softness: 0.92,
    distance: 7,
    color: '#ffffff',
    colorTemperature: 5600,
  },
  notes: '面板灯语义。默认更软、覆盖更宽，阴影边缘不应像裸 COB。'
}
```

### 5.5 通用 RGB 灯管

```ts
{
  id: 'generic-rgb-tube',
  label: 'RGB 灯管',
  brand: 'Generic',
  model: 'RGB Tube',
  category: 'tube',
  colorEngine: 'rgbww',
  powerClass: 'small',
  supportsColor: true,
  nativeCctRange: [2700, 10000],
  nativeBeamAngle: 120,
  recommendedUses: ['rim', 'background', 'effect'],
  defaultModifiers: ['bare'],
  directLightDefaults: {
    type: 'panel',
    intensity: 0.8,
    beamAngle: 80,
    softness: 0.86,
    distance: 5,
    color: '#2f6bff',
    colorTemperature: undefined,
  },
  notes: '用于彩色轮廓、背景线条或环境色。第一版仍用简化面光近似。'
}
```

### 5.6 通用菲涅尔硬光

```ts
{
  id: 'generic-fresnel-hard',
  label: '菲涅尔硬光',
  brand: 'Generic',
  model: 'Fresnel',
  category: 'fresnel',
  colorEngine: 'daylight',
  powerClass: 'medium',
  supportsColor: false,
  nativeCctRange: [5600, 5600],
  nativeBeamAngle: 25,
  recommendedUses: ['key', 'rim', 'background'],
  defaultModifiers: ['fresnel'],
  directLightDefaults: {
    type: 'hard',
    intensity: 1.9,
    beamAngle: 28,
    softness: 0.08,
    distance: 10,
    color: '#ffffff',
    colorTemperature: 5600,
  },
  notes: '更窄、更硬、更有方向感。适合切出轮廓或打背景局部。'
}
```

### 5.7 通用小型效果灯

```ts
{
  id: 'generic-small-effect-rgb',
  label: '小型 RGB 效果灯',
  brand: 'Generic',
  model: 'Mini RGB',
  category: 'effect',
  colorEngine: 'rgb',
  powerClass: 'small',
  supportsColor: true,
  nativeBeamAngle: 40,
  recommendedUses: ['effect', 'background', 'rim'],
  defaultModifiers: ['bare'],
  directLightDefaults: {
    type: 'hard',
    intensity: 0.7,
    beamAngle: 35,
    softness: 0.18,
    distance: 5,
    color: '#ff4fd8',
    colorTemperature: undefined,
  },
  notes: '小功率彩色效果点，用于背景色块、边缘色、产品小高光。'
}
```

### 5.8 通用实景灯

```ts
{
  id: 'generic-practical-warm',
  label: '暖色实景灯',
  brand: 'Generic',
  model: 'Practical Warm',
  category: 'practical',
  colorEngine: 'tungsten',
  powerClass: 'small',
  supportsColor: false,
  nativeCctRange: [2200, 3200],
  nativeBeamAngle: 180,
  recommendedUses: ['background', 'effect'],
  defaultModifiers: ['bare'],
  directLightDefaults: {
    type: 'soft',
    intensity: 0.45,
    beamAngle: 80,
    softness: 0.6,
    distance: 4,
    color: '#ffffff',
    colorTemperature: 3000,
  },
  notes: '模拟画面中出现或藏在布景里的暖色 practical。不是主力影视灯。'
}
```

## 6. UI 规格

在 `LightPanel.tsx` 的「基础」区顶部或「类型」上方增加一组：

- Section title 继续用 `基础`，不要新增大段说明。
- Field label：`器械`
- 下拉默认项：`自定义参数`
- 下拉选项使用 `FixturePreset.label`。
- 辅助短文案：`选择灯具只设置默认光质，之后仍可手动微调。`
- 下拉旁或下方显示一个很短的能力标签，避免导演误会“选了灯具就锁死参数”：
  - `supportsColor: true`：`全彩`
  - `colorEngine: 'bi-color'`：`双色温`
  - `colorEngine: 'tungsten'`：`暖色`
  - 其它白光灯：`白光`

选择预设时：

1. 调用 `applyFixturePreset(lightId, fixturePresetId)`。
2. 写入 `fixturePresetId`。
3. 写入 `directLightDefaults` 到当前灯。
4. 不改变灯的位置。
5. 不改变灯的目标模式和目标人物。
6. 不改变开关状态。

Header subtitle 建议：

- 有预设：`Nanlux Evoke 600C · 灯光参数`
- 无预设：保持当前 `${LIGHT_TYPE_LABELS[light.type]} · 灯光参数`

颜色能力第一版处理：

- `supportsColor: true`：彩色 swatch 和自定义颜色照常可用。
- `supportsColor: false`：选择该灯具时把颜色重置为白光和对应色温；颜色控件暂时保留，后续再决定是否弱化。不要第一版就复杂禁用。

## 7. Store action

v0.4.8 已完成 store 轻拆。新动作放进 `src/state/actions/lightActions.ts`：

```ts
applyFixturePreset: (lightId: string, fixturePresetId: string | undefined) => void
```

行为：

- `undefined` 或空字符串表示回到 `自定义参数`，只清空 `fixturePresetId`，不改其它参数。
- 找不到 preset 时 no-op。
- 找到 preset 时只改当前灯：
  - `fixturePresetId`
  - `type`
  - `intensity`
  - `beamAngle`
  - `softness`
  - `distance`
  - `color`
  - `colorTemperature`
- 保留：
  - `id`
  - `name`
  - `enabled`
  - `position`
  - `target`
  - `targetMode`
  - `targetPersonId`

## 8. A/B 和保存

- A/B 不需要新增 diff 类别。
- 选择不同器械后，`灯光` 类别应该高亮，因为 `type/intensity/color/position/softness` 至少一项会不同。
- 后续如果用户想看“器械不同但参数一样”，再把 `fixturePresetId` 加进 `sceneDiff.diffLights`。
- 本地保存不需要特别处理，`LightConfig.fixturePresetId` 会随场景保存。
- `sceneMigration` 只要保证旧灯没有该字段也不会崩。

## 9. 写入范围

允许改：

- `src/types.ts`
- `src/data/fixturePresets.ts`（新增）
- `src/state/storeTypes.ts`
- `src/state/actions/lightActions.ts`
- `src/ui/LightPanel.tsx`
- `src/domain/sceneMigration.ts`（只做兼容兜底）
- `COLLABORATION.md`
- `CLAUDE.md`
- `HERMES.md`
- `ROADMAP.md`

不要改：

- 灯光渲染核心算法。
- 人物骨架。
- 摄影机控制。
- A/B 主交互。
- 新增依赖。

## 10. 验收清单

代码检查：

- `npm run lint`
- `npm run build`

产品验收：

1. Key Light 可以选择 `Nanlux Evoke 600C`。
2. 选中 `Nanlux Evoke 600C` 后，默认仍是白光硬 COB，但能力标签显示 `全彩`，颜色控件保持可用。
3. `600W COB 白光/双色温` 的阴影应明显偏硬，不能像面板灯一样糊成大软光。
4. 选择 `LED 面板柔光` 后，画面应比 COB 更软、更宽，阴影边缘更宽松。
5. 选择 `菲涅尔硬光` 后，画面应更窄、更硬，背景/地面光斑范围更集中。
6. 选择 `RGB 灯管` 或 `小型 RGB 效果灯` 后，默认出现彩色光；灯管应比小型效果灯更软、更铺开。
7. 选择白光/双色温/暖色灯具后，默认回到白光或对应色温，不残留上一个 RGB 颜色。
8. 选择 `自定义参数` 只清空器械选择，不重置当前亮度、位置、颜色、柔硬。
9. 选择器械后，仍能继续手动调亮度、颜色、柔硬、位置。
10. A/B 中切换器械，B 不动，差异摘要至少高亮 `灯光`。
11. 保存方案、刷新、加载后，灯具选择不丢。

## 11. 资料来源

已核对日期：2026-06-20。

- Nanlux official product page: https://www.nanlux.com/product-evoke-600c
- ASC announcement: https://theasc.com/article/nanlux-announces-evoke-150c-600c/
- B&H product page for cross-check: https://www.bhphotovideo.com/c/product/1915218-REG/nanlux_ev600ckit_evoke_600c_rgb_led.html

本规格对官方资料的使用方式：

- 记录真实型号、功率、CCT、色彩引擎、光束角、控制/附件信息。
- 不尝试复刻官方 lux 表、CRI/TLCI/TM-30 或完整 DMX 模式。
- Direct Light 内部数值优先服务“拍摄沟通可读”，不是测光替代品。
