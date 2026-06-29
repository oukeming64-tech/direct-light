# v0.9 自定义灯具（导入 / 导出）规格

状态：✅ v0.9 全线完成，用户视觉验收通过（2026-06-23）；TopBar 升到 `v0.9.0`。v0.9 = 用户自定义灯具器械的导入 / 导出。Codex 把产品拆分定为 a/b/c/d 四步，并指定 **Claude 主导**（涉及大量校验与计算函数）。本文件是 v0.9 的唯一规格来源，下分四个里程碑；v0.9a 详写、b/c/d 勾勒，落地时各自再细化。创建：2026-06-22。Owner：Claude Code。

## 0. 与 v0.5 的关系（不要重做）

v0.5 已经做了「内置器械预设库」：`FixturePreset` 类型 + `FIXTURE_PRESETS`（8 个内置）+ `LightConfig.fixturePresetId?`（软标记，不锁参数）+ `applyFixturePreset`（把 `directLightDefaults` 种进灯）+ `LightBaseSection` 的「器械」下拉。

v0.9 不改这套机制，只是在它旁边加一份 **用户态器械列表**：

- 自定义器械和内置器械 **同形**（`CustomFixturePreset extends FixturePreset`），所以能进同一个下拉、走同一个 `applyFixturePreset`。
- 自定义器械单独存一个 localStorage key，能导入 / 导出 JSON 文件，也能「把当前调好的灯一键存成器械」。
- `fixturePresetId` 本来就是软标记：即便某个自定义器械被删了，引用它的旧方案也只是丢失「起点标记」，参数照常渲染，不会崩。**天然兼容**，迁移层只需兜底。

## 0.1 录入方式与字段范围（已与用户敲定 2026-06-22）

- **录入方式：导入导出 + 存当前灯。** 既支持导入外部 JSON 文件，也支持把当前灯一键存成自定义器械；导出可作为手写模板。
- **字段范围：对齐内置完整字段。** 自定义器械和内置 `FixturePreset` 同形（品牌 / 型号 / 类别 / 色彩引擎 / 功率 / 原生参数 + `directLightDefaults`），保证下拉、能力标签、A/B 行为完全一致。

## 1. 里程碑拆分

| 里程碑 | 范围 | 主写 |
| --- | --- | --- |
| **v0.9a** | JSON schema + 数据结构 + 单条器械的纯校验 / 归一 / 构造函数（本文件 §3–§6） | Claude |
| **v0.9b** | pack 级导入 / 导出 / 聚合校验 / 用户可读错误文案（不接复杂 UI） | OpenRouter 起草 + Claude 审核 |
| **v0.9c（✅ 已完成，用户验收通过 2026-06-23）** | 接器械下拉（合并内置 + 自定义、分组 / 徽标）、store slice、本地持久化、「存当前灯为器械」入口、导入 / 导出按钮 | Claude |
| **v0.9d（✅ 已完成，用户验收通过 2026-06-23）** | 保存方案 / A-B / 复制灯携带不丢（读代码确认，零改动）、迁移兜底、TopBar `v0.9.0`、全套同步文档、用户验收 | Claude |

**a / b 边界**：v0.9a 负责「单条器械的数据结构和它的纯归一函数」——即把 schema 变成可执行的校验 / 钳制 / 补默认。v0.9b 负责「文件级」——`JSON.parse`、envelope 校验、遍历多条、去重、聚合 `errors/warnings`、序列化导出、把 errors/warnings 变成给用户看的文案与流程。

## 2. 写入范围（v0.9a）

允许改：

- `src/types.ts`：把 `FixturePreset` 类型上移到此（单一真源），新增 `FixtureSource` / `CustomFixturePreset` / `CustomFixturePack`。
- `src/data/fixturePresets.ts`：改为从 `../types` 导入并 re-export `FixturePreset`（保持现有 `import { ..., type FixturePreset } from '../../data/fixturePresets'` 调用不破）。
- `src/domain/customFixtures.ts`：**新增**，v0.9a 的纯函数全部放这里。
- `V0_9_CUSTOM_FIXTURE_SPEC.md`（本文件）、`COLLABORATION.md`（版本日志追加 v0.9a 一行）。

