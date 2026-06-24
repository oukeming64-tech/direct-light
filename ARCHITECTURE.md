# Direct Light 代码架构

## 1. 文档目的

这份文档定义 Direct Light 的代码主干和模块边界。

目标是让项目后续开发时保持清晰、简单、容易调试。Claude Code 和 Codex 都应该按这里的目录职责放代码。

## 2. 当前代码观察

状态更新时间：2026-06-21

当前工程已经有这些基础：

- React/Vite 项目骨架。
- Three.js、React Three Fiber、Drei、Zustand、Tailwind 已在依赖中。
- `src/App.tsx` 已是薄入口，只渲染 `DirectLightApp`。
- `src/app/AppShell.tsx` 已是四区主布局薄壳；画布舞台在 `src/app/Stage.tsx`，视角提示在 `src/app/ViewBadge.tsx`，A/B 画布在 `src/app/compare/*`。
- `src/types.ts` 已作为核心类型源。
- `src/data/rendering.ts` 已作为渲染规格数值的代码镜像。
- `src/data/fixturePresets.ts` 已作为 v0.5 灯具器械预设库。
- `src/data/lightModifiers.ts` 已作为 v0.6a 灯上附件预设库。
- `src/data/defaults.ts` 已负责生成默认场景。
- `src/data/poses.ts` 已负责人物姿态预设。
- `src/data/sceneObjects.ts` 已负责白棚结构、道具和承载物预设。
- `src/state/store.ts` 已是状态薄入口；具体动作在 `src/state/actions/*`。
- `src/ui/LightPanel.tsx` 已是兼容导出壳；灯光面板实现拆到 `src/ui/light-panel/*`。
- `src/ui/ObjectList.tsx` 已是兼容导出壳；左侧对象列表实现拆到 `src/ui/object-list/*`。
- `src/scene/Person.tsx` 与 `src/scene/Studio.tsx` 已开始承载 3D 物体。
- `src/scene/LightRig.tsx` 已开始承载灯光渲染、灯具标记和灯光方向线。
- `src/scene/LightVisual.tsx` 已承载 v0.5.1 的柔光/面光/RGB 灯管可见灯体。
- `src/scene/studioGeometry.ts` 已承载 v0.5.1 的一体 cyclorama geometry helper。
- `src/scene/SceneObjects.tsx` 已承载桌椅、台座、小舞台、背景板等 3D 道具渲染。
- `src/scene/lighting.ts` 已开始承载灯光和白棚环境的计算逻辑。
- `src/scene/capture.ts` 已开始承载 Canvas 截图桥接。
- `src/domain/lightTargets.ts` 已承载灯光自动对齐目标计算。
- `src/domain/lightModifiers.ts` 已承载 v0.6a 附件后的有效光质纯计算。
- `src/domain/controlGearOptics.ts` 已承载 v0.6d 棚内控光器材近似光学纯计算。
- `src/domain/supportSurfaces.ts` 已承载人物放到桌面、椅面、舞台等承载面的高度计算。
- `src/domain/sceneMigration.ts` 已承载旧方案/旧快照迁移。
- `src/domain/cameraMath.ts` 已承载摄影机方位角/距离计算、目标跟随和棚内夹紧。

主要问题：

- UI 面板统一放在 `src/ui`，`src/panels` 只保留历史说明。后续不要再新建第二套面板目录。
- `src/scene/lighting.ts` 仍有可迁移到 `src/domain` 的纯计算。当前不阻塞，后续做渲染打磨时再拆。
- `src/ui/ParamPanel.tsx`、`src/scene/StudioScene.tsx`、`src/state/store.ts`、`src/app/AppShell.tsx`、`src/ui/LightPanel.tsx`、`src/ui/ObjectList.tsx` 均已完成轻量拆分。后续新增 UI section 时必须进入对应子目录，不要把代码塞回壳文件。
- v0.6a 控光附件已完成并通过用户真机验收；附件数据在 `data`，有效光质计算在 `domain`，附件 UI 在 `src/ui/light-panel/LightModifierSection.tsx`。
- v0.6b 附件视觉 + 导演视角简介已落地：附件形体在 `src/scene/LightModifierVisual.tsx`，灯光简介纯函数在 `src/domain/lightBrief.ts`，画面叠层在 `src/app/DirectorLightBrief.tsx`。
- v0.6c 棚内独立控光器材已落地并通过用户视觉验收：3 个 gear 预设在 `src/data/sceneObjects.ts`，渲染复用 `src/scene/SceneObjects.tsx` 的 `gearPanel`，加道具入口在 `src/ui/object-list/SceneObjectsSection.tsx`，仍走现有 object store actions。
- v0.6d 近似光学已新增纯 domain helper `src/domain/controlGearOptics.ts`，由 scene 运行时读取，不改 `SceneConfig`，不另起 gear store；v0.6e 收口主要动 `src/domain/sceneDiff.ts` 与既有保存/导出回归，不应新增存储字段。

