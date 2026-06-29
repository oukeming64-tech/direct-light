# Direct Light v0.8 多光源 / 多灯管理规格

状态：**v0.8a/b/c 已落地并通过用户视觉验收**（2026-06-22）。本规格由 Codex 根据用户决策整理：v0.8 先做更多光源 / 多灯管理；v0.9 再做自定义灯具预设导入/导出；多语言 UI 后置到核心功能和字段更稳定后。

父级路线：`ROADMAP.md §9`。立项基线：v0.7.1 已发布，默认 Key / Fill / Rim 三盏灯，`MAX_LIGHTS = 3`；v0.8 落地后默认场景仍是三盏灯，但上限提高到 6。

## 1. 核心判断

v0.8 的目标不是把 Direct Light 变成复杂灯光控制台，而是让导演在仍然简单的界面里多放几盏灯。

本轮原则：

- 默认场景不变：打开仍是 Key / Fill / Rim 三盏灯。
- 灯光上限先从 3 提到 6；不要一次提到 8。
- 新增的是“可添加灯位数量”，不是新增灯具型号或新渲染系统。
- 不新增第二套 light store，不新增灯组 store，不把 UI 文案塞进场景数据。
- 不为了多灯先做多语言；场景数据只存语义 ID、用户命名和值。
- 保持应用快：不加新依赖、不加后处理、不加物理光度文件、不默认打开 6 盏灯。

## 2. 版本拆分

### v0.8a - 上限与新增灯闭环

目标：可以稳定添加到 6 盏灯，默认场景仍保持 3 盏。

范围：

- `MAX_LIGHTS: 3 -> 6`。
- `buildDefaultLights()` 仍只返回 Key / Fill / Rim 三盏。
- `addLight()` 继续复用现有 store action，不改函数签名。
- 新增灯默认仍为 `type: 'soft'`、5600K 白光、无 `fixturePresetId`、无 `modifierId`。
- 第 4-6 盏灯使用简单确定性的起始位置，避免全部叠在同一点。
- 复制灯仍沿用当前行为：复制原灯参数，位置轻微偏移。
- 满 6 后添加按钮显示“满 6”，复制按钮禁用。

建议新增灯位：

```ts
// 可放在 src/data/rendering.ts，作为默认灯位规格值。
export const ADDITIONAL_LIGHT_STARTS = [
  { x: 0, y: 3.0, z: 3.2 },
  { x: 3.4, y: 2.2, z: -1.8 },
  { x: -3.4, y: 2.2, z: -1.8 },
] as const
```

使用方式：

- 第 4 盏用第 1 个位置。
- 第 5 盏用第 2 个位置。
- 第 6 盏用第 3 个位置。
- 如果未来允许删灯后再添加，按当前 `lights.length - 3` 取 slot 即可，保持简单。
- 目标点仍对准当前第一个人物胸口；没有人物时回退 `PERSON_TARGET`。

验收：

- 从默认场景连续点添加，可到 6 盏。
- 第 4-6 盏不会重叠在同一位置。
- 第 4-6 盏均可选中、拖拽、调高度、改颜色、挂灯具预设、挂附件。
- 删除当前选中灯后，选择状态按现有规则回到第一盏可用灯或空。
- 旧保存方案仍能打开。

### v0.8b - 多灯列表可读性

目标：6 盏灯时左侧列表仍然能扫读，且不撑大壳文件。

范围：

- 优先改 `src/ui/object-list/LightsSection.tsx`。
- 如果文件明显变胖，抽 `src/ui/object-list/LightRow.tsx`；不要把实现塞回 `src/ui/ObjectList.tsx`。
- 列表顶部显示数量，例如 `灯光 4/6` 或在右侧保留“满 6”状态。
- 单行继续保持紧凑：开关圆点、灯名、类型、复制、删除。
- 名称编辑继续放在右侧 `LightBaseSection`，本轮不做左侧 inline rename。
- 不做折叠分组、不做灯组、不做 solo、不做拖拽排序；这些都容易引入额外状态，后续用户真的需要再开小版本。

验收：

- 6 盏灯时左侧列表不遮挡其它组，不出现明显文字重叠。
- 选中态、启用态、禁用态、复制禁用态清楚。
- 灯名很长时继续 `truncate`，不撑开布局。
- `LightsSection.tsx` 不应变成新的胖文件；如果超过约 130 行，应抽行组件。

