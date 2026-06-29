# Store Action Split Spec

状态：✅ 已完成（v0.4.8，2026-06-20，Claude 集成 + glm-5.2 逐字搬运起草 8 个 action 工厂）。`store.ts` 685→38 行，新增 `storeTypes.ts`/`storeHelpers.ts`/`src/state/actions/*` 八组工厂，无行为变更、`tsc·lint·build` 全绿、应用渲染与重构前一致。下方为原规格，保留作记录。Owner：Claude Code。创建日期：2026-06-20。

## 1. 目标

这轮只做 `src/state/store.ts` 轻量拆分，不改变任何产品行为。

当前 `store.ts` 已经约 684 行，里面混有视图、A/B、白棚、摄影机、灯光、人物、道具和方案保存动作。v0.5 灯具器械库会继续增加灯光动作，所以先把 action 分组拆清楚。

一句话目标：

- 用户看不出任何变化。
- Claude/Codex 后续调试时能快速找到对应模块。
- Hermes 只能按明确边界起草小 patch，不能重写状态架构，不能宣称完成整项拆分。

## 1.1 分工边界

Claude Code 负责：

- 拆分 `store.ts` 的主实现。
- 决定 TypeScript 类型组织方式。
- 集成所有 action 文件。
- 跑 `lint/build`。
- 对照验收清单确认行为没有变化。
- 更新 `COLLABORATION.md` / `ARCHITECTURE.md` / `CLAUDE.md`。

Hermes 只允许做：

- 在 Claude/Codex 明确指定时，起草单个 action 文件，例如只写 `cameraActions.ts` 或只写 `objectActions.ts`。
- 起草 `storeHelpers.ts` 这类纯搬运文件。
- 按指定格式报告 changed files / validation / known limits。

Hermes 不允许做：

- 独立拆完整个 `store.ts`。
- 改 store 的状态结构。
- 改任何产品行为。
- 修改 UI、scene、rendering 代码。
- 自己决定拆分顺序。
- 把没有经过 Claude/Codex 集成审核的草稿标成完成。

## 2. 不做什么

- 不换 Zustand。
- 不引入 Redux、Immer 或新依赖。
- 不改 `SceneConfig` / `LightConfig` / `CameraConfig` 字段。
- 不改 A/B 行为。
- 不改本地保存格式。
- 不做 v0.5 灯具预设。
- 不顺手重构 UI、Three.js 场景或渲染逻辑。

## 3. 建议文件结构

新增：

```txt
src/state/
  store.ts
  storeTypes.ts
  storeHelpers.ts
  actions/
    viewActions.ts
    compareActions.ts
    studioActions.ts
    cameraActions.ts
    lightActions.ts
    personActions.ts
    objectActions.ts
    presetActions.ts
```

保留：

- `src/state/store.ts` 仍然导出唯一的 `useStore`。
- 其它文件仍然从 `../state/store` 引入 `useStore`，不改调用方路径。

## 4. 类型拆分

把 store 私有类型移到 `src/state/storeTypes.ts`：

```ts
export type DragTarget = { kind: 'light' | 'person' | 'object' | 'camera'; id: string } | null

export type CompareSnapshot = {
  name: string
  scene: SceneConfig
  frozenAt?: number
}

export type Store = {
  scene: SceneConfig
  selection: Selection
  viewMode: ViewMode
  presets: LightingPreset[]
  dragTarget: DragTarget
  compareB: CompareSnapshot | null
  freeCameraCaptureRequestId: number

  // all actions currently declared in store.ts
}
```

建议同时定义 action factory 用的类型：

```ts
import type { StoreApi } from 'zustand'

export type StoreSet = StoreApi<Store>['setState']
export type StoreGet = StoreApi<Store>['getState']
```

如果 TypeScript 兼容性不顺，Claude 可以改用 Zustand 官方 `StateCreator` 推导，但不要为了类型推导重写 store 行为。

## 5. Helper 拆分

把这些纯 helper 移到 `src/state/storeHelpers.ts`：

- `mapLights`
- `chestTarget`
- `carryBoundPeople`
- `detachPeopleFrom`

约束：

- Helper 不能调用 `set/get`。
- Helper 不能 import React 或 Three.js。
- Helper 只能处理纯数据。

## 6. Action 分组

每个 action 文件导出一个 factory：

```ts
export function createCameraActions(set: StoreSet, get: StoreGet) {
  return {
    updateCamera: (...) => ...,
    setCameraPositionXZ: (...) => ...,
  }
}
```

`store.ts` 组合方式：

```ts
export const useStore = create<Store>((set, get) => ({
  scene: buildDefaultScene(),
  selection: { kind: 'light', id: 'light-key' },
  viewMode: 'camera',
  presets: loadPresets().map(normalizePreset),
  dragTarget: null,
  compareB: null,
  freeCameraCaptureRequestId: 0,

  ...createViewActions(set, get),
  ...createCompareActions(set, get),
  ...createStudioActions(set, get),
  ...createCameraActions(set, get),
  ...createLightActions(set, get),
  ...createPersonActions(set, get),
  ...createObjectActions(set, get),
  ...createPresetActions(set, get),
}))
```

