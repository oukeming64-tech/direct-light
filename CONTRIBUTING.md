# 贡献指南 · Contributing to Direct Light

感谢你对 Direct Light 的兴趣！这是一个面向导演、摄影指导和灯光师的白棚灯光预演工具。下面是参与开发需要知道的最小信息。

> English summary at the bottom.

## 环境要求

- Node.js **>= 20.19**（推荐 20 LTS 或 22 LTS）
- npm（仓库自带 `package-lock.json`，请用 npm 安装以保持锁定一致）

## 本地起步

```bash
git clone https://github.com/oukeming64-tech/direct-light.git
cd direct-light
npm install
npm run dev        # 启动 Vite 开发服务器，默认 http://localhost:5173
```

其它脚本：

```bash
npm run build      # tsc -b 类型检查 + vite 生产构建到 dist/
npm run lint       # eslint .
npm run preview    # 本地预览已构建的产物
```

桌面版（Tauri，可选，需 [Rust](https://www.rust-lang.org/tools/install) 工具链 + Xcode CLT）：`npm run tauri dev` 实时调试、`npm run tauri build` 出 `.app`/`.dmg`。代码在 `src-tauri/`，发版 CI 见 `.github/workflows/release.yml`，细节见 README「桌面版（macOS）」。Rust 依赖由提交的 `src-tauri/Cargo.lock` 锁定以保证构建可复现（避免上游 patch 漂移导致 CI 失败）；需要刷新锁文件时手动运行 Actions 里的「Update Cargo.lock」工作流（`.github/workflows/lockfile.yml`），不要在 `release.yml` 里临时 `cargo generate-lockfile`。

提交前请确保三件事都通过：**`npx tsc -b` · `npm run lint` · `npm run build`**。

## 代码结构在哪里

详见 [`ARCHITECTURE.md`](ARCHITECTURE.md)。一句话版本：

| 目录 | 职责 |
| --- | --- |
| `src/app` | 应用外壳与布局（`AppShell` 是薄布局壳，舞台/视图/对比在 `Stage`、`compare/*`） |
| `src/scene` | 所有 Three.js / R3F 3D 内容（白棚、人物、灯组、控光器材、相机 rig） |
| `src/state` | Zustand store（`store.ts` 只组合 `actions/*` 八组工厂 + `storeTypes`/`storeHelpers`） |
| `src/data` | 纯数据与规格表（默认场景、渲染数值、灯具/控光附件/姿态/机位预设、场景对象） |
| `src/domain` | 纯业务计算（相机数学、控光器材光学、灯光简介/汇总、场景 diff/迁移、承载面） |
| `src/ui` | 右侧参数面板、对象列表、顶栏等 React 面板（`LightPanel`/`ObjectList` 是兼容导出壳，真实代码在 `light-panel/*`、`object-list/*`） |
| `src/lib` | 通用工具（颜色、几何、localStorage） |

**护栏**：不要把实现逻辑塞回 `src/ui/LightPanel.tsx`、`src/ui/ObjectList.tsx`、`src/app/AppShell.tsx` 这些兼容/布局壳；新逻辑放进对应的 `light-panel/*`、`object-list/*`、`Stage.tsx`、domain/data 模块。`src/App.tsx` 必须保持薄入口。

## 设计取向（重要）

- **沟通向，不是物理准确。** 渲染目标是让导演一眼看懂灯位、影子、软硬、颜色关系，而不是电影级路径追踪。改动渲染时优先保证**可读、稳定、实时**。
- **每次迭代都要有可见画面改进**，不为技术炫技牺牲导演使用效率。
- 渲染数值集中在 [`src/data/rendering.ts`](src/data/rendering.ts)；改光影手感优先调这里，而不是散落到各处。
- 渲染规则与默认灯光见 [`RENDERING_SPEC.md`](RENDERING_SPEC.md)。

## 提交约定

- 一次提交聚焦一件事；信息写清「做了什么 + 为什么」。
- 涉及产品行为/视觉的改动，请说明如何在 A/B 对比里被看到（参考 `ROADMAP.md §11`）。
- 改了功能、修了重要 bug 或改变实现方向，请同步更新 [`COLLABORATION.md`](COLLABORATION.md) 的版本记录。

## 当前已知限制（第一版）

- 最多 6 盏灯（`MAX_LIGHTS = 6`）；默认仍是 Key/Fill/Rim 三盏（v0.8 多灯管理）。
- 暂不支持导入用户自定义灯具预设；自定义灯具预设 JSON 导入/导出计划放在 v0.9。
- UI 仅简体中文；英语 / 日语多语言会在核心功能和字段更稳定后再做。
- 桌面 / 封包工作台体验优先；移动端窄屏响应式后续单独排期。
- 渲染为导演沟通向近似，非物理准确。

完整路线见 [`ROADMAP.md`](ROADMAP.md)。

---

## English

Direct Light is a white-studio lighting previz sandbox. To contribute:

- Requires **Node.js >= 20.19**.
- `npm install` → `npm run dev` (Vite dev server on `:5173`).
- Before any PR, make sure **`npx tsc -b`**, **`npm run lint`**, and **`npm run build`** all pass.
- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for where code lives. Keep `src/App.tsx` thin; don't put logic back into the `LightPanel` / `ObjectList` / `AppShell` compatibility shells.
- The renderer is a **communication-oriented approximation**, not a physically accurate simulation — prioritize readable, stable, real-time feedback. Rendering numbers live in `src/data/rendering.ts`.
- Known limits: max 6 lights, Simplified-Chinese-only UI, desktop-first. See [`ROADMAP.md`](ROADMAP.md).
