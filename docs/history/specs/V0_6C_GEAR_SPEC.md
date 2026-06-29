# v0.6c 棚内独立控光器材规格

状态：**已落地并通过用户真机视觉验收（2026-06-21）**。本轮 Codex 无额度，用户授权 Claude 起草并集成 v0.6c。用户定稿：**去掉「旗板」**——旗板与黑旗是一回事，白旗板即反光板，故只做 **3 种**：黑旗 / 反光板（白旗板）/ 柔光布框；确认新增 `scrimWhite` 半透明白材质。v0.6a 控光附件 MVP、v0.6b 附件视觉 + 导演视角简介均已通过用户视觉验收。创建日期：2026-06-20。父规格：`V0_6_MODIFIER_SPEC.md §2`（v0.6 拆分）。

## 1. 目标

v0.6a/b 解决的是「绑在某盏灯上的附件」。v0.6c 解决另一类现场常见器材：**不挂在灯上、独立摆在棚里的控光板**——黑旗、反光板、柔光布框。

一句话目标：让导演能像摆道具一样，把遮光板/反光板/柔光布框摆进棚里、旋转、调高度，先建立空间和沟通，**这一版不做真实遮挡/反射光学**（后续已在 v0.6d 做成近似光学）。

与 v0.6b 的节奏一致：v0.6b 是「附件只做视觉、不动光学」；v0.6c 是「独立器材只做摆位/旋转/尺寸/标签，不动光学」。光学近似统一放到后续 v0.6d，避免一次改太多、验收不清；v0.6d 现已通过用户真机视觉验收。

## 2. 范围

只做 3 种棚内独立控光器材，作为现有「道具 / 结构」对象系统的新类别接入（用户定稿：旗板=黑旗、白旗板=反光板，故合并为 3 种）：

- 黑旗（black flag / 旗板，黑色遮光 / 负补光板）。
- 反光板（reflector board / 白旗板，白色反光板）。
- 柔光布框（diffusion frame，半透明柔光白扩散框）。

**只做**：加入下拉、可摆位、可旋转、可改尺寸、可改离地高度、显隐/复制/删除、选择环、俯视脚印 + 标签、保存/加载/AB 携带。

**不做**（留给后续）：

- 任何真实遮挡 / 反射 / 软化光学效果 → 后续 v0.6d（现已完成近似光学）。
- C 架/灯架的真实机械结构、可伸缩臂、夹具。
- 灯上柔光布附件的改动（那是 v0.6a/b 的 `diffusion-cloth`，与本规格的「柔光布框」是两件不同的东西，不要混淆，不要互相替换）。
- `MAX_LIGHTS`、更多光源、多语言、桌面封包（均不属于 v0.6c；桌面封包后续已在 v0.7/v0.7.1 完成，更多光源改入 v0.8，多语言后置）。

## 3. 产品原则

1. **控光器材不是道具，也不是灯。** 它独立摆在棚里，回答「我在灯和人之间放了什么板子」。
2. **第一版零光学。** 加入 gear 不改变任何人物受光、阴影、彩色反弹。导演先用它沟通机位与遮挡意图，光学近似 v0.6d 再补。这一点必须可验收（见 §8 第 9 条）。
3. **复用对象系统，不另起一套。** gear 是 `SceneObjectConfig`，走现有 `addObject/updateObject/duplicateObject/removeObject/setObjectPositionXZ/rotateObject/toggleObjectVisibility`、`GroundDragController`、`ObjectPanel`、保存/加载/AB/迁移。新增面尽量小。
4. **gear 不是承载面。** 人不能站在黑旗/反光板上。`getObjectSupportRole` 的 `default: null` 已经保证新 kind 不进承载面列表——这是有意依赖的默认行为，不要给 gear 加 seat/stand 分支。
5. **一眼能区分 3 种。** 黑旗黑、反光板白、柔光布框半透明；柔光布框要明显区别于玻璃占位和灯上柔光布附件。
6. **像站立器材，不像墙。** gear 渲染成「薄板 + 简易支架/底座」的站立形态，区别于贴地的背景板/侧墙。

