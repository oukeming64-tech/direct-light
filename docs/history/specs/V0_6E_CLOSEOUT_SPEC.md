# v0.6e 收口规格（v0.6 控光线收尾）

状态：**已落地并通过用户视觉验收（2026-06-21）**。Claude Code 完成 v0.6e 收口实现与回归，Codex 负责进度文档（`COLLABORATION.md` / `CLAUDE.md` / `ROADMAP.md` / `HERMES.md`）和可见版本号同步；v0.6 控光线全线完成。后续 v0.7 可开源第一版和 v0.7.1 桌面图标 / Release 也已完成；2026-06-22 后续路线调整为 v0.8 更多光源 / 多灯管理、v0.9 自定义灯具预设导入/导出，多语言 UI 后置。创建日期：2026-06-21；定稿日期：2026-06-21；验收日期：2026-06-21。父规格：`V0_6_MODIFIER_SPEC.md §2`（v0.6 拆分，v0.6e = 收口验收）、`V0_6D_OPTICS_SPEC.md §12`（完成后进入哪里）。

## 1. 目标

v0.6a–d 已经把「灯上附件」和「棚内控光器材 + 近似光学」做完并通过用户视觉验收。v0.6e 不加新光学、不加新器材，只做**收口**：让整条 v0.6 控光线在 A/B 对比、保存/加载/复制、导出截图、文档四个面上自洽稳定。v0.7 开源第一版和 v0.7.1 桌面图标 / Release 后续已经完成。

一句话目标：把 v0.6 的能力收成一个导演敢拿去沟通、能存能比能导出的稳定版本。

## 2. 范围

**做**：

1. A/B 差异摘要把「控光器材」从「道具」里拆成独立一类（§4）。
2. 保存 / 加载 / 复制 / A/B 冻结·交换的回归验收：附件（`modifierId`）+ gear（含 `gearPanel`/`scrimWhite`）+ gear 近似光学（派生，不入存储）都不丢、不崩、可由场景重新推导（§5）。
3. 导出图 / 截图验收：画面含 gear 视觉与 gear 光学（黑旗压暗、反光板补光、柔光布框软化）时导出正常（§6）。
4. 文档与开源前限制说明收口（§7）。

**不做**（留给后续）：

- 任何新光学、新 gear、新灯具、新附件。
- `MAX_LIGHTS` 提升 / 多灯管理（后续 v0.8）。
- 自定义灯具预设导入/导出（后续 v0.9）。
- 多语言（后置到核心功能和字段更稳定后）。
- v0.7 的开源第一版动作本身（README/LICENSE 正式落地、桌面封包）——v0.6e 当时只把「开源前限制说明」写清；正式开源与桌面封包后续已在 v0.7 / v0.7.1 完成。

## 3. 产品原则

1. **收口不改手感。** v0.6a–d 已验收的数值、视觉、光学一律不动；本版只补「比/存/导/写」四件事。
2. **gear 现在有光学含义，A/B 必须看得见它。** 把控光器材移进/移出光路会改变画面，A/B 差异摘要要能单独提示「控光器材」变化，而不是埋在「道具」里。
3. **派生不入库。** gear 光学（cut / 补光 / 软化 / 吃反弹）由 `controlGearOptics.ts` 从场景推导，**不**写入 `SceneConfig`；保存的只有 gear 对象本身，加载后光学自动重新推导。
4. **回归优先。** 收口版第一职责是「不回退」：v0.3 道具、v0.4 姿态/承载/摄影机、v0.5 灯具/渲染、v0.6a–d 全部仍工作。

## 4. A/B 差异：拆出「控光器材」

### 4.1 现状（`src/domain/sceneDiff.ts`）

- `DiffCategory = 'lights' | 'people' | 'objects' | 'pose' | 'camera' | 'studio'`。
- `diffObjects` 把**所有** `scene.objects`（含 gear）按 `kind/position/rotationY` 比较，标签统一为「道具」。
- 结果：移动黑旗/反光板/柔光布框只会让「道具」行高亮，导演看不出这是「控光」变化；而且与摆桌椅混在一起。

### 4.2 目标

新增独立类别「控光器材」，与「道具」并列：