### 6.1 viewActions

移动：

- `select`
- `setViewMode`
- `setDragTarget`

注意：

- `setViewMode` 必须继续清空 `dragTarget`。

### 6.2 compareActions

移动：

- `setCompareB`
- `freezeCompareB`
- `swapCompare`

注意：

- `setCompareB` 继续 normalize scene。
- `swapCompare` 继续把旧 A 作为新 B，并刷新 `frozenAt`。
- 不恢复旧的“进入 compare 自动生成 B”行为。

### 6.3 studioActions

移动：

- `updateStudio`

暂时不要把白棚渲染相关计算塞进这里。

### 6.4 cameraActions

移动：

- `updateCamera`
- `setCameraPositionXZ`
- `setCameraTargetMode`
- `aimCameraAtPerson`
- `applyCameraPreset`
- `requestFreeCameraCapture`
- `setCameraFromFree`

注意：

- `updateCamera` 写 `position` 时继续走 `clampCameraInsideStudio`。
- `setCameraFromFree` 必须继续切到 `camera` 视图并清空 `dragTarget`。
- `setCameraTargetMode` 的 live follow 仍然由渲染端 `getEffectiveCameraTarget` 完成，不要在 store 里每帧更新。

### 6.5 lightActions

移动：

- `updateLight`
- `setLightPositionXZ`
- `toggleLight`
- `addLight`
- `duplicateLight`
- `removeLight`
- `aimLightAtPerson`
- `setLightTargetMode`

预留：

- v0.5 的 `applyFixturePreset(lightId, fixturePresetId)` 后续放这里。

注意：

- 灯光目标模式继续镜像当前行为。
- `addLight` 继续使用 `LIGHT_TYPE_DEFAULTS.soft`。
- `duplicateLight` 继续复制目标模式、颜色和参数。

### 6.6 personActions

移动：

- `updatePerson`
- `setPersonPositionXZ`
- `addPerson`
- `duplicatePerson`
- `removePerson`
- `rotatePerson`

注意：

- `updatePerson` 的 attach-to-support 解绑判断不能回退。只有 position 真实变化时才解绑。
- `rotatePerson` 绑定状态下必须继续更新 `supportRotationOffset`。

### 6.7 objectActions

移动：

- `addObject`
- `duplicateObject`
- `removeObject`
- `updateObject`
- `setObjectPositionXZ`
- `rotateObject`
- `toggleObjectVisibility`

注意：

- 移动、旋转、尺寸/高度变化后继续 `carryBoundPeople`。
- 删除承载物后继续 `detachPeopleFrom`。

### 6.8 presetActions

移动：

- `resetScene`
- `applyDebugPreset`
- `savePreset`
- `loadPreset`
- `duplicatePreset`
- `renamePreset`
- `deletePreset`

注意：

- 所有读取旧方案的入口继续走 `normalizeScene` / `normalizePreset`。
- `applyDebugPreset` 暂时可留在 presetActions，不单独拆 debugActions。

## 7. 推荐实施顺序

Claude 分四个小 patch 做，每步都跑检查：

1. 新增 `storeTypes.ts` / `storeHelpers.ts`，`store.ts` 仍原地工作。
2. 拆 `viewActions` / `compareActions` / `studioActions` / `cameraActions`。
3. 拆 `lightActions` / `personActions` / `objectActions`。
4. 拆 `presetActions`，整理 imports，检查行数和文档。

不要一口气同时改所有功能和 UI。Hermes 如果参与，只能参与其中某一个明确小 patch 的草稿。

## 8. 验收清单

代码检查：

- `npm run lint`
- `npm run build`

行为检查：

1. 默认打开仍是镜头视图，有人物、白棚、灯光。
2. 切换镜头/自由/俯视/侧视/对比不黑屏。
3. 拖动人物、灯、道具、摄影机仍正常。
4. A/B 空状态、冻结 B、交换 A/B 仍正常。
5. 人物放到椅子/小舞台后，移动承载物仍跟随。
6. 摄影机目标模式、自由视角取景、拖拽摄影机仍正常。
7. 保存/加载方案不崩，旧方案能打开。

文档检查：

- `COLLABORATION.md` 记录拆分完成。
- `ARCHITECTURE.md` 把 `store.ts` 风险改为已缓解。
- `CLAUDE.md` / `HERMES.md` 当前任务不再说“待拆 store”。

## 9. 完成标准

- `src/state/store.ts` 最好降到 120-180 行左右，只保留初始状态和 action 组合。
- 单个 action 文件尽量低于 180 行。
- 没有新增依赖。
- 没有用户可见行为变化。
- 后续 v0.5 灯具库可以直接在 `lightActions.ts` 增加 `applyFixturePreset`。