## 4. 数据结构

### 4.1 类型（`src/types.ts`）

新增 3 个 `SceneObjectKind`：

```ts
export type SceneObjectKind =
  | 'table' | 'chair' | 'stool' | 'sofa' | 'platform'
  | 'plinth' | 'cylinderPlinth' | 'mannequin' | 'backdropPanel' | 'box'
  | 'blackFlag'       // 黑旗 / 旗板：黑色遮光板
  | 'reflectorBoard'  // 反光板（白旗板）
  | 'diffusionFrame'  // 柔光布框
```

新增 1 个渲染几何 `gearPanel`：

```ts
export type SceneObjectGeometry =
  | 'box' | 'cylinder' | 'chair' | 'sofa'
  | 'mannequinHalf' | 'mannequinFull' | 'panel'
  | 'gearPanel'      // 薄板工作面 + 简易支架 + 底座
```

新增 1 个材质 `scrimWhite`（半透明柔光白，给柔光布框用，区别于偏蓝的 `glass`）：

```ts
export type SceneObjectMaterial =
  | 'matteWhite' | 'matteBlack' | 'matteGray' | 'wood'
  | 'metal' | 'glass' | 'fabric'
  | 'scrimWhite'     // 半透明柔光白
```

`SceneObjectConfig` **本身不加新字段**——gear 的「角色」由 `kind` 表达。

### 4.2 控光器材识别 helper

为了让加道具下拉分组、以及 v0.6d 能枚举 gear，新增一个纯判定（放 `src/data/sceneObjects.ts` 或 `src/domain/` 均可）：

```ts
export const CONTROL_GEAR_KINDS = ['blackFlag', 'reflectorBoard', 'diffusionFrame'] as const
export function isControlGearKind(kind: SceneObjectKind): boolean {
  return (CONTROL_GEAR_KINDS as readonly string[]).includes(kind)
}
```

### 4.3 预设分组字段（`src/data/sceneObjects.ts`）

`SceneObjectPreset` 增加可选 `group`，让下拉分「道具 / 结构」与「控光器材」两组：

```ts
export type SceneObjectPreset = {
  // …existing fields…
  group?: 'prop' | 'gear'   // 缺省视为 'prop'
}
```

现有 14 个预设保持 `group` 缺省（= prop）即可，无需逐条加。

### 4.4 材质规格（追加到 `SCENE_OBJECT_MATERIALS`）

```ts
scrimWhite: {
  label: '柔光白（半透明）',
  color: '#f3f2ec',
  roughness: 0.9,
  metalness: 0,
  opacity: 0.5,
  shadowNote: '柔光布框扩散面，半透明柔光白，区别于偏蓝玻璃占位。',
},
```

### 4.5 首批 3 个 gear 预设（追加到 `SCENE_OBJECT_PRESETS`）

下列尺寸 `height` 为**含支架的总高**；工作面占上半部，支架占下半部（见 §5 几何）。`castShadow: false`、`receiveShadow: false`——本版 gear 不参与任何光学（§3 原则 2）。位置/朝向是起始值，按《工作约定》第 2 条由用户肉眼摆位定稿。

| id | label | kind | material | color | size(w×d×h) | defaultPosition | rotationY | useCase |
|---|---|---|---|---|---|---|---|---|
| `black-flag` | 黑旗 | `blackFlag` | `matteBlack` | `#141519` | 1.0 × 0.05 × 1.9 | x:-1.6 y:0 z:0.4 | 0.5 | 黑色遮光 / 负补光板，切光、压暗局部一侧。 |
| `reflector-board` | 反光板 | `reflectorBoard` | `matteWhite` | `#f1f0ea` | 1.0 × 0.05 × 1.8 | x:1.7 y:0 z:0.2 | -0.6 | 白色反光板（白旗板），给人物暗部补反光（近似补光已在 v0.6d 完成）。 |
| `diffusion-frame` | 柔光布框 | `diffusionFrame` | `scrimWhite` | `#f3f2ec` | 1.2 × 0.06 × 1.9 | x:-1.7 y:0 z:-0.6 | 0.5 | 半透明柔光布框，放在灯与人之间软化光（近似软化已在 v0.6d 完成）。 |