## 2.1 2026-06-19 架构体检结论

整体结论：当前代码结构和最初设想基本一致，主干仍然清晰。

实际数据流仍然保持单向：

```txt
UI 操作
  -> store action
  -> scene config 更新
  -> scene / UI 重新读取状态
  -> 画面和参数同步变化
```

符合预期的地方：

- `src/main.tsx`、`src/App.tsx`、`src/app/DirectLightApp.tsx` 都很薄。
- `src/app/AppShell.tsx` 主要负责页面四区布局，没有塞入 Three.js 几何体或复杂业务计算。
- `src/data` 已经成为规格库：白棚、灯光、人物、摄影机、姿态、道具预设都集中在这里。
- `src/domain` 已经开始承担 Direct Light 的业务计算：灯光目标、承载面高度、摄影机数学、灯光摘要、旧数据迁移。
- `src/scene` 基本只处理 3D 渲染、相机、拖拽、场景辅助标记。
- `src/state/store.ts` 没有创建 Three.js 实例，仍然是纯状态和动作层。
- `src/types.ts` 仍然是核心数据结构源头。

当前偏胖文件：

- ~~`src/state/store.ts`~~：✅ 已于 v0.4.8 按 `STORE_ACTION_SPLIT_SPEC.md` 拆分。`store.ts` 现为 38 行（初始 state + 组合八组工厂）；类型在 `storeTypes.ts`、纯 helper 在 `storeHelpers.ts`、八组 action 工厂在 `src/state/actions/*`。无行为变更。
- ~~`src/ui/ParamPanel.tsx`~~：✅ 已于 v0.4.3 拆分。现为纯分发（26 行），灯光/人物/道具/摄影机/白棚五个面板各自独立成 `LightPanel.tsx` 等文件，共用 `PanelHeader.tsx`。
- ~~`src/scene/StudioScene.tsx`~~：✅ 已于 v0.4.3 拆分。已拆出 `CameraRig`(OrthoRig/PerspectiveRig)、`GroundDragController`、`CameraGizmo`、`DistanceLabel`，本体只剩场景组合。

判断：三处偏胖文件（ParamPanel / StudioScene v0.4.3、store.ts v0.4.8）均已完成轻量拆分。v0.5 的 `applyFixturePreset` 已加在 `src/state/actions/lightActions.ts`；v0.5.1 的 cyclorama、灯体视觉和反弹公式分别留在 `src/scene/studioGeometry.ts`、`src/scene/LightVisual.tsx`、`src/data/rendering.ts`/`src/scene/lighting.ts`；v0.6a 的附件预设、有效光质 helper 和 UI 分别留在 `src/data/lightModifiers.ts`、`src/domain/lightModifiers.ts`、`src/ui/light-panel/LightModifierSection.tsx`；v0.6b/c 新增模块也都落在各自边界内，主干仍清晰。

## 2.2 2026-06-20 开源前结构清理

这次清理目标是防止开源前继续把功能堆进大文件。无产品行为变化。

已完成：

