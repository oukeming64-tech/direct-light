# Direct Light · 白棚灯光预演

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/live%20demo-online-brightgreen.svg)](https://oukeming64-tech.github.io/direct-light/)
[![Latest release](https://img.shields.io/github/v/release/oukeming64-tech/direct-light)](https://github.com/oukeming64-tech/direct-light/releases)
[![Desktop: Tauri 2](https://img.shields.io/badge/desktop-Tauri%202-24c8db.svg)](https://tauri.app/)

> 一个面向导演、摄影指导和灯光师的白棚灯光预演沙盘。在标准白色影棚里，实时预览人物站位、灯位、灯具、控光附件、白光与彩色光对人物和阴影的影响。
>
> A white-studio lighting previz sandbox for directors, DPs, and gaffers. 👉 English readme: [`README.en.md`](README.en.md)

**🔗 在线 demo：https://oukeming64-tech.github.io/direct-light/** —— 免安装、手机也能开，随 `main` 分支自动更新。

纯前端 Web 应用，无后端依赖。强调**沟通向、实时、可读**，而不是物理级精确渲染。区别于重型 3D / 付费布光软件，它即开即用、免安装，专为前期和团队沟通灯光方案而做。

![Direct Light 演示：调整摄影机机位后切到「镜头」视角，画面与光影实时变化](docs/media/hero.gif)

> *调整摄影机机位 → 切到「镜头」视角，相机实拍画面随之实时变化。[在线 demo](https://oukeming64-tech.github.io/direct-light/) ｜ [桌面版下载](https://github.com/oukeming64-tech/direct-light/releases)*

## 版本

**当前版本：`v1.0.2` —— 在首个正式版 `v1.0.0`（2026-06-24）之上新增用户自定义人像模型（含两个新人像）。** 白棚灯光预演的核心功能已全部就绪，并完整支持简体中文 / English / 日本語 运行时切换。

- 🌐 **在线版**：<https://oukeming64-tech.github.io/direct-light/> —— 免安装，随 `main` 自动更新。
- 🖥️ **macOS 桌面版**：[v1.0.2 Release](https://github.com/oukeming64-tech/direct-light/releases/latest) 的 `.dmg`（Apple Silicon / Intel 通用，未签名，首次打开见下方说明）。
- 📜 完整逐版更新见 [`CHANGELOG.md`](CHANGELOG.md)。

从一个简单原型起步，经过 v0.2–v0.10 十余个迭代（多人物、结构道具、人物姿态、灯具预设、控光附件与棚内器材、摄影机控制、更多光源、自定义灯具导入导出、多语言 UI），现作为首个正式版发布。

## 截图

| 灯位放低 → 地面投影拉长 | 彩色光染白整个白棚 | 切到摄影机镜头视角 |
| :---: | :---: | :---: |
| ![低灯位的长地面投影](docs/media/shot-shadow.png) | ![绿色彩光与柔光箱染棚](docs/media/shot-color.png) | ![镜头取景的人物画面](docs/media/shot-lens.png) |

## 功能特性

- 🎬 **白棚 + 人物**：可调白棚（尺寸、墙/顶开关、无缝弧形背景、墙地反射），层级骨架假人，多人站位（上限 5），基础姿态预设与关键关节微调。
- 🧍 **用户自定义人像模型**：把 `.glb` 放进 `src/models/` 即自动出现在人物「外观 → 用户模型」列表，运行期自动缩放落地、无需逐模型配置；随附两个新人像（哲学家 / 哲学家 (胸像)）。默认仍是程序化假人，自定义模型可选。
- 💡 **灯光系统**：最多 6 盏灯（硬光 / 柔光 / 面光），可调位置、高度、距离、角度、亮度、颜色、色温、光束角、柔硬；拖拽灯位；目标锁定（手动 / 锁定人物 / 多人中心）。
- 🔦 **灯具预设库**：8 个器械语义预设（COB、Nanlux Evoke 600C、LED 面板、RGB 灯管、菲涅尔等），一键套用默认光质后仍可手动微调。
- 🎛️ **控光附件 + 棚内控光器材**：柔光箱 / 蜂巢 / 反光罩 / 柔光布（灯上附件）+ 黑旗 / 反光板 / 柔光布框（棚内器材），带导演可读的近似光学。
- 🏠 **道具与结构**：桌椅 / 台座 / 服装人台 / 直播圆形小舞台 / 背景板等，可拖动、旋转、改尺寸/材质；人物可放到承载物上并实时跟随。
- 🎥 **多视图 + 摄影机**：镜头视角 / 自由视角 / 俯视 / 侧视；摄影机方位角、距离、高度、焦段、画幅、机位预设、从自由视角取景。
- 🔀 **A/B 对比 · 保存 · 导出**：方案保存到浏览器 localStorage，A/B 冻结对比带差异摘要，导出预览图用于团队沟通。
- 🌐 **多语言 UI**：运行时切换简体中文 / English / 日本語；语言只影响界面显示，不写入场景、保存方案、A/B 或自定义器械数据。

## 快速开始

不想本地跑？直接打开 [在线 demo](https://oukeming64-tech.github.io/direct-light/) 即可。本地开发：

前置：**Node.js >= 20.19**（推荐 20 / 22 LTS）+ npm。

```bash
git clone https://github.com/oukeming64-tech/direct-light.git
cd direct-light
npm install
npm run dev        # http://localhost:5173
```

打开后即是一个可用的默认白棚场景（一个人物 + Key/Fill/Rim 三盏灯 + 摄影机）。拖动灯、调高度、换颜色、加道具，画面与阴影实时变化。

常用脚本：

```bash
npm run build      # tsc -b 类型检查 + vite 生产构建到 dist/
npm run lint       # eslint
npm run preview    # 预览构建产物
```

## 桌面版（macOS）

除了网页版，Direct Light 也能打包成 macOS 桌面应用（基于 [Tauri](https://tauri.app/)，体积小、用系统自带 WebView）。

- **下载**：见 [Releases](https://github.com/oukeming64-tech/direct-light/releases) 页的 `.dmg`（通用包，Apple Silicon / Intel 通用）。
- **首次打开被拦**（应用未签名）：系统设置 → 隐私与安全性 → 拉到底 →「仍要打开」。
- **自行构建**（需 [Rust](https://www.rust-lang.org/tools/install) 工具链 + Xcode 命令行工具）：

  ```bash
  npm install
  npm run tauri dev     # 本地实时调试桌面版
  npm run tauri build   # 产出 .app / .dmg 到 src-tauri/target/release/bundle/
  ```

- **发版**：push 一个 `v*` tag（如 `git tag v0.7.2 && git push origin v0.7.2`），GitHub Actions 会在 macOS runner 上构建通用包并挂到 Releases（默认草稿，确认后发布）。

## 技术栈

Vite · React 19 · TypeScript · React Three Fiber + drei（Three.js）· Zustand · Tailwind CSS · Tauri（桌面封包）。

## 项目结构

| 目录 | 职责 |
| --- | --- |
| `src/app` | 应用外壳与布局、舞台、A/B 对比 |
| `src/scene` | Three.js / R3F 3D 内容（白棚、人物、灯组、器材、相机 rig） |
| `src/state` | Zustand store（薄组合 + `actions/*` 八组工厂） |
| `src/data` | 纯数据与规格（默认场景、渲染数值、灯具/附件/姿态/机位预设） |
| `src/domain` | 纯业务计算（相机数学、器材光学、场景 diff/迁移、灯光简介） |
| `src/ui` | 右侧参数面板、对象列表、顶栏 |
| `src/lib` | 通用工具（颜色、几何、localStorage） |

完整模块边界与护栏见 [`ARCHITECTURE.md`](ARCHITECTURE.md)。贡献流程见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

## 已知限制与设计取舍

- 最多 6 盏灯（`MAX_LIGHTS = 6`）；默认场景仍是 Key/Fill/Rim 三盏（v0.8 多灯管理）。
- 自定义灯具器械（v0.9）：可「存当前灯为器械」、本地保存、JSON 导入/导出；但自定义器械只存本地（localStorage），跨设备 / 分享需用「导出 / 导入」手动搬运。
- 多语言 UI（v1.0 起完整支持）：顶栏语言菜单可切 简体中文 / English / 日本語；界面、内置显示标签和 A/B 派生文案已全部三语化。用户输入名、品牌/型号、单位、数据 id 不翻译。见 [`V0_10_I18N_SPEC.md`](V0_10_I18N_SPEC.md)。
- 桌面 / 封包工作台体验优先；移动端窄屏响应式后续单独排期。
- 渲染是导演沟通向近似，不是物理准确模拟；白棚反射、柔光、彩色溢光和控光器材光学都以可读、稳定、实时为先。
- 黑旗 / 反光板 / 柔光布框的光学是运行时派生近似：黑旗不靠真实 mesh 阴影，反光板是虚拟弱补光，柔光布框修改有效光质。

## 许可证 · 贡献 · 致谢

- 许可证：[MIT](LICENSE)
- 贡献指南：[`CONTRIBUTING.md`](CONTRIBUTING.md)
- 更新记录：[`CHANGELOG.md`](CHANGELOG.md)
- 后续路线：[`ROADMAP.md`](ROADMAP.md)
- 致谢：特别感谢斯坦福的 Dr. Zhang（[@zczam](https://github.com/zczam)）贡献用户自定义人像模型，让无聊的白棚多了一些哲学和地牢的气息。

## 文档索引

- [`README.md`](README.md)：本文件，开源门面 + 完整产品需求文档。
- [`README.en.md`](README.en.md)：English readme.
- [`ARCHITECTURE.md`](ARCHITECTURE.md)：代码主干、模块边界和目录组织规范。
- [`RENDERING_SPEC.md`](RENDERING_SPEC.md)：渲染逻辑、默认灯光、白棚反射和阴影规则。
- [`ROADMAP.md`](ROADMAP.md)：后续多人物、结构道具、姿态、灯具预设、控光附件、更多光源、自定义灯具预设和多语言路线图。
- [`COLLABORATION.md`](COLLABORATION.md)：当前协作状态、下一步和文档地图；长历史见 `docs/history/`。
- [`CHANGELOG.md`](CHANGELOG.md)：面向用户的更新记录。
- `AGENTS.md` / `CLAUDE.md` / `HERMES.md`：精简后的 AI 协作入口与工作边界（开发者可忽略）。
- `V0_*_SPEC.md`：各阶段实现规格（相机 / 灯具 / 渲染可信度 / 控光附件 / 控光器材 / 多灯 / 自定义器械 / 多语言），供回溯。

---

# 完整产品需求文档（PRD）

下面是 Direct Light 的完整产品需求文档，定义产品定位、核心场景、灯光 / 阴影 / 白棚规则和数据结构，供产品和贡献者参考。

## 1. 项目定位

Direct Light 是一个面向导演、摄影指导和灯光师的白棚灯光预演工具。

它帮助用户在一个标准白色影棚环境中，快速模拟人物站位、灯光距离、灯光高度、灯具类型、白光和彩色光对人物和阴影的影响。

这个产品的重点不是替代专业 3D 渲染软件，而是成为一个轻量、直观、可沟通的导演灯光沙盘。

## 2. 核心问题

导演和摄影团队在拍摄前经常需要快速判断：

- 人站在白棚里的哪个位置更合适？
- 灯放在人物前方、侧方、后方时，脸和身体的受光有什么变化？
- 灯离人物近一点或远一点，明暗反差和阴影会怎么变？
- 灯位升高或降低后，地面阴影、鼻影、眼窝阴影会怎么变化？
- 硬光、柔光、面光、点光源产生的阴影软硬有什么区别？
- 白色灯光和彩色灯光混合后，人物和白色背景会出现什么颜色关系？
- 白棚环境的反光会不会让阴影变得太浅、画面太平？

## 3. 目标用户

主要用户：

- 导演
- 摄影指导
- 灯光师
- 美术指导
- 前期分镜和视觉开发人员

次要用户：

- 广告片创意团队
- 短片和 MV 创作者
- 影视教学用户
- 制片团队，用于前期沟通拍摄需求

## 4. 产品原则

1. 直观优先  
   用户应该能一眼看懂灯在哪里、人物在哪里、影子往哪里走。

2. 快速优先  
   调灯、调人、调镜头都应该是即时反馈，而不是复杂设置。

3. 沟通优先  
   结果应该能导出图片或灯位图，方便发给摄影、灯光、美术团队。

4. 物理合理，但不追求电影级精确  
   第一版只需要让阴影方向、长度、软硬、颜色关系大致可信。

5. 白棚特性必须明显  
   白色地面和白色墙面的反射应该影响画面，不能做成普通黑棚或开放空间。

## 5. 核心场景

### 场景 A：单人白棚广告片预演

导演想知道人物站在白色无缝背景前，用一盏主光从右前方打过来时，人物脸部和地面阴影的关系。

用户需要：

- 放置一个人物
- 放置一盏白光
- 调整灯的距离、高度、角度
- 观察人物受光和地面阴影
- 导出一张预览图

### 场景 B：彩色侧光测试

导演想测试一盏蓝色侧光和一盏红色背光在白棚中的混合效果。

用户需要：

- 添加两盏彩色灯
- 设置每盏灯的颜色和亮度
- 观察人物身体边缘、背景墙和地面颜色
- 对比不同颜色组合

### 场景 C：灯高变化测试

灯光师想判断同一盏灯在 1.5 米、2.5 米、4 米高度时，阴影长度和人物脸部阴影的差异。

用户需要：

- 选中一盏灯
- 用滑杆调节高度
- 实时看到地面阴影长度变化
- 保存几个方案做对比

### 场景 D：导演和摄影沟通灯位

导演想把某个预设灯位方案发给团队。

用户需要：

- 保存当前场景方案
- 导出镜头视图截图
- 导出俯视灯位图
- 标注灯具名称、位置、高度、距离和颜色

## 6. MVP 范围

第一版建议只做一个足够可用的小版本。

### 必须有

- 一个标准白棚空间
- 一个站立人物模型
- 最多 3 盏灯（原始 MVP；v0.8 已把当前上限提高到 6，默认仍是三盏）
- 灯光位置可拖拽
- 灯光高度可调
- 灯光距离可调
- 灯光角度可调
- 灯光亮度可调
- 灯光颜色可调，包括白光和彩色光
- 灯具类型可选：硬光、柔光、面光
- 实时显示人物受光
- 实时显示地面和背景阴影
- 支持摄影机视角预览
- 支持俯视图查看人物、灯、摄影机关系
- 支持保存当前方案
- 支持导出一张预览图片

### 暂时不做

- 真实品牌灯具的精确光度数据
- 复杂人物动画
- 多人物调度
- 服装布料细节
- 复杂材质系统
- 专业级路径追踪渲染
- 与真实摄影机曝光完全匹配

## 7. 第二阶段功能

后续可以加入：

- 多人物和人物站位调度
- 白棚结构、道具和人台，例如桌子、椅子、台座、背景板
- 人物基础姿态与肢体可调
- 真实灯具预设，例如 Aputure、ARRI、Nanlite 等
- 柔光布、柔光箱、蜂巢、黑旗、反光板、柔光布框
- 镜头焦段、机位高度、构图比例
- 多方案 A/B/C 对比
- 分镜列表
- 导出灯位图 PDF
- 导入参考图
- 使用 AI 根据情绪关键词生成灯光方案

第二阶段之后的拆分路线以 `ROADMAP.md` 为准。当前建议顺序是：多人物与站位、白棚结构/道具/人台、基础姿态、灯具器械预设库、控光附件。

## 8. 白棚空间

### 基础结构

白棚默认包含：

- 白色地面
- 白色后墙
- 白色左右墙，可开关
- 白色顶面，可开关
- 可选无缝弧形背景墙

### 可调参数

- 棚宽
- 棚深
- 棚高
- 墙面反射强度
- 地面反射强度
- 背景是否为无缝弧形
- 环境基础亮度

### 重要效果

白棚不是单纯的白色盒子，它应该影响灯光效果：

- 白墙会反弹光线
- 阴影会被白色环境填亮
- 彩色光打到白墙后会产生轻微环境染色
- 白棚反射越强，阴影越浅，画面越平

## 9. 人物系统

### MVP 人物模型

第一版可以使用简化人物模型，不需要写实角色。

人物应包含：

- 头部
- 躯干
- 手臂
- 腿部
- 基础脸部朝向

### 可调参数

- 位置
- 朝向
- 身高
- 肤色明暗
- 服装颜色
- 是否显示简化面部平面

### 关键表现

人物模型需要能清楚显示：

- 正面受光
- 侧面受光
- 背光轮廓
- 鼻影或脸部阴影的方向，第一版可以简化
- 身体投射到地面和背景上的阴影

## 10. 灯光系统

### 灯具类型

MVP 建议支持三种灯：

1. 硬光  
   类似点光源或聚光灯，阴影边缘清晰。

2. 柔光  
   类似柔光箱或大面积面光，阴影边缘柔和。

3. 面光  
   类似 LED 面板，光线更宽，适合模拟平面补光。

后续可增加：

- 聚光灯
- 菲涅尔灯
- COB 灯
- 灯管
- RGB 灯
- 顶光
- 地灯
- 反射光

### 灯光参数

每盏灯需要有这些参数：

- 名称
- 类型
- 位置 X
- 位置 Y
- 位置 Z，高度
- 朝向
- 与人物距离
- 亮度
- 颜色
- 色温
- 光束角
- 柔硬程度
- 开关状态

### 白光参数

白光应支持：

- 暖白，例如 3200K
- 中性白，例如 4300K
- 日光白，例如 5600K
- 冷白，例如 6500K

### 彩色光参数

彩色光应支持：

- RGB 颜色选择
- 饱和度
- 亮度
- 常用颜色预设，例如红、蓝、绿、紫、青、橙

## 11. 阴影系统

阴影是这个产品的核心价值之一。

### 需要表现

- 阴影方向
- 阴影长度
- 阴影浓度
- 阴影边缘软硬
- 多灯造成的多重阴影
- 彩色灯造成的彩色阴影
- 背景墙上的人物阴影
- 地面上的人物阴影

### 基础规律

系统至少应符合这些直觉：

- 灯越低，地面影子越长
- 灯越高，地面影子越短
- 灯越靠侧面，人物侧影越明显
- 灯越靠背后，轮廓光越明显
- 灯越近，明暗反差越强
- 灯越远，明暗变化越平
- 光源面积越小，影子越硬
- 光源面积越大，影子越软
- 白棚反射越强，阴影越浅
- 彩色光越饱和，人物和白墙染色越明显

## 12. 视图设计

### 主视图：镜头预览

展示导演最关心的画面。

需要显示：

- 摄影机看到的人物
- 人物受光
- 地面阴影
- 背景阴影
- 白棚整体感觉

### 俯视图

帮助用户看清空间关系。

需要显示：

- 人物位置
- 人物朝向
- 灯光位置
- 灯光照射方向
- 摄影机位置
- 灯到人物的距离

### 侧视图

帮助用户理解高度关系。

需要显示：

- 人物高度
- 灯光高度
- 灯光俯仰角
- 阴影方向示意

### 参数面板

选中人物、灯或摄影机后，右侧面板显示对应参数。

灯光参数面板应包含：

- 灯名
- 类型
- 开关
- 颜色
- 色温
- 亮度
- 高度
- 距离
- 角度
- 柔硬
- 光束角

## 13. 交互方式

### 物体操作

- 拖拽人物改变站位
- 调整人物离地高度，或把人物放到桌面、椅面、台座、直播圆形小舞台上
- 拖拽灯改变灯位
- 拖拽摄影机改变机位
- 点击物体后在参数面板精细调整

### 灯光操作

- 添加灯
- 删除灯
- 复制灯
- 开关灯
- 调颜色
- 调亮度
- 调高度
- 调距离
- 一键对准人物
- 锁定人物或多人中心自动对齐

### 方案操作

- 保存当前方案
- 复制方案
- 切换方案
- 对比两个方案
- 导出截图
- 导出灯位图

## 14. 数据结构建议

下面是给开发者的初始数据结构参考。

```ts
type SceneConfig = {
  studio: StudioConfig;
  people: PersonConfig[];
  objects: SceneObjectConfig[];
  lights: LightConfig[];
  camera: CameraConfig;
  presets: LightingPreset[];
};

type StudioConfig = {
  width: number;
  depth: number;
  height: number;
  wallReflectance: number;
  floorReflectance: number;
  hasCyclorama: boolean;
  ambientLevel: number;
};

type PersonConfig = {
  id: string;
  name: string;
  position: Vector3;
  rotationY: number;
  height: number;
  skinTone: string;
  clothingColor: string;
};

type LightConfig = {
  id: string;
  name: string;
  type: "hard" | "soft" | "panel";
  enabled: boolean;
  position: Vector3;
  target: Vector3;
  targetMode?: "manual" | "person" | "peopleCenter";
  targetPersonId?: string;
  intensity: number;
  color: string;
  colorTemperature?: number;
  beamAngle: number;
  softness: number;
};

type SceneObjectConfig = {
  id: string;
  name: string;
  kind:
    | "table"
    | "chair"
    | "stool"
    | "sofa"
    | "platform"
    | "plinth"
    | "cylinderPlinth"
    | "mannequin"
    | "backdropPanel"
    | "box";
  geometry:
    | "box"
    | "cylinder"
    | "chair"
    | "sofa"
    | "mannequinHalf"
    | "mannequinFull"
    | "panel";
  position: Vector3;
  rotationY: number;
  size: { width: number; depth: number; height: number };
  color: string;
  material:
    | "matteWhite"
    | "matteBlack"
    | "matteGray"
    | "wood"
    | "metal"
    | "glass"
    | "fabric";
  castShadow: boolean;
  receiveShadow: boolean;
  visible: boolean;
  showLabel: boolean;
};

type CameraConfig = {
  position: Vector3;
  target: Vector3;
  focalLength: number;
  aspectRatio: "16:9" | "4:3" | "1:1" | "9:16";
};

type LightingPreset = {
  id: string;
  name: string;
  sceneSnapshot: SceneConfig;
  previewImage?: string;
};

type Vector3 = {
  x: number;
  y: number;
  z: number;
};
```

## 15. 技术实现建议

### 推荐技术方向

如果做 Web App，建议使用：

- React 或 Next.js
- Three.js 或 React Three Fiber
- Zustand 或类似轻量状态管理
- Tailwind CSS 或项目已有 UI 方案

### 渲染策略

MVP 可以先用实时 3D 渲染：

- 白棚用简单几何体搭建
- 人物用简化人体模型
- 硬光用 SpotLight 或 DirectionalLight 模拟
- 柔光用 AreaLight 或多点光源近似
- 阴影使用实时 shadow map
- 白棚反射用环境光和半经验补光近似

不要在第一版尝试完整路径追踪。实时反馈比物理精度更重要。

### 关键开发目标

第一版开发完成后，用户应该可以：

1. 打开 app，看到白棚、一个人物、一盏灯和一个摄影机视角。
2. 拖动灯的位置，画面里的受光和阴影立即变化。
3. 调整灯光高度，看到地面阴影长度变化。
4. 把灯从白光改成彩色光，看到人物和白墙被染色。
5. 把灯从硬光改成柔光，看到阴影边缘变软。
6. 保存一个方案，再切换到另一个方案做对比。
7. 导出当前预览图用于沟通。

## 16. 界面初稿

建议界面分为四个区域。

左侧：对象列表

- 人物
- 灯光
- 摄影机
- 白棚

中间：主 3D 预览

- 默认显示摄影机视角
- 可切换自由视角
- 可切换俯视图和侧视图

右侧：参数面板

- 根据当前选中对象显示参数
- 灯光参数应该最完整

底部：方案栏

- 当前方案
- 保存方案
- 复制方案
- A/B 对比
- 导出

## 17. 默认示例场景

打开 app 时可以加载一个默认场景：

- 白棚尺寸：宽 8 米，深 10 米，高 5 米
- 一个站立人物，身高 1.75 米，站在中心偏后
- 一台摄影机，位于人物正前方 5 米，高 1.5 米
- 一盏主光，位于人物右前方 45 度，高 2.6 米，5600K 白光
- 白棚墙面反射强度 0.65
- 地面反射强度 0.55

## 18. 验收标准

MVP 可以用以下标准判断是否完成：

- 用户可以在 1 分钟内添加并调整一盏灯
- 调整灯位后，人物受光和阴影有明显变化
- 调整灯高后，地面阴影方向和长度有明显变化
- 切换硬光和柔光后，阴影软硬有明显区别
- 切换白光和彩色光后，人物和白棚颜色有明显变化
- 俯视图能清楚显示人物、灯、摄影机的位置关系
- 导出的预览图能用于团队沟通

## 19. 给 Claude Code 的实现说明

如果后续用 Claude Code 接手实现，请优先做一个可运行的 Web 原型，不要先做复杂后端。

建议第一步实现：

- 单页应用
- Three.js 白棚场景
- 简化人物模型
- 3 盏以内可调灯光
- 灯光参数面板
- 摄影机预览
- 俯视图
- 方案保存到浏览器本地存储

实现时请把“灯光变化能被用户立刻看见”作为最高优先级。视觉精度可以逐步提升，但交互反馈必须快速、稳定、清楚。