公共字段：`geometry: 'gearPanel'`、`castShadow: false`、`receiveShadow: false`、`showLabel: true`、`group: 'gear'`。

## 5. 渲染几何 `gearPanel`（`src/scene/SceneObjects.tsx`）

新增 `case 'gearPanel'`，让 gear 看起来是**站立的控光板**而非墙：

- 工作面：薄竖板，宽 `size.width`、厚 `max(size.depth, 0.03)`、高约 `size.height * 0.55`，置于总高的上半部。材质用对象 `material`（黑旗黑、反光板白、柔光布框半透明）。
- 支架：一根细立柱（深灰金属感，如 `#3a3a40`）从地面到工作面底部；底部一个小底座（细盘 / 小方块）。支架/底座用固定深灰，不跟随对象 material，避免反光板把支架也染白。
- 朝向：工作面法线取局部 +Z；对象的 `rotationY` 旋转整组（与现有对象一致，`SceneObjects` 外层已按 `rotationY` 旋转）。**v0.6d 将用「工作面法线 = +Z 经 rotationY 旋转」+ 工作面世界中心高度来做遮挡/反射近似**，本版把这条几何约定固定下来。
- 站位：支架底座底部位于局部 y=0，故 `position.y=0` 时 gear 站在地面；调「离地 Y」整体抬升（第一版抬升时支架不再触地可接受）。
- 选择/拖拽命中：沿用现有对象的选择环与脚下拖拽热区（`GroundDragController` 的 object 分支、`V03_OBJECT_VISUAL_RULES.minimumSelectableRadius`）。薄板要保证可点中——必要时给一个略大的不可见命中盒，但不得改变其他对象的命中逻辑。

最小回退：若「支架 + 底座」实现起来啰嗦，可先复用现有 `panel` 几何（纯竖板）落地，但仍要让 gear 与背景板在尺寸/材质上能区分；支架可作为本版收尾补。

## 6. UI

### 6.1 加道具下拉分组（`src/ui/object-list/SceneObjectsSection.tsx`）

把当前单层 `<select>` 改为按 `preset.group` 分两个 `<optgroup>`：

```txt
＋ 加道具
  ── 道具 / 结构 ──
     长桌 / 圆桌 / 方桌 / 椅子 / 凳子 / 沙发简化块 / 方形台座 /
     圆柱台座 / 低矮平台 / 直播圆形小舞台 / 半身人台 / 全身人台 /
     背景板 / 纸箱 / 箱体
  ── 控光器材 ──
     黑旗 / 反光板 / 柔光布框
```

`addObject(presetId)` 逻辑不变；只是选项分组渲染。占位首项「＋ 加道具」保留。

左侧列表中的 gear 行与道具同组显示（仍在「道具 / 结构」区即可，第一版不强制单独列「控光器材」分区；若易做，可在标题旁标注，但非必须）。

### 6.2 参数面板（`ObjectPanel`）

**不加新控件。** gear 复用现有对象面板的：位置 / 朝向（rotationY）/ 尺寸（宽·深·高）/ 离地 Y / 材质 / 颜色 / 阴影开关 / 俯视标签。

副作用提示：材质下拉因新增 `scrimWhite` 会对所有对象多一项「柔光白（半透明）」——这是可接受的通用材质扩展。

## 7. 写入范围

主实现（Claude）：

- `src/types.ts`：加 3 个 kind、`gearPanel` 几何、`scrimWhite` 材质。
- `src/data/sceneObjects.ts`：加 `scrimWhite` 材质规格、3 个 gear 预设、`group` 字段、`CONTROL_GEAR_KINDS` / `isControlGearKind`。
- `src/scene/SceneObjects.tsx`：加 `case 'gearPanel'` 渲染（板 + 支架 + 底座）。
- `src/ui/object-list/SceneObjectsSection.tsx`：下拉按 `group` 分 optgroup。
- `src/ui/TopBar.tsx`：完成后版本号 → `v0.6c`。