- `DiffCategory` 增加 `'gear'`。
- `compareScenes` 返回顺序建议：`lights, people, objects, gear, pose, camera, studio`（gear 紧随 objects，便于阅读）。
- `diffObjects` 只比较**非** gear 对象（`!isControlGearKind(o.kind)`）。
- 实现时从 `src/data/sceneObjects.ts` 复用 `isControlGearKind`，不要在 `sceneDiff.ts` 里重新维护一份 kind 列表。
- 第一版沿用当前 `sceneDiff.ts` 的粗粒度、按过滤后数组顺序比较的做法；不要在 v0.6e 顺手改成按 id 匹配、排序或深层 diff，避免改变 A/B 摘要的手感。
- `diffObjects` 保持现有道具比较口径，只是排除 gear；不要借本版把普通道具的材质/尺寸/显隐全部扩进去，除非回归时发现具体 bug。
- 新增 `diffGear`：只比较 gear 对象（`isControlGearKind(o.kind)`），比较 `kind / geometry / material / color / visible / position / rotationY`，并**额外比较 `size`（宽/深/高）**，因为 gear 尺寸直接影响遮挡范围与光学；可见性变化（`visible`）也应算「不同」，因为隐藏 gear 会改变光学。
  - 标签：`控光器材`。
  - hint：相同 → `N 件控光器材相同`；数量相同但有变化 → `位置/朝向/尺寸/显示有变化`；数量不同 → `A N件 · B M件`。

### 4.3 文案与 UI

- A/B 顶部差异条会多一枚「控光器材」chip，沿用现有 same=灰 / 不同=紫高亮渲染（`CompareStage` 已按 `compareScenes()` 返回数组泛化渲染，通常无需特判；若 TypeScript 因 `DiffCategory` 联合类型新增而报错，只做最小类型修正）。
- 已知取舍（写清，不在本版做）：gear 驱动的「灯光」效果变化仍归在「控光器材」类，不在「灯光」类二次高亮——因为 `light` 原始参数没变，变的是 gear。导演看到「控光器材」高亮即知本次对比涉及控光。v0.6e 不做「把 gear 对灯的有效影响算进灯光 diff」。

## 5. 保存 / 加载 / 复制 / A-B 回归

不需要新存储字段（gear 是 `SceneObjectConfig`，附件是 `LightConfig.modifierId`，都已随场景序列化）。本节是**验收 + 必要兜底确认**，不是新功能：

1. `src/domain/sceneMigration.ts`：确认旧方案（无 gear / 无 `modifierId`）加载不崩；v0.6c 已让 `objectGeometryByKind` 覆盖 3 个新 kind。只有在回归中发现旧数据崩溃时，才补最小 fallback；不要主动重写迁移层。
2. `duplicateObject`：复制 gear 时 `kind/geometry/material/size/group` 全部跟随（现走 `structuredClone`，预期 OK，需验收）。
3. `duplicateLight`：复制灯时 `modifierId`（+ `fixturePresetId`）跟随。
4. A/B 冻结 B、交换 A/B、从已存方案设 B：gear 与附件随快照携带，交换后不丢、不崩、不黑屏。
5. 保存方案 → 刷新 → 加载：gear 位置/朝向/尺寸/可见性、附件选择都在，gear 光学按加载后的场景重新推导一致。

## 6. 导出 / 截图

`src/ui/exportImage.ts` + `capture.ts`（`preserveDrawingBuffer: true` 已开）：

1. 画面里有黑旗压暗 / 反光板补光 / 柔光布框软化时，导出 PNG 与屏幕所见一致。
2. 反光板虚拟补光（运行时 `pointLight`）出现在导出图里（它是真实场景光，不是 gizmo，预期天然包含）。
3. gear 形体（`gearPanel`）出现在导出图。
4. 导出目标图不应包含紫色选择环、灯光拖拽球、摄影机 gizmo、俯视脚印等**仅交互 gizmo**。注意：当前导出通过 `capture.ts` 渲染当前 R3F scene，交互 gizmo 是否进入 PNG 需要实测；如果会进入，Claude 在 v0.6e 内做最小修复或明确记录为 v0.7 前限制，不能假装已满足。

## 7. 文档与开源前限制说明

> 进度文档由 Codex 书写（用户安排）。本节只列「需要写到的内容」，供 Codex 收口时落笔；Claude 不在本版改这些进度文档。

1. `COLLABORATION.md` / `CLAUDE.md` / `ROADMAP.md` / `HERMES.md`：把 v0.6a–e 标为完成并通过验收；v0.7 / v0.7.1 完成后，当前下一步应指向 v0.8 多灯管理 / v0.9 自定义灯具预设。可见版本号（`TopBar`）在 v0.6e 收口通过后曾升到 `v0.6e`，当前已为 `v0.7.1`。
2. `README.md`：补一段「开源前限制说明」，明确第一版边界：
   - 最多 3 盏灯（`MAX_LIGHTS = 3`），更多光源 / 多灯管理是后续 v0.8。
   - 暂不支持用户自定义灯具预设导入/导出，计划后续 v0.9。
   - 仅中文 UI，多语言后置到核心功能和字段更稳定后。
   - 面向桌面 / 封包工作台验收；移动端窄屏（约 390px）布局会挤掉 3D 画布，移动端响应式后续单独排期。
   - 渲染是导演沟通向的近似，不是物理准确；gear 光学是可读近似（黑旗不用真实 mesh 阴影、反光板是虚拟补光）。
