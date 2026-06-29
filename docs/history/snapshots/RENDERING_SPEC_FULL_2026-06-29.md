# Direct Light 渲染规格

## 1. 文档目的

这份文档用于指导 Direct Light 的视觉和渲染实现。

Claude Code 实现功能时，应优先遵守这里的数值、规则和验收标准。后续如果实际截图效果不理想，可以先调这里的参数，再同步代码。

## 2. 渲染目标

Direct Light 的第一版目标是让导演快速判断白棚里的灯光关系。

优先级从高到低：

1. 灯位变化必须立刻影响人物受光和阴影方向。
2. 灯高变化必须明显影响地面阴影长度。
3. 硬光和柔光必须有可见差异。
4. 白光和彩色光必须有可见差异。
5. 白棚反射必须让阴影变浅、画面变平。
6. 画面需要稳定、清楚、可沟通，不追求电影级物理精度。

## 3. 坐标系统

建议使用 Three.js 默认坐标习惯：

- `x`：左右方向，正值为画面右侧。
- `y`：高度方向，正值向上。
- `z`：前后方向，正值靠近摄影机，负值靠近后墙。
- 单位：米。
- 人物默认站在世界中心附近。

默认人物参考点：

```ts
const PERSON_TARGET = { x: 0, y: 1.2, z: 0 };
```

灯光默认对准人物胸口到脸部之间的位置，而不是对准脚底。

## 4. 默认白棚

```ts
export const DEFAULT_STUDIO = {
  width: 8,
  depth: 10,
  height: 5,
  wallReflectance: 0.65,
  floorReflectance: 0.55,
  ambientLevel: 0.35,
  hasCyclorama: true,
  wallColor: "#f7f6f1",
  floorColor: "#f4f3ee",
};
```

### 白棚材质建议

- 墙面不要纯白 `#ffffff`，否则容易过曝和失去层次。
- 推荐墙面基础色：`#f7f6f1`
- 推荐地面基础色：`#f4f3ee`
- 粗糙度：`0.72` 到 `0.9`
- 金属度：`0`

Three.js 材质建议：

```ts
new THREE.MeshStandardMaterial({
  color: "#f7f6f1",
  roughness: 0.82,
  metalness: 0,
});
```

## 5. 默认摄影机

```ts
export const DEFAULT_CAMERA = {
  position: { x: 0, y: 1.55, z: 6.2 },
  target: { x: 0, y: 1.05, z: 0 },
  focalLength: 35,
  fov: 42,
  aspectRatio: "16:9",
};
```

摄影机默认应该能看到：

- 完整人物。
- 地面阴影。
- 后方白墙或无缝背景。
- 少量棚内空间感。

视觉决策记录：

- 2026-06-18：默认机位从 `z=5.2` 拉到 `z=6.2`，目标点从 `y=1.2` 降到 `y=1.05`。原因是 v0.1.0 实测画面里人物脚部和地面阴影余量偏少，导演预览需要更多地面关系。

## 6. 默认人物

```ts
export const DEFAULT_PERSON = {
  id: "person-1",
  name: "Actor A",
  position: { x: 0, y: 0, z: 0 },
  rotationY: 0,
  height: 1.75,
  skinTone: "#c9956d",
  clothingColor: "#2f3437",
};
```

MVP 人物可以是简化假人，但必须有可读的体块：

- 头部。
- 躯干。
- 手臂。
- 腿部。
- 正面方向提示。

人物材质建议：

- 皮肤粗糙度：`0.58` 到 `0.72`
- 衣服粗糙度：`0.75` 到 `0.95`
- 衣服默认偏深，便于观察边缘光和受光差异。

### 多人物默认站位

v0.2 起最多支持 5 个人。默认站位用于导演快速做 blocking，不用于群演模拟。

```ts
export const PERSON_STAGING_PRESETS = [
  {
    name: "Actor A",
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    skinTone: "#c9956d",
    clothingColor: "#2f3437",
  },
  {
    name: "Actor B",
    position: { x: -0.95, y: 0, z: -0.55 },
    rotationY: 0.18,
    skinTone: "#bd8b66",
    clothingColor: "#31475f",
  },
  {
    name: "Actor C",
    position: { x: 1.05, y: 0, z: 0.35 },
    rotationY: -0.22,
    skinTone: "#d0a078",
    clothingColor: "#4a4735",
  },
  {
    name: "Actor D",
    position: { x: -1.55, y: 0, z: 0.65 },
    rotationY: 0.34,
    skinTone: "#b77f5f",
    clothingColor: "#513642",
  },
  {
    name: "Actor E",
    position: { x: 1.65, y: 0, z: -0.85 },
    rotationY: -0.35,
    skinTone: "#c69270",
    clothingColor: "#343b50",
  },
];
```