明确**不需要改**（写清楚以防误改）：

- `src/domain/supportSurfaces.ts`：靠 `default: null` 自动排除 gear，**不要**给 gear 加 seat/stand（§8 第 8 条会回归验收）。
- `src/state/actions/objectActions.ts`：现有 `addObject` 等已能处理任意预设，通常无需改（除非 addObject 写死了非 gear 假设——集成时确认）。
- `src/domain/sceneMigration.ts`：仅新增可选 kind/材质，旧方案不含，无需迁移；未知材质/kind 不应崩（确认渲染有兜底）。
- `src/domain/sceneDiff.ts`：gear 属 `objects`，A/B「道具」类别已覆盖；v0.6e 再决定是否单独高亮「控光器材」。
- v0.6a/b 的 `lightModifiers` 数据/公式、`LightModifierVisual`、`lightBrief`：与本规格无关，不动。
- `MAX_LIGHTS`、v0.5 fixture 数值、v0.4 姿态/摄影机。

## 8. 验收清单

下拉与视觉：

1. 「＋ 加道具」下拉出现「控光器材」分组，含黑旗 / 反光板 / 柔光布框。
2. 各 gear 加入后是**站立薄板（带支架/底座）**，不是贴地墙或飘空板。
3. 黑旗为黑色遮光板。
4. 反光板为白色反光板（白旗板）；支架不被染白。
5. 柔光布框为半透明柔光白扩散面，与玻璃占位、灯上柔光布附件都能区分。

交互（与道具一致）：

6. gear 可地面拖动改 XZ、可改 rotationY、可改尺寸、可改离地 Y、可显隐 / 复制 / 删除。
7. 点击 / 拖动 gear 能选中并出现选择环；俯视图有薄脚印 + 标签。
8. gear **不**出现在人物「放到承载物」列表里（不可站 / 不可坐）。

零光学保证（本版关键）：

9. 加 / 移动 / 旋转 gear **不改变**人物受光、阴影、彩色反弹（`castShadow:false`，不参与遮挡）。这是本版有意为之；后续 v0.6d 已以纯 helper 完成近似光学。

保存 / A-B / 回归：

10. 保存方案、刷新、加载、复制方案、A/B 交换后 gear 不丢，位置 / 朝向 / 尺寸 / 材质 / 颜色 / 离地 Y 保留。
11. v0.3 道具、v0.4 姿态 / 承载、v0.4c 摄影机、v0.5 灯具、v0.5.1 渲染、v0.6a/b 附件视觉与导演简介均不回退。
12. `npm run lint` 与 `npm run build` 通过。

## 9. Hermes / 候补 agent 边界

Hermes 可以做（仅在 Claude/Codex 明确指定时）：

- 起草 §4.5 的 3 个 gear 预设数据块和 §4.4 的 `scrimWhite` 材质块（逐字按本规格数值）。
- 起草 §5 `gearPanel` 的 mesh JSX 草稿（板 + 支架 + 底座）。
- 补小范围样式 / 命中盒修复、`HERMES.md` 交接记录。

Hermes 不可以做：

- 自己定 gear 数值、文案、默认位置或材质参数。
- 自己改 store / 集成并宣布 v0.6c 完成。
- 把 v0.6d 的遮挡 / 反射 / 软化光学提前做进来。
- 改 v0.6a/b 附件或 v0.5 灯具。
- 给 gear 加承载面（seat/stand）分支。

## 10. 完成后进入哪里

v0.6c 完成后仍在 v0.6 内，不进 v0.7：

1. v0.6d：在 v0.6c 对象上做光学近似——黑旗吃光 / 负补光 / 对某些方向溢光做简化遮挡、反光板给暗部弱补光、柔光布框在灯与人之间时让有效光更软更暗。复用 §5 固定下来的「工作面法线 + 世界中心高度」几何约定。
2. v0.6e：A/B 差异摘要提示「控光器材」变化、保存/加载/复制/交换不丢、导出正常、文档收口。
3. v0.7 / v0.7.1：后续已完成可开源第一版、Tauri 桌面封包和正式 App 图标。