3. 不在 v0.6e 写 LICENSE / 正式开源 README 结构 / 桌面封包——那是 v0.7。

## 8. 写入范围

主实现（Claude）：

- `src/domain/sceneDiff.ts`：加 `'gear'` 类别、`diffGear`、`diffObjects` 排除 gear、`compareScenes` 顺序与返回。
- `src/app/compare/CompareStage.tsx`：仅在新增 `DiffCategory` 后出现类型或文案显示问题时做最小修正；正常情况下不需要改 UI。
- 仅当回归发现具体 bug 时才动：`sceneMigration.ts` / `objectActions.ts`（duplicate）/ `exportImage.ts` / `capture.ts`。无 bug 则只验收不改。
- `src/ui/TopBar.tsx` 版本号：**由 Codex 在文档收口时统一处理**（用户已把文档/版本号同步交给 Codex）。

明确**不改**：

- v0.6a `lightModifiers` 数值、v0.6b 视觉/简介、v0.6c gear 预设、v0.6d `controlGearOptics` 公式与数值（除非用户明确要调）。
- `MAX_LIGHTS`、灯具数值、姿态、摄影机。
- `SceneConfig` 结构（不为 gear 光学加存储字段——它是派生的）。

## 9. Hermes / 候补 agent 边界

Hermes 可以做（仅在 Claude/Codex 明确指定时）：

- 起草 `diffGear` 纯函数和「控光器材」hint 文案（按本规格 §4）。
- 补很小的回归用例 / 注释。

Hermes 不可以做：

- 自己改 v0.6a–d 任何数值或公式。
- 自己给 `SceneConfig` 加 gear 光学存储字段。
- 自己改 `MAX_LIGHTS` 或开始 v0.7 开源动作。
- 自己宣布 v0.6e 完成或推进进度文档到 done / 下一版本。

## 10. 验收清单

A/B 差异：

1. A/B 两边其它都相同、只在一边移动/旋转/缩放一件 gear → 顶部「控光器材」chip 高亮「不同」，「道具」chip 仍「相同」。
2. 两边 gear 完全一致、只挪一张桌子 → 「道具」高亮、「控光器材」相同。
3. 隐藏一边的某件 gear → 「控光器材」高亮。

保存 / 加载 / 复制 / A-B：

4. 加黑旗 + 反光板 + 柔光布框 + 给 Key Light 挂中号柔光箱 → 保存方案 → 刷新 → 加载：gear 与附件全在，画面光学与保存前一致。
5. 复制一件 gear：副本 kind/材质/尺寸/朝向正确，且不出现材质选择器（v0.6d 修复不回退）。
6. A/B 冻结 B → 移动 gear → A 变 B 不变、「控光器材」高亮；交换 A/B 后左右角色正确、不黑屏。

导出：

7. 画面有黑旗压暗 / 反光板补光 / 柔光布框软化时，导出 PNG 与屏幕一致，含反光板虚拟补光。
8. 导出 PNG 不含紫色选择环、灯光拖拽球、摄影机 gizmo、俯视脚印等交互辅助元素；若现有导出路径做不到，需要在本版修到可验收，或由 Codex/用户明确接受为 v0.7 前限制。

回归：

9. v0.6a 附件、v0.6b 附件视觉 + 导演简介、v0.6c gear 摆位、v0.6d gear 光学全部不回退。
10. gear 仍不进人物「放到承载物」；gear 不可选材质。
11. v0.3 道具 / v0.4 姿态·承载·摄影机 / v0.5 灯具·渲染不回退。
12. `npm run lint` 与 `npm run build` 通过。

## 11. 完成后进入哪里

v0.6e 收口通过后，v0.6 控光线全线完成；后续 **v0.7：可开源第一版 + 桌面封包** 和 **v0.7.1：正式 App 图标 / Release 收口** 已完成。开源第一版不等待多语言或更多光源；2026-06-22 后续路线调整为先做 v0.8 更多光源 / 多灯管理，再做 v0.9 自定义灯具预设导入/导出，多语言后置。