视觉决策记录：

- 2026-06-18：新增人物不再横向等距堆到右侧。默认改为 A 居中、B 左后、C 右前、D 左前外侧、E 右后外侧，便于第一眼看出多人站位、遮挡和投影关系。
- 服装颜色使用低饱和深色组，而不是鲜艳色块。这样能区分人物，又不会干扰灯光颜色判断。
- 俯视图中人物朝向继续依赖头部/鼻尖方向和选中环，后续如果多人拥挤，再加文字标签或方向箭头。

## 6.5 白棚结构与道具

v0.3 起加入桌子、椅子、服装人台、背景板、可站人的圆形小舞台等拍摄沟通对象。具体代码规格见 `src/data/sceneObjects.ts`，这里记录视觉原则。

### 6.5.1 首批对象默认尺寸

| 对象 | 默认尺寸（宽 × 深 × 高，米） | 默认材质 | 主要用途 |
| --- | --- | --- | --- |
| 长桌 | `1.8 × 0.75 × 0.74` | 木质 | 访谈、产品桌面、人物与桌沿遮挡 |
| 圆桌 | `0.95 × 0.95 × 0.72` | 白色亚光 | 圆形桌面受光、产品小景 |
| 椅子 | `0.48 × 0.52 × 0.86` | 黑色亚光 | 椅背遮挡、坐姿预演 |
| 凳子 | `0.38 × 0.38 × 0.45` | 灰色亚光 | 矮坐具、高度参考 |
| 沙发简化块 | `1.7 × 0.72 × 0.78` | 布面 | 双人访谈、较大暗色块吃光测试 |
| 方形台座 | `0.7 × 0.7 × 0.8` | 白色亚光 | 产品台、白物体受光 |
| 圆柱台座 | `0.58 × 0.58 × 0.85` | 白色亚光 | 圆台产品、曲面受光 |
| 低矮平台 | `2.0 × 1.2 × 0.18` | 灰色亚光 | 人物站台、产品地台 |
| 直播圆形小舞台 | `1.2 × 1.2 × 0.3` | 白色亚光 | 人物站高半级、直播展示、圆形承载台 |
| 半身人台 | `0.42 × 0.26 × 1.25` | 布面 | 服装上半身、轮廓光沟通 |
| 全身人台 | `0.48 × 0.32 × 1.75` | 白色亚光 | 服装全身展示 |
| 背景板 | `3.2 × 0.12 × 2.4` | 白色亚光 | 局部背景、影子落板 |
| 纸箱 / 箱体 | `0.6 × 0.45 × 0.45` | 木质 | 箱体遮挡、产品包装占位 |

### 6.5.2 材质规则

- 白色亚光：用于判断白棚受光和柔阴影，粗糙度约 `0.88`。
- 黑色亚光：吃光明显，用于黑椅、黑旗或暗色道具占位，粗糙度约 `0.92`。
- 灰色亚光：中性参考材质，不抢灯光色彩。
- 木质：比白色更吃光，适合桌面和箱体，粗糙度约 `0.68`。
- 金属：第一版只做低反射金属，避免强镜面反射干扰判断。
- 玻璃：第一版只做透明占位，不做复杂折射和焦散。
- 布面：适合沙发、人台和吸光背景，粗糙度约 `0.94`。

### 6.5.3 俯视图表达

- 每个对象在俯视图要显示 footprint 外轮廓。
- 选中对象使用和人物/灯具一致的紫色选中反馈：`#d8b4fe`。
- 标签默认开启，但要能关闭，避免复杂场景里文字遮挡。
- 对象拖动范围默认限制在白棚内：`x = -3.8..3.8`，`z = -4.6..4.6`。
- 结构对象必须能 castShadow / receiveShadow，除非用户显式关闭。

### 6.5.4 承载面与人物高度

“服装人台”和“人物站台”必须分开：

- 服装人台是 mannequin，用于看服装、胸口和轮廓光。
- 可站人的人台在产品里叫“直播圆形小舞台”或“人物站台”，归入 `platform`。

人物 `position.y` 表示脚底离地高度。第一版交互：

- 人物面板提供“离地 Y”滑杆，范围 `0..1.5m`。
- 人物可以一键放到桌面、椅面、凳面、沙发坐面、台座、箱体或舞台台面。
- 承载面高度规则：
  - 桌子 / 凳子 / 平台 / 台座 / 箱体：`object.position.y + object.size.height`。
  - 椅子：`object.position.y + object.size.height * 0.56`。
  - 沙发：`object.position.y + object.size.height * 0.52`。