- `src/app/AppShell.tsx` 只保留主布局。舞台尺寸、视角提示、A/B 对比画布分别拆到 `src/app/Stage.tsx`、`src/app/ViewBadge.tsx`、`src/app/canvasLayout.ts`、`src/app/compare/*`。
- `src/ui/ObjectList.tsx` 改为兼容导出壳。人物、灯光、道具/结构、摄影机、白棚列表分别在 `src/ui/object-list/*`，公共 row 工具在 `rowUtils.ts`，公共分组组件在 `Group.tsx`。
- `src/ui/LightPanel.tsx` 改为兼容导出壳。灯光基础、颜色/色温、强度/位置、目标/对齐、光束/柔硬分别在 `src/ui/light-panel/*`。

后续规则：

- v0.6b 已落地；后续只修具体 bug，不要重做 `LightModifierVisual` / `DirectorLightBrief` / `lightBrief`。
- v0.6d 已落地并通过验收；后续 v0.6e 收口应复用 `SceneObjectConfig` 和 `controlGearOptics` 的派生逻辑，不要另起一套 gear store，不要把派生光学写入 `SceneConfig`。
- v0.8 多光源规格见 `V0_8_MULTI_LIGHT_SPEC.md`：继续复用 `SceneConfig.lights`、`src/state/actions/lightActions.ts`、`LightRig` 和现有 UI 子目录；不要新增第二套 light store，不要默认改成 6 灯场景，不要为了列表管理引入灯组/solo/排序等额外状态。
- v0.9 自定义灯具规格见 `V0_9_CUSTOM_FIXTURE_SPEC.md`（已完成，用户验收通过 2026-06-23）：纯数据/计算放 `src/domain/customFixtures.ts`（单条归一/构造/合并查找）和 `src/domain/customFixturePack.ts`（文件级导入导出/校验）；store 用独立 `customFixtures` slice（不进 `SceneConfig`）+ `src/state/actions/fixtureActions.ts`，持久化在 `src/lib/storage.ts`（key `direct-light.customFixtures.v1`，与 `presets.v1` 分开）；UI 只改 `src/ui/light-panel/*`（`LightBaseSection` 下拉 + `LightFixtureActions.tsx`）。`FixturePreset` 类型已上移 `src/types.ts` 单一真源（`data/fixturePresets.ts` re-export）。不要把自定义器械塞进 `SceneConfig`，不要再造第二套 fixture 查找，不要让 `applyFixturePreset` 绕过 `findFixtureById`。
- v0.10 多语言（进行中，规格见 `V0_10_I18N_SPEC.md`）：语言是 app preference，不是 `SceneConfig`、保存方案、A/B 快照或自定义器械数据。i18n 层**已落地**——`src/i18n/`：`languages.ts`（`AppLanguage`/`DEFAULT_LANGUAGE`/`isAppLanguage`）、`index.ts`（纯 `t(language,key,params?)`，缺键回退 zh-CN + `⟦key⟧` 标记 + `{name}` 插值）、`useT.ts`（从 store 读 `language` 的 hook）、**按域拆分的 `messages/`**（每域 zh `as const` 真源 + en/ja `Record<Key,string>`，`messages/index.ts` 聚合派生 `MessageKey`；加 key = 改一域 + 注册三处 spread，加语言 = 各域加一 dict + 一处 spread）。store 顶层已加 `language` + `setLanguage`（`viewActions.ts`，先 `saveLanguage` 再 `set`，浅合并保各分片引用不变），持久化 key `direct-light.language.v1`（`lib/storage.ts`）。纯函数本地化（如 `app/compare/relativeTime.ts`）不用 hook，改签名收 `language` 参数直接调 `t(language,...)`。不要引入重型 i18n 依赖，不要把中文源字符串当翻译 key，不要为了显示语言改写内置数据表或用户输入；内置数据派生标签（灯型/能力/材质/预设名/`sceneDiff` 文案）按计划留到 v0.10.1 用 id→label display helper 本地化。
- 新增更多灯光列表状态、配件标签、锁定状态时，只改 `src/ui/object-list/LightsSection.tsx` 或同目录小组件。
- 新增 A/B 说明、导演视角简介或对比空状态时，优先改 `src/app/compare/*`，不要回填到 `AppShell.tsx`。
- `src/data/*.ts` 允许较长，因为它们是规格表；不要为了行数把稳定数据拆得过碎。

