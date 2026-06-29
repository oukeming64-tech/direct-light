# v0.4c 摄影机控制规格

状态：已实现并通过用户真机验收（v0.4.7，2026-06-19）。纯模块 cameraMath/cameraPresets/CameraPanel 由 OpenRouter glm-5.2 起草、Claude 审核；类型/store/迁移/取景桥/diff 由 Claude 自写。`tsc·lint·build` 全绿。§8 的 9 项产品验收已过；用户追加的棚内夹紧、自由/俯视拖拽摄影机机位、自由模式“看向高度”不带动场景三项也已验收。

负责人建议：Codex 定产品规格；Claude/Hermes 可按本文做窄范围实现；用户最终视觉验收。

## 1. 目标

v0.4c 的目标不是做专业摄影机模拟器，而是让导演在白棚里清楚表达“最终画面怎么看”。

当前自由视角适合摆场、找角度、检查空间；摄影机视角应该成为导演构图视角，用于 A/B 对比、保存方案和导出图。

一句话目标：

- 自由视角：找角度。
- 摄影机视角：定构图。
- A/B：比较不同构图、光影和遮挡。

## 2. 本轮必须做

### 2.1 摄影机数据

在 `CameraConfig` 上新增可选字段：

```ts
export type CameraTargetMode = 'manual' | 'person' | 'peopleCenter'

export type CameraConfig = {
  position: Vector3
  target: Vector3
  focalLength: number
  aspectRatio: AspectRatio
  targetMode?: CameraTargetMode
  targetPersonId?: string
}
```

兼容要求：

- 旧方案没有 `targetMode` 时，迁移为 `manual`。
- 旧方案没有 `targetPersonId` 时，默认锁定第一个人物。
- 保存方案、A/B、导出图都必须带上这些字段。

### 2.2 摄影机目标模式

摄影机面板新增「目标」区，UI 文案必须用：

- 分段按钮标签：`手动` / `锁定人物` / `多人中心`
- 人物选择 label：`锁定对象`
- 一次性按钮：`对准 Actor A 一次`

行为：

- `手动`：使用当前 `camera.target`，不自动更新。
- `锁定人物`：摄影机目标实时跟随某个人的胸口附近，建议使用已有 `getPersonAimTarget(person)`。
- `多人中心`：摄影机目标实时跟随所有人物中心，建议使用已有 `getPeopleCenterAimTarget(people)`。
- `对准 Actor A 一次`：把当前目标写成 Actor A 的目标点，然后切回 `manual`。

注意：

- 目标模式只改 `target`，不要自动改机位 `position`。
- 人物移动、人物站到小舞台、人物绑定承载物移动时，锁定人物/多人中心都应跟随。

### 2.3 方位角 / 距离 / 高度

摄影机面板「机位」区改为导演可理解的参数。

保留：

- `高度`
- `距离`
- `看向高度`

新增：

- `方位角`

UI 文案：

- `方位角`
- `距离`
- `高度`
- `看向高度`

数值建议：

- 方位角：`-180..180°`，0° = 正面，45° = 右前 45°，-45° = 左前 45°。
- 距离：`2..10m`。
- 高度：`0.4..3.5m`。
- 看向高度：`0.2..2.6m`。

实现建议：

- 新增 `src/domain/cameraMath.ts`。
- 用 `camera.target` 作为中心，从 `camera.position` 计算水平距离和方位角。
- 改方位角/距离时，保持 `target` 不变，只重算 `position.x/z`。
- 改高度时，只改 `position.y`。
- 改看向高度时，只改 `target.y`，并把 `targetMode` 设为 `manual`。

## 3. 机位预设

新增 `src/data/cameraPresets.ts`。

预设按钮放在摄影机面板「机位预设」区。UI 文案必须用：

- `正面全身`
- `45°侧前`
- `高机位`
- `低机位`
- `俯拍沟通`

第一版预设建议：

```ts
[
  {
    id: 'front-full',
    label: '正面全身',
    position: { x: 0, y: 1.55, z: 6.2 },
    target: { x: 0, y: 1.05, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'front-45',
    label: '45°侧前',
    position: { x: 4.2, y: 1.55, z: 4.2 },
    target: { x: 0, y: 1.05, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'high-angle',
    label: '高机位',
    position: { x: 0, y: 2.6, z: 5.2 },
    target: { x: 0, y: 0.95, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'low-angle',
    label: '低机位',
    position: { x: 0, y: 0.75, z: 5.2 },
    target: { x: 0, y: 1.25, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'top-communication',
    label: '俯拍沟通',
    position: { x: 0, y: 4.2, z: 4.8 },
    target: { x: 0, y: 0.6, z: 0 },
    focalLength: 28,
    aspectRatio: '16:9',
  },
]
```