- 这版只改变人物高度和中心位置，不自动切换坐姿；坐姿和肢体会进入 v0.4。
- 后续如果需要“桌子移动时人物跟着走”，再加 attach-to-support 绑定关系。

### 6.5.5 默认沟通场景

v0.3 的推荐验收场景是：

- Actor A。
- 一张访谈长桌。
- 一把左侧椅子。
- 一个半身服装人台。
- 一块可移动背景板。

这个场景的目的不是美术好看，而是同时验证：桌沿遮挡、椅背投影、人台轮廓、背景板落影、A/B 比较有无结构。

## 7. 灯具类型映射

### 7.1 硬光

用途：模拟聚光、裸灯、强方向性光。

Three.js 建议：

- 主体使用 `SpotLight`
- 开启阴影。
- 阴影半径小。
- 光束角较窄。

默认参数：

```ts
export const HARD_LIGHT_DEFAULTS = {
  type: "hard",
  intensity: 2.2,
  distance: 9,
  angle: 0.42,
  penumbra: 0.08,
  decay: 1.4,
  shadowMapSize: 2048,
  shadowRadius: 1,
  softness: 0.05,
};
```

视觉目标：

- 人物和地面阴影边缘清晰。
- 鼻影、身体投影方向明确。
- 不要把整棚打成完全白。

### 7.2 柔光

用途：模拟柔光箱、大面积漫射灯。

Three.js 建议：

- 视觉光源可用 `RectAreaLight`。
- 阴影可用一盏低硬度 `SpotLight` 辅助，因为 `RectAreaLight` 的实时阴影支持有限。
- 柔光阴影用较大的 `shadow.radius` 和更高的 `penumbra` 近似。

默认参数：

```ts
export const SOFT_LIGHT_DEFAULTS = {
  type: "soft",
  intensity: 1.75,
  distance: 8,
  angle: 0.78,
  penumbra: 0.72,
  decay: 1.15,
  shadowMapSize: 2048,
  shadowRadius: 10,
  softness: 0.72,
  areaWidth: 2,
  areaHeight: 1.2,
};
```

视觉目标：

- 阴影边缘明显变宽。
- 人物受光更包裹。
- 地面阴影仍然看得见，但不死黑。

### 7.3 面光

用途：模拟 LED 面板、正面补光、平面光。

Three.js 建议：

- 使用 `RectAreaLight` 表达可见照明。
- 如果需要阴影，用弱 `SpotLight` 辅助。
- 面光通常不应该产生过重、过硬的阴影。

默认参数：

```ts
export const PANEL_LIGHT_DEFAULTS = {
  type: "panel",
  intensity: 1.25,
  distance: 7,
  angle: 0.95,
  penumbra: 0.85,
  decay: 1.05,
  shadowMapSize: 1024,
  shadowRadius: 14,
  softness: 0.9,
  areaWidth: 1.5,
  areaHeight: 1.5,
};
```

视觉目标：

- 更平、更宽。
- 适合表现补光。
- 阴影可以较淡，但不能完全消失。

## 8. 默认灯光方案

### 8.1 默认主光

这是打开 app 后的默认灯。

```ts
export const DEFAULT_KEY_LIGHT = {
  id: "light-key",
  name: "Key Light",
  type: "soft",
  enabled: true,
  position: { x: 2.8, y: 2.6, z: 2.4 },
  target: { x: 0, y: 1.2, z: 0 },
  intensity: 1.8,
  color: "#ffffff",
  colorTemperature: 5600,
  beamAngle: 45,
  softness: 0.65,
};
```

视觉目标：

- 右前方 45 度主光。
- 人物正面有清楚明暗关系。
- 地面影子向左后方延伸。
- 阴影边缘柔和但仍然可读。

### 8.2 默认补光

补光默认关闭，供用户打开测试。

```ts
export const DEFAULT_FILL_LIGHT = {
  id: "light-fill",
  name: "Fill Light",
  type: "panel",
  enabled: false,
  position: { x: -3.2, y: 1.8, z: 3.0 },
  target: { x: 0, y: 1.15, z: 0 },
  intensity: 0.75,
  color: "#f8fbff",
  colorTemperature: 6500,
  beamAngle: 70,
  softness: 0.9,
};
```

视觉目标：

- 打开后降低人物暗部反差。
- 不应制造强烈第二阴影。

### 8.3 默认彩色轮廓光

彩色轮廓光默认关闭，供用户打开测试彩色边缘。