## 3. 主干原则

### 3.1 入口要薄

`src/main.tsx` 只负责挂载 React。

`src/App.tsx` 只负责加载全局样式和组合主应用，不写复杂业务逻辑。

推荐：

```tsx
import { DirectLightApp } from './app/DirectLightApp'
import './App.css'

export default function App() {
  return <DirectLightApp />
}
```

### 3.2 场景归场景

所有 Three.js / React Three Fiber 相关代码放在 `src/scene`。

场景组件可以读入场景配置、渲染 3D 物体、发出选择和拖拽事件，但不要直接处理复杂 UI 表单逻辑。

### 3.3 UI 面板归 UI 面板

对象列表、参数面板、方案栏、视图切换按钮等，统一放在 `src/ui`。

这些组件负责用户输入和展示，不直接写 Three.js 几何体。

### 3.4 状态归状态

Zustand store 放在 `src/state`。

状态层负责：

- 当前场景。
- 当前选择。
- 视图模式。
- 拖拽目标。
- 保存和恢复方案。
- 修改人物、灯、摄影机、白棚参数。

状态层不应该创建 Three.js 对象。

### 3.5 规格和默认值归 data

`src/data/rendering.ts` 是 Codex 后续调光的主要入口。

`src/data/defaults.ts` 负责把规格常量组合成可运行的默认场景。

组件不要散落硬编码灯光数值。如果需要默认值，优先从 `data` 引入。

### 3.6 纯函数归 lib 或 domain

颜色转换、本地存储、数学计算、向量转换、灯光衰减等纯函数，放在 `src/lib` 或 `src/domain`。

建议：

- 与产品领域强相关的计算放 `src/domain`。
- 通用工具放 `src/lib`。

例如：

- `src/domain/lightingMath.ts`
- `src/domain/cameraMath.ts`
- `src/lib/color.ts`
- `src/lib/storage.ts`

## 4. 推荐目录结构

当前推荐结构：

```txt
src/
  main.tsx
  App.tsx
  index.css
  types.ts

  app/
    DirectLightApp.tsx
    AppShell.tsx
    Stage.tsx
    ViewBadge.tsx
    canvasLayout.ts
    compare/
      CompareStage.tsx
      ComparePane.tsx
      relativeTime.ts

  data/
    rendering.ts
    defaults.ts
    fixturePresets.ts
    lightModifiers.ts
    sceneObjects.ts
    poses.ts
    cameraPresets.ts

  domain/
    lightTargets.ts
    lightModifiers.ts
    lightingSummary.ts
    cameraMath.ts
    sceneDiff.ts
    sceneMigration.ts
    supportSurfaces.ts

  scene/
    StudioScene.tsx
    Studio.tsx
    Person.tsx
    LightRig.tsx
    LightVisual.tsx
    SceneObjects.tsx
    CameraRig.tsx
    GroundDragController.tsx
    CameraGizmo.tsx
    DistanceLabel.tsx
    lighting.ts
    studioGeometry.ts
    capture.ts

  ui/
    ParamPanel.tsx
    LightPanel.tsx        # re-export only
    ObjectList.tsx        # re-export only
    light-panel/
    object-list/
    PersonPanel.tsx
    ObjectPanel.tsx
    CameraPanel.tsx
    StudioPanel.tsx
    CompareControls.tsx
    PresetBar.tsx
    TopBar.tsx
    controls.tsx

  state/
    store.ts
    storeTypes.ts
    storeHelpers.ts
    actions/

  lib/
    color.ts
    storage.ts
```

不是所有文件都要立刻创建。原则是：当功能出现时，放进对应空间。

## 5. 模块职责

### `src/app`

负责页面主干。

应该包含：

- 整体布局。
- 左侧对象列表。
- 中间画布。
- 右侧参数面板。
- 底部方案栏。

不应该包含：

- 灯光数学。
- Three.js 几何体细节。
- localStorage 细节。
- 大量表单字段实现。

### `src/scene`

负责 3D 渲染。

应该包含：

- Canvas。
- 白棚。
- 人物。
- 灯具可视化。
- 实际灯光。
- 摄影机控制。
- 俯视图/侧视图的 3D 表现。
- 选择环、拖拽手柄、距离线等场景辅助元素。