点击预设时：

- 写入 `position`、`target`、`focalLength`、`aspectRatio`。
- `targetMode` 设为 `manual`。
- 不改变人物、灯光、道具。

## 4. 用当前自由视角设为摄影机

摄影机面板新增「从自由视角取景」区。

UI 文案必须用：

- 如果当前是自由视角：按钮 `设为当前自由视角`
- 如果当前不是自由视角：按钮 `切到自由视角调整`
- 辅助短文案：`在自由视角找好角度后，把它写入主摄影机。`

行为：

- 不在自由视角时，点击按钮只切到 `free` 视图，不改摄影机。
- 在自由视角时，点击按钮把当前 Three.js 自由视角 camera 的 `position` 和 OrbitControls 的 `target` 写入 `scene.camera.position/target`。
- 写入后切到 `camera` 视图，让用户立即看到主摄影机画面。
- 写入后 `targetMode` 设为 `manual`。

实现建议：

- 在 `StudioScene` / `CameraRig` 里为自由视角的 `OrbitControls` 加 ref。
- store 增加一个很小的请求状态，例如 `freeCameraCaptureRequestId`。
- CameraPanel 点击 `设为当前自由视角` 时发起请求。
- 自由视角中的 bridge 读当前 R3F camera + controls.target，调用 store action 写入摄影机。
- 不要用 DOM 或全局变量偷取相机。

## 5. A/B 集成

v0.4c 必须保留 v0.4.6 的 A/B 引导。

要求：

- A/B 对比中，修改摄影机焦段、画幅、机位、目标模式后，B 保持冻结。
- 差异摘要里的 `摄影机` 标签在摄影机不同后高亮。
- 切换 A/B 后，摄影机状态跟随场景交换。
- 从 A/B 切回镜头/自由/俯视/侧视不黑屏。

## 6. 暂时不做

- 真实相机传感器、景深、光圈、快门、ISO。
- 摄影机路径动画。
- 多摄影机。
- 精确镜头畸变。
- 云端分镜/批注。

这些可以留到摄影机基础闭环稳定之后。

补充：原规格曾把“摄影机拖拽 gizmo”列为暂不做；用户在 v0.4.7 验收中明确追加了自由/俯视拖拽摄影机机位，Claude 已补入并通过用户验收。后续仍暂不做的是路径动画、多机位和更复杂的相机轨道工具。

## 7. 建议写入文件范围

允许改：

- `src/types.ts`
- `src/data/defaults.ts`
- `src/data/cameraPresets.ts`（新增）
- `src/domain/cameraMath.ts`（新增）
- `src/domain/sceneMigration.ts`
- `src/state/store.ts`
- `src/ui/CameraPanel.tsx`
- `src/scene/StudioScene.tsx`
- `src/scene/CameraRig.tsx`
- `src/domain/sceneDiff.ts`（仅为摄影机差异摘要补字段）
- `CLAUDE.md`
- `COLLABORATION.md`
- `ROADMAP.md`
- `HERMES.md`

不要改：

- 灯光渲染算法。
- 人物骨架。
- 道具预设。
- A/B 主交互结构，除非是为了接入摄影机差异摘要。
- 新增依赖。

## 8. 验收清单

代码检查：

- `npm run lint`
- `npm run build`

产品验收：

1. 摄影机面板能调 `方位角 / 距离 / 高度 / 看向高度 / 焦段 / 画幅`。
2. `正面全身` 预设能回到当前默认构图。
3. `45°侧前` 能明显改变画面角度。
4. `高机位` 和 `低机位` 有明显构图差异。
5. `锁定人物` 后，移动 Actor A，摄影机目标跟随人物。
6. `多人中心` 后，添加/移动第二个人，摄影机目标跟随多人中心。
7. 自由视角中点击 `设为当前自由视角` 后，主摄影机视角变成刚才的自由视角。
8. A/B 中改摄影机，B 不动，差异摘要高亮 `摄影机`。
9. 对比视图切回镜头/自由/俯视/侧视不黑屏。
10. 自由/俯视中拖拽摄影机机位，摄影机保持在白棚可读范围内。

## 9. 交接要求

Hermes/Claude 完成后必须报告：

- 改了哪些文件。
- 哪些 UI 文案严格按本文实现。
- 是否新增字段，旧方案如何迁移。
- `lint/build` 结果。
- 未做事项。
- 需要用户真机看的项目。

如果不能完成 `设为当前自由视角`，必须明确标成未完成，不允许把 v0.4c 标为完成。