```ts
export const DEFAULT_COLOR_RIM_LIGHT = {
  id: "light-rim",
  name: "Color Rim",
  type: "hard",
  enabled: false,
  position: { x: -2.4, y: 2.1, z: -2.6 },
  target: { x: 0, y: 1.25, z: 0 },
  intensity: 1.15,
  color: "#2f6bff",
  colorTemperature: undefined,
  beamAngle: 38,
  softness: 0.18,
};
```

视觉目标：

- 打开后人物肩膀、头部边缘出现蓝色轮廓。
- 背景和地面有轻微蓝色染色。
- 不能把整个人物正面染成蓝色。

### 8.4 灯光目标模式

v0.3 起灯光分为“对准一次”和“自动对齐”两层：

- `manual`：手动目标。灯使用当前保存的 `target`，人物移动后不自动跟随。
- `person`：锁定人物。灯实时对准指定人物胸口到脸部之间的位置，人物横移或升高后目标点随之更新。
- `peopleCenter`：多人中心。灯实时对准当前所有人物目标点的平均中心，适合群像和访谈。

视觉和交互规则：

- 默认灯保持 `manual`，避免打开旧方案时灯光突然变化。
- “对准一次”会把当前灯的 `target` 写成目标人物位置，并切回 `manual`。
- “锁定人物”和“多人中心”不改灯具位置，只更新照射目标。
- 如果人物被放到桌面、椅面或直播圆形小舞台上，`person` 模式必须使用新的 `position.y` 计算目标高度。
- 后续指定 target marker 可以作为第四种模式追加，不影响前三种。

## 9. 阴影规则

### 9.1 灯高与阴影长度

实现后必须符合：

- 灯高 `1.2m` 到 `1.8m`：地面阴影长且明显。
- 灯高 `2.2m` 到 `3.0m`：阴影中等长度，适合默认主光。
- 灯高 `3.5m` 到 `5.0m`：阴影短，更多落在人物脚下和后侧。

验收方式：

1. 保持灯的 `x/z` 不变。
2. 只改变 `y` 高度。
3. 截图对比，低灯位的地面阴影必须明显更长。

### 9.2 柔硬程度到阴影参数

建议用 `softness` 统一控制阴影边缘。

```ts
export function getShadowRadius(softness: number) {
  return 1 + softness * 13;
}

export function getPenumbra(softness: number) {
  return Math.min(0.95, 0.05 + softness * 0.85);
}

export function getShadowBias(softness: number) {
  return -0.00012 - softness * 0.00008;
}
```

参数范围：

- 硬光 `softness`: `0` 到 `0.2`
- 柔光 `softness`: `0.55` 到 `0.8`
- 面光 `softness`: `0.8` 到 `1`

### 9.3 白棚反射对阴影的影响

白棚反射越高，阴影越浅。

建议先用环境光和半球光近似：

```ts
export function getAmbientIntensity(wallReflectance: number) {
  return 0.12 + wallReflectance * 0.38;
}

export function getHemisphereIntensity(wallReflectance: number) {
  return 0.22 + wallReflectance * 0.42;
}
```

默认：

- `wallReflectance = 0.65`
- `ambientIntensity = 0.367`
- `hemisphereIntensity = 0.493`

视觉目标：

- 关闭主光后，人物仍有一点基础可见度。
- 打开主光后，阴影不是纯黑。
- 反射强度调高时，画面变平。
- 反射强度调低时，阴影变重。

## 10. 彩色光规则

彩色光需要明显，但不能脏。

建议规则：

- RGB 彩色光默认强度比白光低 `15%` 到 `30%`。
- 彩色光打到白墙后，可用低强度环境染色模拟。
- 多盏彩色光叠加时，限制总强度，避免整个白棚变成纯色块。

彩色环境染色近似：

```ts
export function getColorBounceIntensity(lightIntensity: number, saturation: number) {
  return Math.min(0.28, lightIntensity * saturation * 0.12);
}
```

视觉决策记录：

- 2026-06-18：彩色染色强度暂时保持 `0.12` 系数和 `0.28` 上限。RGB Rim 实测能看到地面和人物边缘染色，但不会把整个白棚糊成纯蓝，适合作为第一版预演强度。

常用色彩预设：

```ts
export const COLOR_PRESETS = [
  { name: "White", color: "#ffffff", temperature: 5600 },
  { name: "Warm White", color: "#ffd9b0", temperature: 3200 },
  { name: "Cool White", color: "#dceaff", temperature: 6500 },
  { name: "Red", color: "#ff3b30" },
  { name: "Blue", color: "#2f6bff" },
  { name: "Green", color: "#24c46b" },
  { name: "Cyan", color: "#2fd4ff" },
  { name: "Magenta", color: "#d63bff" },
  { name: "Amber", color: "#ff9f2f" },
];
```