不应该包含：

- 保存方案逻辑。
- UI 面板布局。
- 产品文案和复杂表单。

### `src/ui`

负责传统 UI。

应该包含：

- 对象列表。
- 灯光参数面板。
- 白棚参数面板。
- 人物参数面板。
- 摄影机参数面板。
- 方案保存和切换。

注意：

- `src/ui/LightPanel.tsx` 与 `src/ui/ObjectList.tsx` 只是兼容导出壳。
- 灯光面板新增功能进入 `src/ui/light-panel/*`。
- 左侧列表新增功能进入 `src/ui/object-list/*`。
- `src/panels` 是历史建议目录，不再放新代码。

不应该包含：

- Three.js mesh。
- 光照强度换算。
- 本地存储读写细节。

### `src/state`

负责应用状态。

应该包含：

- `scene`
- `selection`
- `viewMode`
- `presets`
- 所有修改 scene 的 action。

可以包含：

- selectors。
- 小型派生数据。

不应该包含：

- React 组件。
- Three.js 实例。
- DOM 事件细节。

### `src/data`

负责稳定规格。

应该包含：

- 默认白棚。
- 默认人物。
- 默认摄影机。
- 默认灯光方案。
- 灯具类型默认参数。
- 色温和彩色预设。
- 渲染调校参数。

不应该包含：

- React 组件。
- 用户当前状态。
- localStorage。

### `src/domain`

负责产品领域计算。

应该包含：

- 根据灯高和人物位置计算目标点。
- 根据柔硬程度计算阴影参数。
- 根据白棚反射计算环境补光。
- 根据焦距计算 FOV。
- 计算灯到人物距离。

说明：

当前 `src/scene/lighting.ts` 里有一些纯计算，后续可以迁移到 `src/domain/lightingMath.ts`，让 `scene` 目录更专注于渲染。

当前 `src/scene/capture.ts` 依赖 React Three Fiber 的 `useThree`，所以暂时留在 `scene` 是合理的。若后续出现通用导出、文件命名、下载逻辑，应放到 `src/lib` 或 `src/panels`，不要塞进 `capture.ts`。

### `src/lib`

负责通用工具。

应该包含：

- 颜色转换。
- localStorage 包装。
- 通用格式化函数。
- 与业务弱相关的小工具。

## 6. 推荐数据流

推荐单向数据流：

```txt
UI 操作
  -> state action
  -> scene config 更新
  -> scene / panels 重新读取状态
  -> 画面和参数同步更新
```

具体例子：

```txt
用户拖动灯高滑杆
  -> LightInspector 调用 updateLight(id, { position: { ...position, y } })
  -> store 更新 scene.lights
  -> LightRig 重新渲染该灯
  -> 阴影和人物受光变化
```

## 7. 文件大小和复杂度约束

为方便调试，建议遵守：

- `src/App.tsx` 不超过 40 行。
- 单个 React 组件文件尽量不超过 220 行。
- `store.ts` 可以稍大，但 action 过多时拆出 `actions` 或 `selectors`。
- 一类 UI 面板一个文件。
- 一个 3D 物体或一组强相关 3D 物体一个文件。
- 渲染调参只改 `src/data/rendering.ts`，不要散落在组件里。

## 8. 命名约定

- React 组件：`PascalCase.tsx`
- 纯函数和工具：`camelCase.ts`
- 类型：集中在 `src/types.ts`，必要时按模块拆分。
- 默认配置：`DEFAULT_*`
- 渲染规格函数：`get*` 或 `compute*`
- Zustand hook：`useStore`

## 9. 后续重构建议

### v0.4b 前置轻量整理（✅ 已完成 v0.4.3，2026-06-19）

> 本节的拆分已全部落地（见 `COLLABORATION.md` v0.4.3 / v0.4.8 / v0.6 前结构清理）。`ParamPanel.tsx` 已降为纯分发（26 行），五个面板各自独立；`StudioScene.tsx` 已拆出 `CameraRig`、`GroundDragController`、`CameraGizmo`、`DistanceLabel`；`store.ts` 已拆成八组 action 工厂；`AppShell`、`LightPanel`、`ObjectList` 也已完成开源前拆分。目录沿用 `src/ui`，`src/panels` 是历史建议目录。下方为当时的拆分清单，保留作记录。

