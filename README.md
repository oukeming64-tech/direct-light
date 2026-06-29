# Direct Light · 白棚灯光预演

[![Project page](https://img.shields.io/badge/project%20page-showcase-111111.svg)](https://oukeming64-tech.github.io/direct-light/showcase/)
[![Live demo](https://img.shields.io/badge/live%20demo-online-brightgreen.svg)](https://oukeming64-tech.github.io/direct-light/)
[![Latest release](https://img.shields.io/github/v/release/oukeming64-tech/direct-light)](https://github.com/oukeming64-tech/direct-light/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Direct Light 是一个面向导演、摄影指导和灯光师的白棚灯光预演沙盘。它帮助团队在拍摄前快速讨论人物、灯位、灯具、颜色、镜头和阴影关系。

- 项目展示页：<https://oukeming64-tech.github.io/direct-light/showcase/>
- 在线 demo：<https://oukeming64-tech.github.io/direct-light/>
- macOS 桌面版：[Releases](https://github.com/oukeming64-tech/direct-light/releases/latest)
- English readme: [`README.en.md`](README.en.md)

## 当前状态

当前公开版本：`v1.0.3`。

- v1.0.0：首个正式大版本，多语言 UI（简体中文 / English / 日本語）。
- v1.0.1：自由拖动按白棚尺寸夹紧。
- v1.0.2：用户自定义 `.glb` 人像模型。
- v1.0.3：阴影漏光修复（法线偏移 + PCF 柔和阴影切换）。

## 能做什么

- 在白棚里摆人物、道具、灯和摄影机。
- 调灯位、高度、距离、亮度、颜色、色温、柔硬和附件。
- 切换自由视角、俯视、侧视和摄影机镜头视角。
- 保存方案，冻结 A/B 对比，导出预览图。
- 在网页和 macOS 桌面版中使用同一套前端。

## 快速开始

不想本地运行，直接打开 [在线 demo](https://oukeming64-tech.github.io/direct-light/)。

本地开发需要 Node.js >= 20.19：

```bash
npm install
npm run dev
```

常用脚本：

```bash
npm run lint
npm run build
npm run build:tauri
```

## 文档地图

当前入口：

- [`COLLABORATION.md`](COLLABORATION.md) — 当前状态、工作边界、文档地图。
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — 当前代码边界。
- [`RENDERING_SPEC.md`](RENDERING_SPEC.md) — 当前渲染口径。
- [`ROADMAP.md`](ROADMAP.md) — 当前路线。
- [`CHANGELOG.md`](CHANGELOG.md) — 面向用户的版本记录。
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — 贡献说明。

历史归档：

- 归档总览：[`docs/history/README.md`](docs/history/README.md)
- 完整旧 README / PRD：[`docs/history/snapshots/README_FULL_2026-06-29.md`](docs/history/snapshots/README_FULL_2026-06-29.md)
- 完整旧路线图：[`docs/history/snapshots/ROADMAP_FULL_2026-06-29.md`](docs/history/snapshots/ROADMAP_FULL_2026-06-29.md)
- 完整旧架构说明：[`docs/history/snapshots/ARCHITECTURE_FULL_2026-06-29.md`](docs/history/snapshots/ARCHITECTURE_FULL_2026-06-29.md)
- 完整旧渲染规格：[`docs/history/snapshots/RENDERING_SPEC_FULL_2026-06-29.md`](docs/history/snapshots/RENDERING_SPEC_FULL_2026-06-29.md)
- 阶段规格：[`docs/history/specs/`](docs/history/specs/)

## 许可证

[MIT](LICENSE)