### v0.8c - A/B、保存、导出与性能收口

目标：多灯不是只能添加，而是能走完整工作流。

范围：

- `sceneDiff.diffLights` 继续承担灯光差异摘要。
- A/B 中添加、删除、启用/停用、改位置、改颜色、改附件，都应让“灯光”类别高亮。
- `summarizeLighting(scene)` 应自然显示 `6 灯`；不需要为 v0.8 写复杂多灯摘要。
- 保存 / 加载 / 复制方案天然携带 `scene.lights`，只做回归，不新增数据格式。
- 导出截图能渲染 6 灯场景。
- 若 6 盏 enabled + shadow 在本机明显拖慢，允许做**渲染时派生**的阴影预算，但不得写入 `SceneConfig`。

性能保护规则：

- 首选：保留现有 `LightRig` 的 `lights.map` 简单渲染，先实测 6 盏灯。
- 不加 postprocessing，不加真实 RectAreaLight 照明，不重写渲染管线。
- 如必须加预算，只能做运行时派生，例如“选中灯 + 强度最高的若干盏 castShadow，其它灯只照明不投影”；不要给灯新增持久化 `castsShadow` 字段。
- 如果需要纯 helper，优先放在 `src/domain/lightRenderBudget.ts`；如果逻辑少于 30 行，可以留在 `LightRig.tsx` 附近。

验收：

- 6 盏灯全部开启时，画面不黑屏，console 无新增 error。
- 6 盏灯 + 3 个人 + 若干道具 + 黑旗/反光板/柔光布框时仍能操作。
- A/B 冻结后，A 改多灯组合，B 不跟随。
- 保存 / 加载 / 复制方案不丢 6 灯状态。
- 导出 PNG 成功，灯光视觉和阴影没有明显缺失。
- `npx tsc -b`、`npm run lint`、`npm run build` 全绿。

## 3. 不做什么

v0.8 不做：

- 新增内置灯具型号或品牌预设。
- 自定义灯具 JSON 导入/导出（这是 v0.9）。
- IES / LDT / DMX / 厂商光度文件。
- 多语言 UI。
- 灯组、折叠组、solo、拖拽排序、时间轴。
- 云端同步、协作、评论。
- 默认 6 灯场景。
- 第二套灯光状态或第二个 gear/light store。

## 4. 写入范围建议

### 必改

- `src/data/defaults.ts`
  - `MAX_LIGHTS = 6`。

- `src/data/rendering.ts`
  - 增加第 4-6 盏新增灯的起始位置常量，或等价的简单数据。

- `src/state/actions/lightActions.ts`
  - `addLight()` 使用新增灯位，不改 action 签名。
  - 不改 `updateLight` / `duplicateLight` / `removeLight` 的公共接口。

- `src/ui/object-list/LightsSection.tsx`
  - 更新数量显示和 6 灯列表可读性。
  - 文件变胖时抽 `LightRow.tsx`。

### 可能改

- `src/domain/sceneDiff.ts`
  - 只在现有摘要不够表达 v0.8 验收时小修。不要做完整逐字段 diff。

- `src/domain/lightingSummary.ts`
  - 如果摘要在 6 灯时读起来不清楚，只做短文案微调。

- `src/scene/LightRig.tsx`
  - 只有性能实测需要时，才加入运行时阴影预算。

- `ARCHITECTURE.md`
  - 若抽出 `LightRow.tsx` 或新增 `lightRenderBudget.ts`，同步模块边界说明。

- `COLLABORATION.md` / `ROADMAP.md` / `CLAUDE.md` / `HERMES.md` / `AGENTS.md`
  - 完成 v0.8a/b/c 任一切片后必须同步状态。

## 5. 数据兼容

- `LightConfig` 不新增必填字段。
- 旧方案里 1-3 盏灯继续合法。
- 新方案里 4-6 盏灯只是 `SceneConfig.lights` 数组更长。
- `sceneMigration` 不需要因为 `MAX_LIGHTS` 变大而改；只有新增持久化可选字段时才需要迁移。
- 保存方案、A/B 快照、导出图都继续读取 `SceneConfig.lights`。

## 6. UI 文案

继续使用简体中文，不抽 i18n。