这一步建议在继续做“坐姿承载物联动”和“摄影机角度控制”之前完成，目标是让后续调试更方便，不改变产品行为。

建议拆分：

- `src/ui/ParamPanel.tsx`
  - 拆成 `LightPanel.tsx`
  - 拆成 `PersonPanel.tsx`
  - 拆成 `CameraPanel.tsx`
  - 拆成 `ObjectPanel.tsx`
  - 拆成 `StudioPanel.tsx`
  - `ParamPanel.tsx` 只保留根据 selection 分发到对应面板的逻辑。
- `src/scene/StudioScene.tsx`
  - 拆出 `PerspectiveRig.tsx` 或 `CameraRig.tsx`
  - 拆出 `OrthoRig.tsx`
  - 拆出 `GroundDragController.tsx`
  - 拆出 `CameraGizmo.tsx`
  - 拆出 `DistanceLabel.tsx`
  - `StudioScene.tsx` 只保留场景组合。
- ~~`src/state/store.ts`~~ — ✅ 已于 v0.4.8 按 `STORE_ACTION_SPLIT_SPEC.md` 拆成 `view/compare/studio/camera/light/person/object/preset` 八组 `createXActions` 工厂 + `storeTypes`/`storeHelpers`，store.ts 仅剩初始 state + 组合（38 行）。逐字搬运，无行为变更。

目录选择：

- 当前项目真实 UI 已经集中在 `src/ui`，继续沿用。
- `src/panels` 只作为历史建议目录，不再新增实现。

验收标准：

- 整理后 UI 外观不变化。
- `npm run lint` 通过。
- `npm run build` 通过。
- 顶部五个视图、右侧参数面板、A/B、保存方案仍可用。

### 第一步：接入主干

- 已完成：建立 `src/app/DirectLightApp.tsx`。
- 已完成：将 `src/App.tsx` 简化为只渲染 `<DirectLightApp />`。
- 已完成：删除 Vite starter UI。
- 已完成：画布舞台已拆成 `src/app/Stage.tsx`；A/B 对比画布在 `src/app/compare/*`。

### 第二步：补 UI 分层

- 已完成：`src/ui/ObjectList.tsx` 是导出壳，真实列表在 `src/ui/object-list/*`。
- 已完成：`src/ui/ParamPanel.tsx` 是分发器，各面板在 `src/ui/*Panel.tsx`。
- 已完成：`src/ui/LightPanel.tsx` 是导出壳，真实灯光面板在 `src/ui/light-panel/*`。

### 第三步：补渲染分层

- 建立 `src/scene/LightRig.tsx`。
- 建立 `src/scene/LightHandle.tsx`。
- 将灯光渲染和灯具可视化放进 `scene`。

### 第四步：整理纯计算

- 建立 `src/domain/lightingMath.ts`。
- 将 `src/scene/lighting.ts` 中不依赖 React 和 Three 组件的计算迁入 domain。
- `scene` 只调用 domain 的结果来渲染。

## 10. 调试入口

后续排查问题时，按这个顺序找：

- 画面灯光不对：先看 `src/data/rendering.ts`，再看 `src/domain/lightingMath.ts` 或 `src/scene/lighting.ts`，最后看 `src/scene/LightRig.tsx`。
- 参数调了没反应：先看对应 `src/ui/*Panel.tsx` 或 `src/ui/light-panel/*` / `src/ui/object-list/*`，再看对应 `src/state/actions/*Actions.ts`，最后看消费该状态的 scene 组件。
- 保存方案不对：先看 `src/state/actions/presetActions.ts`，再看 `src/lib/storage.ts`。
- 人物或白棚形状不对：看 `src/scene/Person.tsx` 或 `src/scene/Studio.tsx`。
- 页面布局不对：看 `src/app/AppShell.tsx`、`src/ui/*` 和 `src/index.css`。