v0.9a **不要**改：store、UI 组件、localStorage、`applyFixturePreset`、渲染算法、A/B。那些是 v0.9b–d。

## 3. 数据结构

### 3.1 `FixturePreset` 上移 + `source`

把现有 `FixturePreset` 类型从 `src/data/fixturePresets.ts` 移到 `src/types.ts`（其它 fixture 枚举已在此），并加一个可选 `source`：

```ts
export type FixtureSource = 'builtin' | 'custom'

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
  // v0.9: 'builtin'（或 undefined）表示内置库；'custom' 表示用户自定义。
  source?: FixtureSource
}
```

`FIXTURE_PRESETS` 数据不变（内置项不必显式写 `source`，视为 `'builtin'`）。

### 3.2 `CustomFixturePreset`

```ts
// 用户自定义器械：与内置同形（可直接进下拉 + applyFixturePreset），
// 另带必有的来源 / 身份元数据。
export type CustomFixturePreset = FixturePreset & {
  source: 'custom'
  createdAt: number
  updatedAt: number
}
```

### 3.3 导入 / 导出 envelope（pack）

一个「pack」装 1..N 条器械，单条导出与整库导出共用同一文件形态：

```ts
export type CustomFixturePack = {
  schema: 'direct-light/custom-fixtures'
  version: number // 当前 = 1
  exportedAt?: number
  fixtures: CustomFixturePreset[]
}
```

文件示例：

```json
{
  "schema": "direct-light/custom-fixtures",
  "version": 1,
  "exportedAt": 1718000000000,
  "fixtures": [
    {
      "id": "custom-my-key",
      "label": "我的主灯 600",
      "brand": "Aputure", "model": "LS 600x",
      "category": "cob", "colorEngine": "bi-color", "powerClass": "large",
      "supportsColor": false,
      "recommendedUses": ["key", "fill"],
      "defaultModifiers": [],
      "directLightDefaults": {
        "type": "hard", "intensity": 2.1, "beamAngle": 45,
        "softness": 0.14, "distance": 9, "color": "#ffffff", "colorTemperature": 5600
      },
      "notes": "",
      "source": "custom", "createdAt": 1718000000000, "updatedAt": 1718000000000
    }
  ]
}
```

## 4. 校验与钳制规则（v0.9a 的核心计算）

`directLightDefaults` 的数值钳制区间 = 现有 UI 滑杆区间，保证两件事同时成立：① 8 个内置预设全部无警告通过；② 自定义被「种进灯」后每个值都能继续用滑杆调。

| 字段 | 区间 | 说明 |
| --- | --- | --- |
| `type` | `hard \| soft \| panel` | 非法 → 回退 `soft` + 警告 |
| `intensity` | `[0, 3]` | 亮度滑杆 |
| `beamAngle` | `[10, 80]` | 光束角滑杆 |
| `softness` | `[0, 1]` | 柔硬滑杆 |
| `distance` | `[1.5, 12]` | 距离滑杆 |
| `colorTemperature` | `[3000, 6800]`，可空 | 色温微调滑杆；空 = 走自定义颜色 |
| `color` | `#RGB / #RRGGBB` | 归一为小写 `#rrggbb`；非法 → `#ffffff` + 警告 |

错误（`errors`，导致该条器械被拒）：

- 输入不是对象。
- 缺 `label`（去空格后为空）。
- 缺 `directLightDefaults` 或它不是对象。

警告（`warnings`，仍归一并保留该条）：

- 枚举非法被回退（`type / category / colorEngine / powerClass`）。
- 数值越界被钳制。
- `color` 非法被回退。
- 可选字段类型不对被忽略。

枚举回退默认值：`category→cob`、`colorEngine→daylight`、`powerClass→medium`。`supportsColor` 缺省时按 `colorEngine` 推断（`rgb/rgbww/rgbacl/nebula-c8` → true，其余 → false）。

ID 规则：自定义器械 id 一律 `custom-` 前缀，且不得与内置 id 冲突。归一时：输入 id 是合法字符串且不撞内置 → 沿用（缺前缀则补 `custom-`）；否则用调用方给的 `fallbackId`。**同一 pack 内多条之间的去重放在 v0.9b**（pack 级才有全集）。