## 11. 色温规则

如果第一版没有精确 Kelvin 到 RGB 转换，可以先使用预设映射。

```ts
export const COLOR_TEMPERATURE_PRESETS = [
  { label: "3200K", value: 3200, color: "#ffd2a1" },
  { label: "4300K", value: 4300, color: "#ffe8cf" },
  { label: "5600K", value: 5600, color: "#ffffff" },
  { label: "6500K", value: 6500, color: "#dceaff" },
];
```

后续需要更真实时，再加入 Kelvin 转 RGB 函数。

## 12. 曝光与画面控制

建议基础渲染设置：

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

如果画面太灰：

- 先微调主光强度。
- 再调 `toneMappingExposure`。
- 最后才改白棚材质颜色。

如果画面太白：

- 降低 `ambientLevel`。
- 降低 `wallReflectance` 映射出来的环境光。
- 降低主光强度。

## 13. 视觉调试预设

开发中建议内置这些预设，方便快速测试。

### Low Key Hard

- 硬光。
- 右前方。
- 高度 `1.8m`。
- 强度 `2.0`。
- 白棚反射 `0.25`。

应该看到长而硬的阴影。

### High Soft Commercial

- 柔光。
- 右前方偏高。
- 高度 `3.2m`。
- 强度 `1.8`。
- 白棚反射 `0.7`。

应该看到明亮、干净、柔和的广告片白棚效果。

### RGB Rim

- 正面弱白光。
- 后侧蓝色或紫色轮廓光。
- 白棚反射 `0.55`。

应该看到人物边缘有彩色，正面仍然可辨。

## 14. 验收截图标准

每次完成关键渲染功能后，至少检查这些截图：

1. 默认主光截图。
2. 灯高 `1.5m` 截图。
3. 灯高 `3.8m` 截图。
4. 硬光截图。
5. 柔光截图。
6. 彩色轮廓光截图。
7. 白棚反射低值截图。
8. 白棚反射高值截图。

通过标准：

- 人物不能黑成一团。
- 白棚不能全部过曝成纯白。
- 阴影方向必须和灯位一致。
- 灯高变化必须能被肉眼看出。
- 硬光和柔光必须能被肉眼分辨。
- 彩色光不能只改变 UI 色块，必须真的影响 3D 场景。

## 15. 第一版实现边界

第一版可以接受：

- 白棚反射是近似的。
- 柔光阴影是用辅助 SpotLight 近似的。
- 人物是假人而不是真实扫描模型。
- 色温是预设映射而不是严格物理计算。

第一版不接受：

- 灯光参数变化后画面几乎没变化。
- 没有实时阴影。
- 彩色灯只改变灯具图标，不影响人物和白棚。
- 只有自由 3D 视角，没有导演可用的摄影机视角。
- 阴影方向和灯位明显不一致。

## 16. v0.5.1 渲染可信度小修

详细执行规格见 `V0_5_1_RENDERING_CREDIBILITY_SPEC.md`。

状态：v0.5.1 已落地，用户真机视觉验收通过。

本轮目标不是做路径追踪或真实 GI，而是修三个最影响导演观感的近似：

1. **白棚一体感**：`hasCyclorama` 开启时，地面、圆角、后墙应尽量使用一体 surface，而不是明显的 plane + cylinder 拼接感。
2. **可见灯体**：柔光、面光、RGB 灯管应有可读的发光面或灯管形态；SpotLight 仍负责主要照明和阴影。
3. **地面反弹权重**：`floorReflectance` 应参与 ambient、hemisphere 和 colored bounce 计算。调高地面反射时，暗部和白棚彩色染色更明显；调低时，阴影侧更沉。

建议公式：

```ts
getAmbientIntensity(wallReflectance, floorReflectance)
  = 0.10 + wallReflectance * 0.30 + floorReflectance * 0.12

getHemisphereIntensity(wallReflectance, floorReflectance)
  = 0.18 + wallReflectance * 0.28 + floorReflectance * 0.23

getColorBounceIntensity(lightIntensity, saturation, wallReflectance, floorReflectance)
  = min(0.34, lightIntensity * saturation * (0.08 + (wallReflectance * 0.6 + floorReflectance * 0.4) * 0.12))
```

验收重点：

- 默认画面不要明显变亮或变灰。
- `floorReflectance` 高低差异要比 v0.5.0 更可见。
- 面板灯和 RGB 灯管在场景里应有可见灯体。
- A/B、保存/加载、v0.5.0 灯具预设不回退。