- 添加按钮 tooltip：`添加灯`
- 满额提示：`满 6`
- 左侧分组标题可选：`灯光 3/6`
- 新增灯默认名：继续 `Light 4` / `Light 5` / `Light 6`，不强行翻译成“补光/背景光”，避免自动命名误导用户。

## 7. 验收清单

### 确定性检查

1. 默认打开仍是 3 盏灯。
2. 连续添加到 6 盏，超过 6 不再添加。
3. 复制到 6 盏后复制按钮禁用。
4. 删除任一灯后可继续添加回 6 盏。
5. 第 4-6 盏位置不重叠。
6. 第 4-6 盏可套用已有灯具预设和附件。
7. 旧方案 / 旧 A/B 快照不崩。

### 浏览器烟测

1. 默认场景打开，canvas 非空。
2. 添加到 6 盏，切换镜头 / 自由 / 俯视 / 侧视不黑屏。
3. 6 盏全开，调亮度 / 色温 / 颜色 / 柔硬有实时反馈。
4. 加 3 件控光器材后，灯光和 gear 光学仍可运行。
5. A/B 冻结后改灯，B 不跟随，差异摘要高亮“灯光”。
6. 保存 / 加载 / 复制方案后，6 灯不丢。
7. 导出 PNG 成功。

### 工程检查

1. `npx tsc -b`
2. `npm run lint`
3. `npm run build`
4. `git diff --check`
5. 搜索旧状态：`v0.8 多语言`、`v0.9 更多光源`、`MAX_LIGHTS = 3` 的当前限制文案是否仍误导。

## 8. 可拆给外部草稿者的小任务

先分清两条完全不同的路径：

- **Hermes**：独立 agent。Codex / Claude Code 不能把它当成内置 subagent 调用；需要写明确 handoff 文档，由用户转交。Hermes 只按 handoff 的精确写入范围起草，不拥有 v0.8，不宣布完成。
- **OpenRouter subagent**：Claude Code 调用的代码草稿 subagent（例如 `z-ai/glm-5.2`、`qwen3.7-max`、`qwen3-coder`）。它不是 Hermes。Claude Code 负责写清楚子任务、接收草稿、逐行审核、集成和验证。

适合 Claude Code 调用 OpenRouter subagent 起草的小任务：

- v0.8a：只改 `MAX_LIGHTS`、新增灯位常量、`addLight()` 起始位置。
- v0.8b：只抽 `LightRow.tsx` 并保持 `LightsSection` 行为不变。
- v0.8c：只补确定性测试脚本或手动检查清单，不改产品逻辑。

适合 Hermes 单独起草的小任务：

- 仅当用户明确要用 Hermes 时，给它一份独立 handoff。
- handoff 必须写清楚唯一任务、允许编辑的文件、禁止事项、验证命令和报告格式。
- 可选任务同上，但 Hermes 的产物必须由 Claude Code / Codex 再审核集成。

不适合交给任何草稿者直接拍板的大任务：

- 性能预算策略的产品判断。
- 是否让部分灯不投影。
- 修改渲染公式、gear 光学、附件数值。
- 改 v0.9 自定义预设或多语言。

## 9. 完成定义

v0.8 只有在以下条件都满足时才算完成：

- v0.8a/b/c 范围均落地。
- 用户视觉确认 6 灯场景没有明显卡顿或混乱。
- `tsc` / `lint` / `build` 通过。
- `README.md` / `README.en.md` / `CONTRIBUTING.md` 中 `MAX_LIGHTS` 限制更新到 6。
- `COLLABORATION.md` / `ROADMAP.md` / `CLAUDE.md` / `HERMES.md` / `AGENTS.md` 不再把 v0.8 写成待做。
- `TopBar`、`package.json`、Tauri 版本是否升到 `0.8.0` 由发布动作决定；若只做本地开发，可先不发 tag。

完成记录（2026-06-22）：

- v0.8a/b 已由 Claude Code 集成，机械草稿来自 Claude Code 调用 OpenRouter glm-5.2。
- Codex 复核源码、A/B/保存/导出路径、旧三灯限制搜索和本地预览 6 灯烟测，未发现阻塞问题。
- 用户视觉验收通过：6 灯全开不黑屏、列表可扫读、可进入 v0.9。
- 同轮交互修复（人物拖不出白棚、自由视角横扫左右转 / 纵向滚动缩放）也已通过用户手感确认。