## 5. v0.9a 纯函数清单（`src/domain/customFixtures.ts`）

全部纯函数，不依赖 React / store / localStorage / `Date.now()`（时间戳由调用方传入 `now`）。

```ts
// 常量
export const CUSTOM_FIXTURE_SCHEMA = 'direct-light/custom-fixtures'
export const CUSTOM_FIXTURE_SCHEMA_VERSION = 1
export const CUSTOM_FIXTURE_RANGES = { intensity:[0,3], beamAngle:[10,80], softness:[0,1], distance:[1.5,12], colorTemperature:[3000,6800] } as const

// 类型守卫 / 合并 / 查找
export function isCustomFixture(f: FixturePreset): f is CustomFixturePreset
export function getAllFixtures(custom: CustomFixturePreset[]): FixturePreset[]   // [...FIXTURE_PRESETS, ...custom]
export function findFixtureById(id: string | undefined, custom: CustomFixturePreset[]): FixturePreset | undefined
export function isReservedFixtureId(id: string): boolean                          // 撞内置 id

// 单条归一 / 校验（schema 的可执行形态）
export type NormalizeFixtureResult = { fixture?: CustomFixturePreset; errors: string[]; warnings: string[] }
export function normalizeCustomFixture(input: unknown, opts: { fallbackId: string; now: number }): NormalizeFixtureResult

// 「存当前灯为器械」
export function buildCustomFixtureFromLight(
  light: LightConfig,
  opts: { name: string; id: string; now: number; baseFixture?: FixturePreset },
): CustomFixturePreset
```

`getAllFixtures` 的顺序固定为「内置在前、自定义在后」，下拉据此分组。

## 6. v0.9a 验收

- `npx tsc -b`、`npm run lint`、`npm run build` 全绿。
- 确定性自测覆盖：内置预设全部无警告通过 normalize；缺 label / 非对象 → errors；越界数值被钳制 + 警告；非法枚举回退 + 警告；非法颜色回退；id 撞内置被改写；`buildCustomFixtureFromLight` 把灯参数原样映射并钳制；round-trip（normalize 自己的输出）稳定。
- 不引入新依赖，不改 store / UI / 渲染。

## 7. 后续里程碑要点（占位，落地时细化）

- **v0.9b（✅ 已完成）**：`src/domain/customFixturePack.ts` —— `parseCustomFixturePack(text, {now, takenIds?}): { fixtures; errors; warnings }`（容信封/裸数组/单器械三态 + 遍历 `normalizeCustomFixture` + `第 N 条：` 前缀 + pack 内/对 `takenIds` 的 id 去重 + 聚合，永不抛）；`serializeCustomFixturePack(fixtures, {now}): string`（2 空格美化 pack JSON）。`tsc·lint·build` 绿、确定性自测 19/0。
- **v0.9c（✅ 已完成，用户验收通过 2026-06-23）**：store 加 `customFixtures` slice（`src/lib/storage.ts` 的 `loadCustomFixtures`/`saveCustomFixtures` + `direct-light.customFixtures.v1`）；`src/state/actions/fixtureActions.ts` 加 `saveCurrentLightAsFixture`/`removeCustomFixture`/`importCustomFixtures`/`exportCustomFixtures`；`applyFixturePreset` 改走 `findFixtureById`；`LightBaseSection` 下拉拆「内置器械 / 我的器械」optgroup + 「自定义」徽标；`LightFixtureActions.tsx`（存当前灯为器械 / 导入 / 导出 / 删除）。`tsc·lint·build` 绿；纯逻辑沿用 v0.9a/b 单测。
- **v0.9d（✅ 已完成，用户验收通过 2026-06-23）**：保存方案 / A-B / 复制灯携带 `fixturePresetId` 不丢的验证；旧方案引用已删自定义器械的兜底（`findFixtureById`→undefined 自动回退，`sceneMigration` 现状已兼容，Codex 复核补齐下拉 value 兜底）；TopBar 版本号；全套同步文档；用户验收。
