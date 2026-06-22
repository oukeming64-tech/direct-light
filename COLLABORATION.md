# Direct Light 协作与版本记录

## 1. 文档目的

这份文档记录 Codex 与 Claude Code 在 Direct Light 项目中的分工、版本进度、已完成事项、待完成事项和关键决策。

每次完成一个清晰功能、修复一个重要问题或改变实现方向，都应该更新这里。

## 2. 当前状态

状态更新时间：2026-06-22

**当前基线：v0.7.1 已发布（2026-06-21）**。v0.7.0 已完成开源第一版：MIT `LICENSE`（© 2026 Keming Ou）、`CONTRIBUTING.md`、`CHANGELOG.md`、英文 `README.en.md`、README 开源门面、`package.json` 开源元数据、仓库卫生、GitHub Pages 自动部署和公开仓库 https://github.com/oukeming64-tech/direct-light。随后用户选定 **Tauri** 做 macOS 桌面封包，`src-tauri/`、`build:tauri`、`.github/workflows/release.yml` 均已落地；CI 已发布 **v0.7.0** 和 **v0.7.1** 通用 macOS `.dmg`，v0.7.1 为 latest。v0.7.1 同步 `package.json` / `tauri.conf.json` / `Cargo.toml` 到 `0.7.1`，顶栏显示 `v0.7.1`，并用用户提供的 1024×1024 图（影棚 / 人物 / 紫色光圈，源图 `app-icon.png`）替换 Tauri 默认图标。个人复盘 `个人重构/` 继续保留本地、不入仓库。开源和桌面封包不再是当前待办；**2026-06-22 用户与 Codex 调整后续路线：先做 v0.8 更多光源 / 多灯管理，再做 v0.9 自定义灯具预设导入/导出；多语言 UI 后置到核心功能和字段更稳定之后。**

**v0.8 多光源 / 多灯管理已通过用户视觉验收（Codex 复核，Claude Code 集成，2026-06-22）**：新增 `V0_8_MULTI_LIGHT_SPEC.md`，把 v0.8 拆成三刀：v0.8a 上限与新增灯闭环（`MAX_LIGHTS 3→6`、默认场景仍 3 灯、第 4-6 盏用简单确定性起始位置）、v0.8b 多灯列表可读性（保持左侧列表紧凑，必要时只抽 `LightRow.tsx`，不做灯组/solo/排序）、v0.8c A/B / 保存 / 导出 / 性能收口。规格明确不新增灯具型号、不做自定义 JSON、不做多语言、不新增第二套 light store；本轮按现有 `scene.lights`、A/B 摘要、保存/加载/导出路径完成收口，未引入运行时阴影预算或额外状态。

**v0.8a + v0.8b 代码已落地并通过用户 6 灯视觉验收（Claude Code 集成/审核；机械改动由 Claude Code 调用 OpenRouter glm-5.2 起草，2026-06-22）**：按 `V0_8_MULTI_LIGHT_SPEC.md` 完成上限与新增灯闭环 + 多灯列表可读性。① v0.8a：`src/data/defaults.ts` `MAX_LIGHTS 3→6`；`src/data/rendering.ts` 新增 `ADDITIONAL_LIGHT_STARTS`（3 个确定性灯位 `{0,3.0,3.2}`/`{3.4,2.2,-1.8}`/`{-3.4,2.2,-1.8}`）；`src/state/actions/lightActions.ts` `addLight()` 按 `slot = lights.length - 3` 取灯位（第 4/5/6 盏分别用 slot 0/1/2），slot 越界回退原默认 `{-2.6,2.4,2.2}`，`position: { ...start }` 不改常量；`duplicateLight`/`removeLight` 签名与行为不变；默认场景仍只 3 盏（Key/Fill/Rim）。② v0.8b：`src/ui/object-list/LightsSection.tsx` 分组标题改为 `灯光 N/MAX_LIGHTS`，保留满额 `满 6` 与复制禁用；文件仍 ~85 行，未到 spec 的 ~130 行阈值，故**不抽** `LightRow.tsx`。③ v0.8c：`sceneDiff.diffLights` 与 `summarizeLighting` 现有实现已天然表达灯数（`A开x/n · B开y/m`、`N 灯`），无需改；保存/加载/复制天然携带 `scene.lights`，导出截当前画布；性能预算按 spec §2c 交真机判断，本轮未预先加运行时阴影预算，保留 `LightRig` 现有 `lights.map` 简单渲染。④ 文档：`README.md`/`README.en.md`/`CONTRIBUTING.md`/`CHANGELOG.md` 中的当前能力上限文案已同步到 6 灯（保留历史 PRD「建议 MVP」与默认场景「Key/Fill/Rim 三盏」原文）。分工：v0.8a 常量/`addLight`、v0.8b 标题计数等机械改动由 Claude Code 调用 OpenRouter glm-5.2 起草，Claude Code 逐行审核（确认 `tsconfig` 无 `noUncheckedIndexedAccess`、索引访问安全）后落盘并集成。Codex 复核：源码无三灯硬限制、A/B/保存/导出路径未裁剪灯数组、本地预览加到 6 盏后 `灯光 6/6` 与 `满 6` 正常、console 无 error；`npx tsc -b`/`npm run lint`/`npm run build`/`git diff --check` 全绿（既有 1.2MB 大包提醒非本轮新增）。**用户视觉验收通过**：6 盏全开不黑屏、列表可扫读、可继续进入后续 v0.9。`TopBar`/`package.json`/Tauri 版本号是否升到 `0.8.0` 留待后续发布动作，本轮未升。

**两个交互 bug 修复已落地并通过用户手感确认（Claude Code，2026-06-22；与 v0.8 同一轮，非 v0.8 范围）**：① **人物可被拖出白棚**——`GroundDragController` 之前只把人物 XZ 夹到 ±20，远大于白棚地面（8×10）。改为在 `setPersonPositionXZ` 里按 `s.scene.studio` 尺寸把人物夹回地面 footprint（`x∈±(W/2−0.3)`、`z∈±(D/2−0.3)`，与 `duplicatePerson` 既有 ±3.8 约定一致），任何拖拽路径都不再出棚；确定性逻辑修复。② **自由视角左右拖动变成缩放**——查 three-stdlib `OrbitControls`：左键只能 ROTATE/PAN、不可能 DOLLY（只有中键 dolly），wheel 处理按 `deltaY` 缩放；用户真机是 Mac 触控表面鼠标/触控板把横扫当成带 `deltaY` 的滚轮→缩放。用户确认诊断后选定：**横扫=左右转、纵向滚动=缩放**。实现：`StudioScene.tsx` 新增 `FreeOrbitWheelRotate`（仅自由视角挂载），在 **window 捕获阶段**监听 `wheel`（canvas 之上的祖先，先于 OrbitControls 触发并能 `stopPropagation` 阻止其缩放）：仅当事件目标是 canvas 且 `|deltaX|>|deltaY|` 时，绕 OrbitControls `target` 按 Y 轴旋转相机（`WHEEL_ROTATE_SENSITIVITY=0.005`/单位、单次 clamp ±0.2rad），其余滚动照常交 OrbitControls 缩放；按住左键拖动转动不变。OrbitControls `update()` 每帧从相机实位重算 spherical，故手动旋转不被回弹。无新依赖、不改 `SceneConfig`。`tsc·lint·build·diff --check` 全绿。用户确认：横扫左右转、纵向滚动缩放、按住左键拖动仍转，人物拖动不再出棚。注：headless 预览无法复现 Mac 触控手势，按既定约定交用户肉眼确认。

**v0.8.0 已发布（网页 + macOS 桌面），并把桌面构建改成可复现（Claude Code，2026-06-22）**：用户验收通过后 push 到 `main`，版本号统一升到 `0.8.0`（`TopBar`/`package.json`/`tauri.conf.json`/`Cargo.toml`）。① 网页：push `main` 触发 GitHub Pages 部署成功，在线 demo 已更新。② 桌面：push `v0.8.0` tag 触发 `release.yml`，**首次构建失败**——上游 `time` 0.3.50（当天发布）编译报 `unresolved import time_macros::timestamp`；根因是仓库**没有提交 `src-tauri/Cargo.lock`**，每次 tag 构建都重新解析依赖，于是拉到了刚发布的坏版本（v0.7.1 当时碰巧解析到好版本才过）。先在 `release.yml` 加一步 `cargo generate-lockfile` + `cargo update -p time --precise 0.3.49` 救急，把 `v0.8.0` tag 移到修复 commit 重新构建，**通用 macOS `.dmg` 构建成功（5m57s）并已发布**（草稿→用户授权后 `gh release edit --draft=false` 发布）。③ **长期修复**：新增 `.github/workflows/lockfile.yml`（`workflow_dispatch`，ubuntu 上 `generate-lockfile` + 固定 `time` 0.3.49 后把 `src-tauri/Cargo.lock` 提交回仓库），已跑一次并提交 4762 行的 `Cargo.lock`（`time` 锁到 0.3.49）；随后把 `release.yml` 的临时 pin 步骤删掉，改为直接用已提交的 `Cargo.lock` 构建，构建从此可复现、不再随上游 patch 漂移；需要刷新锁文件时手动跑 “Update Cargo.lock” 工作流即可。是否进一步加 `--locked` 严格校验留作可选硬化。

**v0.6e 收口已落地并通过用户视觉验收（Claude 主实现，Codex 文档/版本收口，2026-06-21）**：按 `V0_6E_CLOSEOUT_SPEC.md` 完成 v0.6 控光线最后收口，不加新光学、不加新器材。① A/B 差异摘要已把「控光器材」从「道具」中拆成独立 chip；② 保存/加载/复制/A-B 冻结交换回归通过，附件 `modifierId`、gear 对象和派生光学不丢；③ 导出截图回归通过，gear 视觉与 gear 光学可用于沟通；④ README 已补开源前限制说明（`MAX_LIGHTS=3`、仅中文、桌面优先、渲染为沟通向近似）。v0.6a-e 全线完成；TopBar 当时由 Codex 升到 `v0.6e`。后续 v0.7 / v0.7.1 已完成，当前不要再把 v0.7 当作下一步。

**v0.6d 控光器材近似光学已落地并通过用户真机视觉验收（Hermes 起草纯模块 + Claude 审核/集成，2026-06-21）**：按 `V0_6D_OPTICS_SPEC.md`，给 v0.6c 的 3 个 gear 一个导演能看懂的近似光学，**不开 `castShadow`、不写原始灯光/gear 参数**，全部由当前场景纯计算推导。① 纯模块 `src/domain/controlGearOptics.ts`（**Hermes 逐字按 Claude 的交接文档 `HERMES_HANDOFF_V0_6D.md` 起草**，Claude 逐行审核无 bug）：`getGearLightOptics`（黑旗 cut §5.1 + 柔光布框 diffusion §7，同灯各取最强一个）、`applyGearOpticsToLightParams`（合成到 v0.6a effective params 之上并按 `EFFECTIVE_LIGHT_LIMITS` clamp）、`getNegativeFillFactor`（黑旗近人物吃反弹 §5.2，每块 −0.06 封顶 0.16）、`getReflectorFillLights`（反光板虚拟补光 §6，最多 2 块，返回未缩放 appIntensity 0..0.38）+ `GearLightOptics`/`ReflectorFillLight` 类型 + 几何 helper（工作面中心 `y=pos.y+h*0.725`、法线 `+Z 经 rotationY`、路径/朝向打分，阈值逐字 §4）。② 集成（Claude）：`LightRig.tsx` 给每盏灯 `applyGearOpticsToLightParams(getEffectiveLightParams, getGearLightOptics(light,target,objects))` 上有效参数，并把反光板虚拟补光渲染成 no-shadow `pointLight`（intensity `× SPOT_INTENSITY_SCALE`、distance 4.5、decay 1.6）；`lighting.ts` 的 `computeGlobalFill` 加可选 `objects/people`，按 `negativeFillFactor` 压 ambient/hemisphere/bounce，并把 gear spill 并入每盏灯的彩色反弹；`StudioScene.tsx` 把 `scene.objects/people` 传给 `GlobalFill`/`LightRig`。③ 反光板**不**写 `scene.lights`、不占 `MAX_LIGHTS`、不投影。`tsc·lint·build` 全绿；Claude 确定性自测（esbuild 打包纯模块跑断言）：无 gear=identity；黑旗挡光路 亮度×0.62/光束×0.86/spill×0.55（1.8→1.116）；黑旗 edge-on 效果归零；柔光布框 ×0.76/+8°/柔+0.16/spill×0.82；黑旗近人物 negativeFill 0.94；反光板近且被照 1 盏补光 int 0.042（克制）、5m 外 0 盏；浏览器加 3 gear 零 console 报错。用户真机视觉验收通过；验收修复：`ObjectPanel` 对 gear 使用 `isControlGearKind(obj.kind)` 隐藏材质选择器，避免把黑旗/反光板/柔光布框改成普通材质，颜色/尺寸/接收阴影仍保留；Codex 收尾把 TopBar 升到 `v0.6d`。后续 v0.6e 收口也已完成。

**v0.6c 棚内独立控光器材已通过用户真机视觉验收（Claude 起草规格 + 集成；用户定稿范围，2026-06-20；Codex 复核 2026-06-21）**：新增 `V0_6C_GEAR_SPEC.md`（本轮 Codex 无额度，用户授权 Claude 起草并集成）。把控光板做成**现有 object 系统的新对象类别**，复用 add/update/duplicate/remove/拖拽/`ObjectPanel`/保存/AB/迁移，新增面最小；**这一版零光学**（`castShadow:false`/`receiveShadow:false`，不遮挡不反射），真实遮挡/反射已在 v0.6d 做成近似光学。用户定稿：**去掉「旗板」**（旗板=黑旗，白旗板=反光板），只做 3 种——**黑旗 / 反光板 / 柔光布框**，并新增 `scrimWhite` 半透明白材质。① 类型 `types.ts`：`SceneObjectKind` 加 `blackFlag`/`reflectorBoard`/`diffusionFrame`，`SceneObjectGeometry` 加 `gearPanel`，`SceneObjectMaterial` 加 `scrimWhite`。② 数据 `src/data/sceneObjects.ts`：加 `scrimWhite` 材质规格、3 个 gear 预设（`group:'gear'`）、`SceneObjectPreset.group?` 字段、`CONTROL_GEAR_KINDS`/`isControlGearKind`。③ 渲染 `src/scene/SceneObjects.tsx`：新增 `gearPanel`（薄板工作面 + 深灰立柱 + 底座；立柱/底座用固定深灰，避免反光板把支架染白；工作面法线=局部 +Z 经 rotationY 旋转，为 v0.6d 光学固定几何约定）。④ UI `src/ui/object-list/SceneObjectsSection.tsx`：加道具下拉按 `group` 分「道具 / 结构」「控光器材」两个 optgroup。⑤ 迁移 `sceneMigration.ts`：`objectGeometryByKind` 补 3 个新 kind→`gearPanel`。⑥ `TopBar` 版本 `v0.6b → v0.6c`。`tsc·lint·build` 全绿；Codex 浏览器烟测：端口 5173 首屏正常、canvas 非空、顶栏 `v0.6c`、导演简介联动正常、依次加 3 gear kind 正确且零 console error、只加 gear 时人物「放到承载物」仍显示“先添加桌椅或舞台”（佐证 gear 不是承载面）。用户确认 3D 形体可用。

**v0.6b 附件视觉 + 导演视角简介已通过用户视觉验收（Claude 集成/审核；用户授权由 Claude 代 Codex 做验收，因本轮 Codex 已无额度，2026-06-20）**：按 `V0_6B_VISUAL_BRIEF_SPEC.md`，不动 v0.6a 光学数值，只补两件沟通体验。① 附件可见灯体：`src/scene/LightModifierVisual.tsx`（v0.6b 草稿由 Hermes 起草、Claude 审核接线，后按用户要求改为**立体形体**）——中号柔光箱=带发光白面的 3D 箱体（最大）、标准反光罩=浅金属锥/碗罩（开口朝被摄、明显小于柔光箱）、蜂巢=贴灯头的深色控光短环 + 十字暗线（最小）、柔光布=薄半透明扩散板（只比灯头略大，仍是薄片不是软箱）；偏移按附件类型分别取 0.22–0.4m，`lookAt(target)` 让灯体开口朝被摄；这些灯体不 `castShadow`、不遮挡光线，故 v0.6a 有效光质公式零改动。已在 `LightRig.tsx` 由 `getLightModifierPreset(...).visualKind` 驱动渲染。② 导演视角简介：`src/domain/lightBrief.ts`（纯函数，文案逐字照 spec §4 四种组合 + 效果短语表）+ `src/app/DirectorLightBrief.tsx`（仅「镜头视角 + 选中对象是灯」时显示，左下轻量状态条，`pointer-events-none`/`truncate` 不遮人物），已接进 `Stage.tsx`。③ Claude 集成收尾：`TopBar` 版本号 `v0.6a → v0.6b`（草稿漏改）。`tsc·lint·build` 全绿；浏览器 DOM 确定性自测：简介默认=`Key Light · 自定义灯具 · 无附件`、挂 Nanlux+柔光箱=`Key Light · Nanlux Evoke 600C · 中号柔光箱 · 柔光主光`、清空回退正确、仅镜头视角+选中灯时出现、4 种附件切换零 console 报错。3D 灯体观感按《工作约定》第 2 条交用户肉眼验收（R3F 预览偶发黑屏，自验不可靠），用户视觉验收通过；后续 v0.6c 也已完成并通过。

**v0.5.0 已通过用户真机验收（Claude 集成 + Hermes 起草 `fixturePresets.ts`，Codex 复核收尾）**：v0.5 灯具器械预设库，按 `V0_5_FIXTURE_SPEC.md`。① 类型（Claude）：`types.ts` 加 `FixtureCategory`/`FixtureColorEngine`(含 `tungsten`)/`FixturePowerClass`/`FixtureUse` + `LightConfig.fixturePresetId?`。② 数据（Hermes 逐字起草、Claude 审核）：`src/data/fixturePresets.ts` 8 个预设（600W COB 白/双色温、Nanlux Evoke 600C、LED 面板、RGB 灯管、菲涅尔、小型 RGB 效果灯、暖色实景灯）+ `FixturePreset` 类型，数值/文案逐字照当前 spec。③ store（Claude）：`actions/lightActions.ts` 加 `applyFixturePreset(lightId, fixturePresetId)`——按 spec §7 只改 type/intensity/beamAngle/softness/distance/color/colorTemperature + fixturePresetId，保留 id/name/enabled/position/target/targetMode/targetPersonId；`undefined` 只清标记不动参数、未知 id no-op。④ UI（Claude/Codex）：`LightPanel`「基础」区顶部加「器械」下拉（默认 `自定义参数` + 8 灯具 + 辅助文案），Header 副标题选预设后显示器械名；Codex 复核补齐 `全彩/双色温/暖色/白光` 能力标签。⑤ 兼容：`fixturePresetId` 可选，旧方案/迁移不崩、随场景保存/AB 天然携带，无需改 sceneMigration/sceneDiff。**协作插曲**：Hermes 逐字抄 spec 撞到 `tungsten` 不在枚举的类型错，**正确地停下来标记而非瞎改**——根因是 Codex 更新了 spec §4（加 `tungsten`）而 Claude 的 types.ts 落后一步，Claude 一行对齐即解，Hermes 的文件原样验收通过。`tsc·lint·build` 全绿；Claude 确定性自测通过；用户真机确认 spec §10 产品验收通过。顶栏 `v0.5.0`。

**v0.5.1 渲染可信度已通过用户真机验收（Claude 实现，Codex 复核，2026-06-20）**：按 `V0_5_1_RENDERING_CREDIBILITY_SPEC.md` 完成三件小修：① `src/scene/studioGeometry.ts` + `Studio.tsx` 使用一体 cyclorama surface，减少地面/后墙拼接感；② `src/scene/LightVisual.tsx` + `LightRig.tsx` 让柔光、面光、RGB 灯管出现可见灯体；③ `floorReflectance` 进入 ambient/hemisphere/colored bounce 公式，让地面反弹对暗部和彩色棚染更可读。Codex 复核补齐“可见灯体本体也能点击/拖拽光源”，并把顶栏改为 `v0.5.1`。基础检查 `lint`/`build` 通过；桌面浏览器烟测 canvas 非空；用户真机验收通过。已知非阻塞：390px 窄屏布局会挤掉 3D 画布，当前产品按桌面/封包工作台验收，移动端响应式后续单独排期。范围仍不含 v0.6 控光附件、不改 v0.5.0 灯具预设、不提高灯光数量上限。

**v0.6a 控光附件 MVP 已通过用户真机验收（Claude 集成，Codex 复核调值，2026-06-20）**：新增 `V0_6_MODIFIER_SPEC.md`，把 v0.6 拆为 0.6a-0.6e。第一刀只做“灯上附件 MVP”：中号柔光箱、蜂巢、标准反光罩、柔光布；用 `modifierId?: string` + 附件数据表 + 有效光质 helper 影响亮度/光束/柔硬/彩色溢光，不直接改坏原始灯光参数。Codex 预写 `src/types.ts` 的 `modifierId?: string`、`src/data/lightModifiers.ts`、`src/domain/lightModifiers.ts`；Claude 接入 `applyLightModifier`、`LightModifierSection`、`LightRig` effective params、`lighting.ts` spill multiplier 和 `sceneDiff` 附件差异。Codex 复核发现中号柔光箱与柔光布在偏柔灯上会一起撞到 softness/beam 上限、真机观感过近，因此把柔光箱调成更宽更软且略暗（`*0.76/+24°/+0.36/*0.95`），把柔光布调成明显更暗、只轻微变软和扩散（`*0.48/+4°/+0.12/*1.12`）。用户真机验收通过后，顶栏同步到 `v0.6a`。后续 v0.6b/c/d/e、v0.7 和 v0.7.1 均已完成；当前后续主线是 v0.8 多灯管理、v0.9 自定义灯具预设。

**v0.6 前开源结构清理已由 Codex 落地（2026-06-20，无行为变更）**：为避免开源前大文件继续膨胀，Codex 直接拆分三处偏胖入口并同步架构护栏。① `src/app/AppShell.tsx` 从 279 行主壳拆为布局壳 + `src/app/Stage.tsx` + `src/app/ViewBadge.tsx` + `src/app/canvasLayout.ts` + `src/app/compare/*`，A/B 对比画布不再塞在 AppShell。② `src/ui/ObjectList.tsx` 改为兼容导出壳，人物/灯光/道具结构/摄影机/白棚分别拆到 `src/ui/object-list/*`，公共 row 工具和分组组件独立。③ `src/ui/LightPanel.tsx` 改为兼容导出壳，灯光基础/颜色/位置/目标/光束拆到 `src/ui/light-panel/*`；v0.6a 附件 UI 已落在 `LightModifierSection.tsx`。`npm run lint` 与 `npm run build` 通过；build 仍有既有大包提醒（Three/R3F 主包 1.21MB），不影响本次无行为重构。已同步 `ARCHITECTURE.md`、`CLAUDE.md`、`HERMES.md`，Claude/Hermes 后续不得把实现逻辑塞回壳文件。

**v0.4.8 已落地（Claude 集成，8 个 action 工厂由 OpenRouter glm-5.2 逐字搬运起草、Claude 逐组审核）**：`store.ts` 无行为变更轻量拆分，严格按 `STORE_ACTION_SPLIT_SPEC.md`。`store.ts` 从 685 行降到 38 行（仅初始 state + 组合 8 个 factory）；新增 `storeTypes.ts`（DragTarget/CompareSnapshot/Store/StoreSet/StoreGet，从 store re-export 保持公共接口）、`storeHelpers.ts`（mapLights/chestTarget/carryBoundPeople/detachPeopleFrom）、`actions/{view,compare,studio,camera,light,person,object,preset}Actions.ts`（每个导出 `createXActions(set[,get]): Pick<Store,...>` 工厂，单文件均 <150 行）。42 个 action 全部逐字搬运、分到 8 组各一次；`create<Store>` 要求完整 Store，tsc 通过即证明无遗漏。规格分组：`updatePerson`/`setPersonPositionXZ` 归 person、`updateCamera`+6 个相机 action 归 camera。调用方仍从 `../state/store` 引 `useStore`，零改动。`tsc·lint·build` 全绿；浏览器实测应用完整渲染、面板读数与重构前一致（1.80/2.60/3.69/49）、零 console 报错。审核中抓到并修复 glm 在 `setCameraFromFree` 漏写一个右括号。无依赖新增、无产品行为变化。顶栏 `v0.4.8`。

**v0.5 灯具器械库规格历史记录（2026-06-20，已落地并验收）**：`V0_5_FIXTURE_SPEC.md` 是 v0.5.0 的源规格。关键拍板：COB/菲涅尔保持偏硬，LED 面板和 RGB 灯管更软更宽，RGB 灯管/小型效果灯默认出彩色，暖色 practical 使用 `tungsten` 语义；UI 增加 `全彩/双色温/暖色/白光` 能力标签；§10 验收清单明确“自定义参数只清空器械、不重置当前数值”。Hermes 仍只能按明确指定起草小 patch，不能独立完成 v0.5。

**v0.4.7 已通过用户真机验收（Claude 集成，cameraMath/cameraPresets/CameraPanel 由 OpenRouter glm-5.2 起草）**：v0.4c 摄影机控制，严格按 `V0_4C_CAMERA_SPEC.md`。① 数据：`CameraConfig` 加 `targetMode?`/`targetPersonId?`，`sceneMigration` 旧方案补 `manual`+第一个人物，随方案/AB/导出天然携带。② 目标模式：摄影机面板「目标」区 `手动/锁定人物/多人中心`+`锁定对象`下拉+`对准 Actor X 一次`；锁定/多人中心在镜头视角**渲染端实时跟随**（`getEffectiveCameraTarget`，镜像灯光），人物移动/绑定承载物移动都跟。③ 机位：「机位」区改为 `方位角/距离/高度/看向高度`（新增 `src/domain/cameraMath.ts` 以 target 为中心做极坐标正反算，改看向高度自动切 `manual`）。④ 机位预设：新增 `src/data/cameraPresets.ts` 5 个（`正面全身/45°侧前/高机位/低机位/俯拍沟通`），点击写 position/target/焦段/画幅并切 `manual`。⑤ 从自由视角取景：`store.requestFreeCameraCapture`+`freeCameraCaptureRequestId`，`StudioScene` 内 `FreeCameraCaptureBridge` 读自由视角 R3F 相机+OrbitControls target 写回主摄影机并切镜头视角；非自由视角时按钮只切到自由视角。⑥ A/B：`sceneDiff` 摄影机 diff 纳入 `targetMode` 和锁定人物 id。⑦ 棚内夹紧（用户追加需求，原 spec 无）：`cameraMath.clampCameraInsideStudio` 把摄影机约束在敞开棚体内（侧墙内 ±(W/2−0.4)、地面上、天花下、后墙前，前方 +Z 敞开），镜头模式在 store 写入与 `CameraRig` 渲染双重夹紧、自由模式 `StudioScene.FreeCameraClamp` 每帧夹紧（在 OrbitControls priority −1 之后运行，稳定无抖），转动/绕行到墙后改为贴墙滑动而非「一片白」。分工：纯模块（cameraMath/cameraPresets/CameraPanel）外包 glm-5.2 起草、Claude 逐行审核落盘；类型/store/迁移/取景桥/夹紧/diff 由 Claude 自写。`tsc·lint·build` 全绿；Claude 已确定性自测：面板挂载、预设 `45°侧前` 极坐标读数正确（方位角 45°/距离 5.94m）、夹紧生效（方位角 90° 推距离到 10 → 夹到 3.60m），零 console 报错。⑧ 两个用户反馈修复：(a) **自由/俯视可拖拽摄影机机位**——`DragTarget` 加 `'camera'`、新增 `setCameraPositionXZ`（夹紧）、`CameraGizmo` 加 `onPointerDown` 起拖、`GroundDragController` 加 camera 分支，和灯/人/物一致（spec §6 原列为暂不做，用户要求后补上）。(b) **修复自由模式「看向高度」滑杆带动人和白棚位置**——根因是自由视角 OrbitControls 的 `target` 直接绑到 `scene.camera.target` 且每次渲染重设，滑杆改 `target.y` 触发重渲染 → 轨道枢轴被拽高 → 整个自由视角平移（误以为场景动了）；改为 `useMemo([view])` 在进入自由视角时捕获一次枢轴，之后 `camera.target` 变化不再拽动自由视角（取景桥仍读实时 controls.target）。用户已真机验收通过：spec §8 9 项、转动到墙后不再一片白、可拖摄影机机位、自由模式调看向高度不再移动场景。

**v0.4.6 已通过用户真机验收（Hermes 起草，Codex 复核修正，用户真机验收通过 2026-06-19）**：A/B 对比产品引导升级。用户当时在真机确认 A/B 引导可用、定稿，并进入 v0.4c 摄影机控制；当前 v0.4c 已在 v0.4.7 通过验收。（本条 v0.4.6 用户验收结论由 Claude 代记，因 Codex 本轮已达额度上限。）① 新增差异摘要条：`src/domain/sceneDiff.ts` 提供 6 类（灯光/人物位置/道具/姿态/摄影机/白棚）category-level diff，纯函数、tolerance-aware；`AppShell` 在 CompareControls 下方渲染一行彩色摘要，`相同`灰色、`不同`紫色高亮，让导演一眼看出这次对比主要在看什么。② B 槽空状态重写：提供三个清晰下一步动作——「冻结当前为 B」、「从已存方案选」、「退出对比回到普通视图」；不再是单行提示。Codex 复核修正：进入对比不再自动生成 B，因此空状态引导卡可以真实出现。③ B 槽冻结时间：`CompareSnapshot` 增加 `frozenAt?`，`freezeCompareB`/`swapCompare`/`setCompareB` 三处写入；B pane 角标上方加「冻结于 XX秒前/XX分钟前」相对时间副标题；CompareControls 右侧显示 B 名称和时间。④ 文案更明确：top strip 改为「左 A=当前编辑（右侧面板改这里） · 右 B=冻结参考（不会跟着变）」；A pane 改「A · 当前编辑（可改）」；swap tooltip 明说「把 B 变成正在编辑的 A（左边），原来的 A 退到 B（右边）」。⑤ 验收通过：首次进入对比能看到开始引导；冻结后 A/B 关系清楚；改灯光后 B 不动、摘要更新；交换后左右角色清楚；切出再切回不黑屏。`lint·build` 全绿。

**v0.4.5 已落地并通过用户真机验收（Hermes 起草，Codex 复核）**：attach-to-support 实时绑定。`PersonConfig` 增加 `supportObjectId`/`supportLocalOffset`/`supportRotationOffset`，承载物移动/旋转/更新联动绑定人物，删除/回到地面/手动挪人时解绑；Codex 复核修复：换姿态但位置不变时不误解绑，手动改人物朝向会更新相对朝向。顶栏 `v0.4.5`，用户真机验收通过。

**v0.4.4 已落地（Claude Code，用户视觉验收通过）**：v0.4b 坐姿与承载物联动。承载面区分「可坐/可站」；坐姿骨架加折叠双腿；前臂内旋自由度修复让叉腰到位；3 个坐姿预设。顶栏 `v0.4.4`。

**Hermes 协作入口已建立（Codex，2026-06-19，文档更新）**：用户已安装 Hermes。新增 `HERMES.md`，明确 Hermes 是辅助代码草稿 agent，不负责产品方向；Codex 定规格，Hermes 起草小 patch，Claude/Codex 审核集成，用户做人眼体验验收。`HERMES.md` 已写入标准交接格式、架构边界、验证要求；attach-to-support 规格已在 v0.4.5 落地，文档现改为已完成行为说明和下一轮 Hermes 小任务边界。

**v0.4.3 已落地（Claude Code）**：完成 v0.4b 前置轻量拆分（`ARCHITECTURE.md §9`），不改产品行为。① `ParamPanel.tsx` 从 409 行降为 26 行纯分发；灯光/人物/道具/摄影机/白棚五个面板拆成 `LightPanel.tsx`/`PersonPanel.tsx`/`ObjectPanel.tsx`/`CameraPanel.tsx`/`StudioPanel.tsx`，公共 `Header` 抽到 `PanelHeader.tsx`。其中 `LightPanel.tsx`/`PanelHeader.tsx` 是上一次已抽出但未接线的孤儿文件，本次接上并删除 `ParamPanel` 内重复实现。② `StudioScene.tsx` 的拆分（`CameraRig` 含 OrthoRig/PerspectiveRig、`GroundDragController`、`CameraGizmo`、`DistanceLabel`）此前已落地，本次确认并入账。③ 目录决策：面板统一留在 `src/ui`，`src/panels/README.md` 标记为历史建议目录，避免两边都放。④ `store.ts` 按计划暂不拆，留到 v0.4b actions 增多时一并处理。顶栏版本更新到 `v0.4.3`。浏览器预览验证灯光面板完整渲染、零 console 报错；`tsc·lint·build` 全绿。

**v0.4.2 已落地（Codex）**：接手复核 Claude 的初步人物姿态实现，并补齐旧方案/旧快照兼容层。新增 `src/domain/sceneMigration.ts`，在读取本地方案、加载方案、A/B 交换和重复方案时统一补齐旧数据缺失的 `pose`、`objects`、灯光目标字段和相机/白棚默认值；`PersonPanel` 改为用 `DEFAULT_POSE` 兜底，旧方案没有 `pose` 时也能打开姿态面板并继续微调。顶栏版本同步到 `v0.4.2`。复核结论：v0.4a 的骨架结构、预设和滑杆方向成立；“一只手叉腰”仍是近似，需要 v0.4b 增加前臂内旋/偏摆自由度；坐到椅子/沙发、人站上桌面/舞台后的姿态自动切换还未做。

**架构体检已记录并随 v0.5.0 更新（Codex，2026-06-20）**：当前代码结构和最初设想基本一致，主干仍清晰：入口薄、`data` 管规格、`domain` 管业务计算、`scene` 管 3D、`state` 管状态、`ui` 管面板。`ParamPanel.tsx` 与 `StudioScene.tsx` 已在 v0.4.3 拆分；`store.ts` 已在 v0.4.8 按 `STORE_ACTION_SPLIT_SPEC.md` 拆成 `storeTypes`/`storeHelpers`/`actions/*` 八组工厂（685→38 行，无行为变更）。v0.5.0 灯具库落在 `src/data/fixturePresets.ts`、`src/state/actions/lightActions.ts` 和 `src/ui/LightPanel.tsx`，没有把主干重新撑胖。详见 `ARCHITECTURE.md §2.1 / §9`。

**v0.4.1 已落地（Claude Code）**：两处修复。① 自由视角白棚侧墙挡视线（与侧视同因）——`suppressSideWalls` 改为 `view === 'side' || view === 'free'`，自由轨道绕行不再被侧墙遮挡。② “一只手叉腰”姿态改进为肘外撑+前臂到腰前的逼近（roll 62 / 上臂 pitch −18 / 前臂 82）。已知限制：前臂只有“向前弯”一个自由度，手够不到腰侧后方，真正手贴腰侧需加前臂内旋自由度——已记入 `ROADMAP.md` v0.4b「下一版本待改」。

**v0.4.0 已落地（Claude Code）**：v0.4a 人物基础姿态接入。`PersonConfig` 新增 `pose: PoseConfig`（10 个关节角，单位为度）；把假人从绝对定位的平铺 mesh 重构成**层级骨架**——躯干枢轴(转身/前倾)带动其上的头、双臂；头枢轴(左右/俯仰)；每臂肩枢轴(抬起 pitch + 外展 roll)+肘枢轴(前臂弯曲)，手臂拆成上臂+前臂。新增 `src/data/poses.ts` 9 个预设(自然/侧身/头转向主光/低头/抬手/双手下垂/叉腰/前倾/轮廓光站姿，角度为工程默认待 Codex 视觉定夺)；`PersonPanel` 加「姿态」预设下拉 +「姿态微调」10 个滑杆。所有分段保留 cast/receiveShadow，姿态随方案/快照/A-B/导出自动携带；Person 加 `pose ?? DEFAULT_POSE` 兜底防旧快照崩。骨架枢轴与符号(头/躯干 pitch 正、手臂 pitch 取负、左臂 roll 取负镜像)由 qwen3.7-max 起草、Claude 逐枢轴审核；预览验证抬手抬起、前倾朝镜头。`tsc·lint·build` 全绿。

**v0.3.4 已落地（Codex）**：修正“人台”术语：用户这里指的是可站人的“直播圆形小舞台”，不是服装 mannequin。新增 `stage-round-live` 预设（圆形平台 `1.2m × 1.2m × 0.3m`）；人物面板新增“离地 Y”和“放到承载物”（桌面/椅面/凳面/沙发坐面/台座/箱体/舞台）；对象面板新增离地 Y；新增灯光目标模式 `manual/person/peopleCenter`，灯可锁定指定人物或多人中心，人物移动/升高后照射目标实时更新。`lint` 和 `build` 通过。

**v0.3.3 已落地（Claude Code）**：修复道具材质 bug——白/黑/灰三种哑光看起来完全一样。原因：渲染用对象自身 `color`，而三种哑光区别只在颜色（粗糙度几乎相同），切材质时只改了 `material` 没改 `color`。改为切材质时把颜色同步设成该材质标准色（`updateObject(id, { material, color: SCENE_OBJECT_MATERIALS[material].color })`，颜色选择器仍可事后微调）。预览验证：台座切「黑色亚光」即变黑（#18191d）。

**v0.3.2 已落地（Claude Code）**：v0.3 白棚结构/道具/人台工程接入完成。基于 Codex 的 `sceneObjects.ts` 预设库：store 加 `addObject/duplicateObject/removeObject/updateObject/setObjectPositionXZ/rotateObject/toggleObjectVisibility`（上限 12），`DragTarget` 扩展到 `'object'`；新增 `src/scene/SceneObjects.tsx`（13 类简化几何 box/cylinder/chair/sofa/panel/半身·全身人台，材质来自 `SCENE_OBJECT_MATERIALS`、可投影可接收阴影、选择环+脚下拖拽热区）；`StudioScene` 渲染道具并把 object 接入 `GroundDragController`；`ObjectList` 加「道具/结构」组（道具库下拉添加、显隐/复制/删除）；`ParamPanel` 加 `ObjectPanel`（位置/朝向/尺寸/材质/颜色/阴影/俯视标签）。`SceneObjectConfig` 补 `geometry` 字段（`kind` 不足以区分长桌/圆桌、半身/全身，故几何体显式携带）。代码由 qwen3.7-max（store+渲染）与 qwen3-coder（ObjectList+面板）起草、Claude 审核集成；预览实测加长桌/椅子/台座/全身人台/背景板，材质与投影正确，`tsc·lint·build` 全绿。

**v0.3.1 已落地（Codex）**：进入 v0.3。完成白棚结构/道具/人台的规格先行：新增 `SceneConfig.objects` 类型入口、`src/data/sceneObjects.ts` 首批对象预设、材质参数、默认沟通场景和俯视图表达规则。封包策略更新为“核心功能全部完成后再封包”。

**v0.2.3 已落地（Claude Code）**：修两处 bug。① 侧视全白——侧视正交相机在 x=22、被 x=±4 的白色侧墙整面挡住，改为侧视时不渲染侧墙（Studio 加 `suppressSideWalls`，由 `view === 'side'` 触发），人物侧剖面恢复可见。② 移除与 `GroundDragController` 重复的旧 `DragPlane`，消除两套拖拽控制器并存。注：已用面板移动人物（与拖拽同样的状态变更）实测验证「灯不会跟随人物」——人物 X 0→2 时 Key Light 距离 3.69m→2.53m 如实变化，灯绝对位置不动，状态层无灯-人耦合。

**v0.2.2 已落地（Codex）**：修复从 A/B 对比切回镜头/自由/俯视/侧视后中央画布黑屏的问题；加大人物拖动热区；将 v0.3 范围补充为“白棚结构/道具/人台 + 人物拖动 + 灯光目标模式 + 后续桌面 App 封包”。

**v0.2.1 已落地（Codex）**：完成多人物视觉定稿。默认人物改为 Actor A-E，站位为 A 居中、B 左后、C 右前、D 左前外侧、E 右后外侧，服装采用低饱和深色以便区分但不干扰灯光判断。

**v0.2.0 已落地（Claude Code）**：多人物与站位。可加/复制/删人物（上限 5，保底 1），逐人选择、编辑、拖拽、投影；ObjectList 人物区加增删按钮，场景遍历渲染全部人物。代码由 OpenRouter qwen3.7-max（store 动作 + 场景渲染）与 qwen3-coder（ObjectList 接线）起草、Claude Code 审核应用并验收。

**v0.1.5 已落地（Claude Code）**：对比视图每块画面加一行灯光摘要（几盏灯 · 主灯类型/亮度/柔硬/色温），导演一眼看出 A/B 差在哪。本次代码由 OpenRouter `z-ai/glm-5.2` 起草、Claude Code 审核应用并本地验收——确立「glm-5.2 写码 / Claude 审核」协作流程的首个落地案例。

**v0.1.4 已落地（Codex）**：新增白棚结构、道具和人台需求拆分。路线图已重排为：多人物、白棚结构/道具/人台、人物姿态、灯具预设、控光附件。

**v0.1.3 已落地（Codex）**：A/B 已由 Claude Code 完成；Codex 已把后续需求拆成 `ROADMAP.md`，下一条主线从 A/B 转向多人物、白棚结构/道具/人台、姿态、灯具预设和控光附件。

**v0.1.2 已落地（Claude Code）**：新增 A/B（多方案）对比视图。左 A=当前实时编辑场景，右 B=冻结对照快照；用右侧面板改 A，左边实时变，右边 B 不动，导演可即时看「改一盏灯的前后差异」。

**v0.1.1 已落地（Codex）**：项目已移到桌面；Codex 完成 v0.1.0 视觉复核，定下默认相机构图、亮度标定和彩色染色强度，并把 `App.tsx` 拆成薄入口。

已观察到：

- 工程：Vite + React19 + TS + R3F9 + drei10 + three0.184 + Zustand5 + Tailwind v4，`npm run dev` / `npm run build` 均通过。
- `src/App.tsx` 已是薄入口，主布局位于 `src/app/AppShell.tsx`：左对象列表 / 中 3D 预览 / 右参数面板 / 底方案栏 + 顶视图切换。
- 渲染规格 `RENDERING_SPEC.md` 的数值与公式已集中映射到 `src/data/rendering.ts`（Codex 调参入口）。
- `src/scene` 已具备 `Studio/Person/LightRig/StudioScene/lighting/capture`，阴影改用 VSMShadowMap 以让 `softness→shadow.radius` 真正生效（PCFSoft 在 three0.184 已废弃且会忽略 radius）。
- 需求文档、渲染规格文档、代码架构文档、后续路线图已建立。

## 3. 分工原则

### Codex 负责

Codex 更偏视觉、产品和渲染判断。

主要职责：

- 梳理导演视角的真实使用需求。
- 定义白棚、人物、灯具、阴影和彩色光的视觉规则。
- 给出默认灯光方案和具体数值。
- 判断截图效果是否符合导演沟通需求。
- 调整渲染规格、验收标准和产品优先级。
- 检查 UI 是否适合导演和摄影团队快速使用。

### Claude Code 负责

Claude Code 更偏工程实现和代码落地。

主要职责：

- 搭建和维护前端工程。
- 实现 3D 场景、灯光、人物、控制面板和状态管理。
- 按 `RENDERING_SPEC.md` 落地默认参数和渲染规则。
- 调试代码、修复运行错误、保持项目可构建。
- 在完成重要功能后更新本文件的进度。

### 共同负责

- 保持产品体验简单直观。
- 不为了技术炫技牺牲导演使用效率。
- 让每次迭代都有可见画面改进。
- 让文档、代码和当前实现保持同步。

### 草稿工具边界

- **Hermes** 是独立 agent：只能通过明确 handoff 由用户转交；只起草被点名的小范围 patch；不拥有功能、不宣布完成。
- **OpenRouter** 是 Claude Code 调用的代码草稿 subagent 路径：Claude Code 可以让 `glm` / `qwen` 起草机械代码，但 Claude Code 必须逐行审核、集成和验证。
- 不要把二者合并成一个外包渠道。它们的职责和调用路径不同；最终产品判断仍归用户 + Codex，工程整合仍归 Claude Code / Codex。

## 4. 工作流程

建议每轮开发按这个顺序走：

1. 看 `README.md` 确认产品目标。
2. 看 `RENDERING_SPEC.md` 确认渲染数值。
3. 看本文件确认当前状态和待完成事项。
4. 实现一个小而可见的功能。
5. 本地运行并截图检查。
6. 更新本文件的版本记录和任务状态。

## 5. 版本记录

### v0.7.1 - 应用图标与 Release 收口

日期：2026-06-21

性质：桌面封包收口与文档同步，非视觉功能；验证以版本同步、前端构建和 GitHub Release 状态为准。

完成内容：

- 正式 App 图标：用户提供 1024×1024 图（影棚 / 人物 / 紫色光圈），经 `npx tauri icon` 生成 macOS 图标并替换 Tauri 默认占位。
- 版本同步：`package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`、TopBar 均为 `0.7.1` / `v0.7.1`。
- Release：GitHub Actions 已构建并发布 v0.7.1 通用 macOS `.dmg`，当前为 latest。
- 仓库卫生：移除不需要的 iOS / Android 图标变体；`app-icon.png` 保留为图标源文件。
- 文档同步：README / README.en / CHANGELOG / ROADMAP / COLLABORATION / HERMES / CLAUDE / AGENTS 口径统一到 v0.7.1；后续主线后来在 2026-06-22 调整为 v0.8 多灯管理、v0.9 自定义灯具预设。

### v0.7.0 - 可开源第一版（Claude Code 主导）

日期：2026-06-21

负责人：Claude Code 主导工程/文档收口；产品决策（许可证 / 署名 / 是否封包 / 英文文档）本轮与用户当面拍板。Codex 负责后续规格/文档复核，Hermes 本轮未参与。

性质：开源工程收口，非视觉功能，因此不走视觉验收，只跑 `tsc·lint·build` + 预览快照确认。

完成内容：

- 许可与开源文件：新增 MIT `LICENSE`（© 2026 Keming Ou）、`CONTRIBUTING.md`（环境/起步/结构护栏/设计取向/提交约定，中英双段）、`CHANGELOG.md`（v0.1→v0.7 面向用户的版本记录）、英文 `README.en.md`。
- README 门面化：`README.md` 顶部新增「这是什么 / 功能特性 / 快速开始 / 技术栈 / 项目结构 / 已知限制 / 许可证·贡献·路线图 / 文档索引」开源门面；原完整产品需求文档（PRD）原封保留在 `# 完整产品需求文档（PRD）` 之后。
- `package.json`：补 description / license `MIT` / author `Keming Ou` / repository / bugs / homepage / keywords / `engines: node>=20.19`；版本 `0.0.0 → 0.7.0`；保留 `private:true`（应用而非可发布库）。
- 仓库卫生：删除 `.DS_Store`、`.playwright-cli/`、陈旧 `dist/`；`.gitignore` 补 `*.tsbuildinfo`、`.claude/settings.local.json`、`.dltmp/`、`.playwright-cli/`，保留共享的 `.claude/launch.json`。
- 版本号：`src/ui/TopBar.tsx` 顶栏徽标 `v0.6e → v0.7.0`。
- git：`git init`（main 分支）、配置本地 user，做了**仅本地**首提交 `8158ade`；`node_modules`/`dist` 经 `.gitignore` 排除（122 个文件入提交）。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全绿（构建产物报 `direct-light@0.7.0`，仅既有 ~1.2MB Three/R3F 大 chunk 提示，非回归）。
- 运行中的 Vite 预览快照确认顶栏 `白棚灯光预演 · v0.7.0`，对象列表 / 灯光面板 / A/B / 方案栏完整渲染，零 console 报错。

发布状态：

- 已按用户确认的账号 `oukeming64-tech` 开源到公开仓库 **https://github.com/oukeming64-tech/direct-light**（`gh repo create --public --source=. --push`，main 分支）。
- 在线 demo 自动部署：新增 `.github/workflows/deploy.yml`（push `main` → `npm ci` + `npm run build` → 发布 `dist/` 到 GitHub Pages），Pages 源设为 GitHub Actions；`vite.config.ts` 改为函数式配置，`base` 仅在 `command==='build'` 时取 `/direct-light/`，dev/preview 仍根路径。在线 demo：https://oukeming64-tech.github.io/direct-light/ ，随 `main` 自动更新。`package-lock.json` 已 `npm install` 重新同步到版本 `0.7.0`，保证 CI 的 `npm ci` 不报 lock 不一致。
- `package.json` 的 `repository`/`homepage`/`bugs` 和 README/CONTRIBUTING 的 `git clone` 均已指向该真实仓库 URL（不再是占位）。
- 个人复盘 `个人重构/` 按用户「复盘自己保留」**保留在本地、不开源**：已加入 `.gitignore` 且未纳入任何提交。
- 桌面封包：用户选定 **Tauri** 并已搭好脚手架 + 发版 CI（见上方状态块第二段，`src-tauri/` + `.github/workflows/release.yml`，push `v*` tag → macOS runner 出通用 `.dmg`，未签名）。已发布 **v0.7.0**（6.6MB，默认图标）和 **v0.7.1**（9.3MB，正式图标，latest）；图标用用户提供的 1024×1024 图经 `npx tauri icon` 套上。

### v0.6e - 控光线收口（用户视觉验收通过）

日期：2026-06-21

负责人：Claude Code 主实现与回归；Codex 负责文档、版本号和下一步路线同步。v0.7 由 Claude Code 主导。

完成内容（严格按 `V0_6E_CLOSEOUT_SPEC.md`）：

- A/B 差异摘要新增「控光器材」类别，把黑旗、反光板、柔光布框从普通「道具」差异中拆出。
- 保存 / 加载 / 复制 / A-B 冻结·交换回归通过：灯上附件 `modifierId`、gear 对象和 gear 派生光学都不丢。
- 导出截图回归通过：gear 视觉与近似光学可随场景用于导演沟通。
- README 已补开源前限制说明：`MAX_LIGHTS=3`、仅中文、桌面优先、渲染为沟通向近似；多语言与更多光源放到开源之后。
- `src/ui/TopBar.tsx`：`v0.6d → v0.6e`。

验证：

- 用户视觉验收通过。
- v0.6a 附件、v0.6b 附件视觉/导演简介、v0.6c gear 摆位、v0.6d gear 光学不回退。
- `lint` / `build` 在 Codex 收口时重新确认。

后续状态：

- v0.6 控光线全线完成。后续 v0.7 / v0.7.1 已完成并发布；当前后续主线是 v0.8 更多光源 / 多灯管理、v0.9 自定义灯具预设导入/导出，多语言后置。

### v0.6d - 控光器材近似光学（用户真机视觉验收通过）

日期：2026-06-21

负责人：Hermes 按 `HERMES_HANDOFF_V0_6D.md` 起草纯模块，Claude Code 逐行审核并集成，Codex 复核进度文档与版本状态。

完成内容（严格按 `V0_6D_OPTICS_SPEC.md`，建立在 v0.6c 的 3 个 gear 对象之上）：

- 新增纯模块 `src/domain/controlGearOptics.ts`：`getGearLightOptics` / `applyGearOpticsToLightParams` / `getNegativeFillFactor` / `getReflectorFillLights`，用当前 scene objects 运行时推导有效光学，不写回 `scene.lights` 或 gear 对象。
- `src/scene/LightRig.tsx`：每盏灯在 v0.6a 附件 effective params 之上叠加 gear optics；反光板虚拟补光渲染为 no-shadow `pointLight`，不占 `MAX_LIGHTS`。
- `src/scene/lighting.ts`：`computeGlobalFill` 接入 `objects/people`，用黑旗 negative fill 压低 ambient/hemisphere/bounce，并把 gear spill 计入彩色反弹。
- `src/scene/StudioScene.tsx`：把 `scene.objects/people` 传给 `GlobalFill` 和 `LightRig`。
- 验收修复：`src/ui/ObjectPanel.tsx` 对控光器材隐藏「材质」选择器，避免 gear 被改成普通道具材质；颜色、尺寸和接收阴影控制仍保留。
- `src/ui/TopBar.tsx`：`v0.6c → v0.6d`。

验证：

- `tsc·lint·build` 全绿。
- Claude 确定性自测（esbuild 打包纯模块跑断言）6 例全对 spec：无 gear identity、黑旗挡光路、黑旗 edge-on 归零、柔光布框软化、黑旗 negative fill、反光板弱补光/远距离归零。
- 用户真机视觉验收通过：黑旗吃光/负补光、反光板弱补光、柔光布框软化都符合导演沟通直觉；材质选择器修复也已真机确认。

后续状态：

- v0.6d 已完成，不再改光学公式或 gear 数值；v0.6e、v0.7 和 v0.7.1 也已完成。当前后续主线是 v0.8 多灯管理、v0.9 自定义灯具预设。

### v0.6c - 棚内独立控光器材（用户视觉验收通过）

日期：2026-06-20

负责人：Claude Code 起草 `V0_6C_GEAR_SPEC.md` + 集成（本轮 Codex 无额度，用户授权 Claude 起草并集成；范围由用户定稿）。

用户定稿：去掉「旗板」（旗板=黑旗、白旗板=反光板），只做 3 种——黑旗 / 反光板 / 柔光布框；确认加 `scrimWhite` 半透明白材质。

完成内容（严格按 `V0_6C_GEAR_SPEC.md`，控光器材作为现有 object 系统新类别接入，**本版零光学**）：

- 类型 `src/types.ts`：`SceneObjectKind` +`blackFlag`/`reflectorBoard`/`diffusionFrame`；`SceneObjectGeometry` +`gearPanel`；`SceneObjectMaterial` +`scrimWhite`。
- 数据 `src/data/sceneObjects.ts`：`SCENE_OBJECT_MATERIALS` 加 `scrimWhite`（半透明柔光白 opacity 0.5）；`SceneObjectPreset` 加可选 `group?: 'prop' | 'gear'`；`SCENE_OBJECT_PRESETS` 加 3 个 gear 预设（`black-flag`/`reflector-board`/`diffusion-frame`，`geometry:'gearPanel'`、`castShadow:false`、`receiveShadow:false`、`group:'gear'`）；新增 `CONTROL_GEAR_KINDS` + `isControlGearKind`。
- 渲染 `src/scene/SceneObjects.tsx`：新增 `case 'gearPanel'`——工作面薄板（上 55%）+ 深灰细立柱 + 底座；立柱/底座用固定深灰（`#3a3a40`/`#2a2a30`），不跟随对象 material，避免反光板把支架染白。工作面法线 = 局部 +Z 经 `rotationY` 旋转（v0.6d 光学复用此约定）。
- UI `src/ui/object-list/SceneObjectsSection.tsx`：加道具下拉拆成「道具 / 结构」「控光器材」两个 `<optgroup>`，按 `preset.group` 过滤；`addObject` 逻辑不变。
- 迁移 `src/domain/sceneMigration.ts`：`objectGeometryByKind` 这张 `Record<SceneObjectKind, SceneObjectGeometry>` 补 3 个新 kind → `gearPanel`（穷尽性 Record 正好把缺口报成 tsc 错误，已补齐）。
- `src/ui/TopBar.tsx`：`v0.6b → v0.6c`。
- 复用确认（无需改）：`addObject` 等 store action 已泛化；`ObjectPanel` 材质下拉遍历 `SCENE_OBJECT_MATERIALS` 自动出现「柔光白（半透明）」；`supportSurfaces.ts` 靠 `getObjectSupportRole` 的 `default: null` 自动排除 gear，未加 seat/stand 分支；`sceneDiff` 的「道具」类别已覆盖 gear。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过（仅既有大 chunk 提示）。
- 浏览器 DOM 确定性自测：加道具下拉两组（道具 / 结构 14 项 + 控光器材 黑旗 / 反光板 / 柔光布框）；依次加 3 gear，kind = blackFlag / reflectorBoard / diffusionFrame，零 console 报错；再加一个方形台座后，人物「放到承载物」下拉只列 `方形台座 · 台座 0.80m（站）`，**不含**任何 gear（佐证 gear 不是承载面）；顶栏 `v0.6c`。
- 3D 站立形体（薄板 + 支架/底座、黑旗黑 / 反光板白 / 柔光布框半透明）已通过用户真机视觉验收。

后续状态：

- 本版零光学是有意为之；后续 v0.6d 已按 `V0_6D_OPTICS_SPEC.md` 在 v0.6c 对象上完成光学近似（黑旗吃光 / 负补光 / 简化遮挡、反光板暗部弱补光、柔光布框在灯人之间软化），复用 `gearPanel` 固定的「工作面法线 + 世界中心高度」几何约定。

### v0.6b - 附件视觉 + 导演视角简介（用户视觉验收通过）

日期：2026-06-20

负责人：Claude Code 集成 / 审核（`LightModifierVisual` / `lightBrief` / `DirectorLightBrief` 首版草稿由 Hermes 起草、Claude 审核接线；立体形体改写由 Claude 实现）。用户授权 Claude 代 Codex 做本次视觉验收（本轮 Codex 已无额度）。

完成内容（严格按 `V0_6B_VISUAL_BRIEF_SPEC.md`，不动 v0.6a 光学数值）：

- 附件可见灯体 `src/scene/LightModifierVisual.tsx`：4 种附件各一个**立体**显示灯体——
  - 中号柔光箱：3D 箱体 housing（`boxGeometry 1.7×1.15×0.42`，深色 `meshStandardMaterial`）+ 前方发光白面（`planeGeometry 1.78×1.22`，`meshBasicMaterial` 不 toneMapped），四者中最大（§3.1）。
  - 标准反光罩：浅金属开口锥/碗罩（`coneGeometry 0.42×0.34, openEnded`，`metalness 0.35/roughness 0.45`），`rotation [-π/2,0,0]` 使罩口朝被摄、罩底朝灯；比蜂巢大、明显小于柔光箱（§3.3）。
  - 蜂巢：贴灯头的深色控光短环（`cylinderGeometry 0.26 半径 ×0.18 高, openEnded`，`rotation [π/2,0,0]` 环口朝被摄）+ 十字暗线（两条细 `boxGeometry`），最小、无真实蜂窝几何（§3.2）。
  - 柔光布：薄半透明扩散板（`boxGeometry 0.72×0.6×0.05`，`opacity 0.4`），只比灯头略大，仍是薄片、明显区别于白色软箱（§3.4）。
  - 偏移按附件类型 `OFFSET_BY_KIND`（柔光箱 0.4 / 反光罩 0.3 / 蜂巢 0.22 / 柔光布 0.3）沿 `lookAt(target)` 方向前置；灯体不 `castShadow`、不发光遮挡，**v0.6a 有效光质公式零改动**。`LightRig.tsx` 由 `getLightModifierPreset(light.modifierId)?.visualKind` 驱动渲染。
- 导演视角简介 `src/domain/lightBrief.ts`（纯函数）：文案逐字照 spec §4 四种组合（有/无灯具 × 有/无附件）+ 效果短语表（柔光主光/收束控光/集中硬光/扩散片/可手动调光）。
- `src/app/DirectorLightBrief.tsx`：仅 `viewMode==='camera'` 且选中对象是灯时显示；左下轻量状态条 `pointer-events-none`/`max-w-[85%]`/`truncate`，不遮人物；已接进 `Stage.tsx`。
- 集成收尾（Claude）：`src/ui/TopBar.tsx` 版本号 `v0.6a → v0.6b`（草稿漏改，本次补齐）。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过（仅既有 Three/R3F 大 chunk 提示）。
- 浏览器 DOM 确定性自测：简介默认 `Key Light · 自定义灯具 · 无附件`；挂 Nanlux Evoke 600C + 中号柔光箱 → `Key Light · Nanlux Evoke 600C · 中号柔光箱 · 柔光主光`；清空器械/附件后正确回退；非镜头视角或选中人物/道具/摄影机/白棚时简介不显示；4 种附件依次切换零 console 报错。
- 3D 灯体观感按《工作约定》第 2 条交用户肉眼验收（R3F 预览偶发黑屏，自验不可靠），用户视觉验收通过。

后续状态：

- v0.6c 棚内独立控光器材、v0.6d 近似光学、v0.6e 收口、v0.7 和 v0.7.1 均已完成。

### 2026-06-20 - Codex 规格补齐：store 拆分与 v0.5 灯具库

负责人：Codex

完成内容：

- 新增 `STORE_ACTION_SPLIT_SPEC.md`：明确 `store.ts` 只做无行为变化的 action 分组拆分，建议新增 `storeTypes.ts`、`storeHelpers.ts`、`src/state/actions/*`，并给出分步验收清单。
- 新增 `V0_5_FIXTURE_SPEC.md`：定义灯具器械预设库的数据结构、UI 文案、首批 8 个预设、Nanlux Evoke 600C 的资料来源和 Direct Light 内部映射。
- 更新 `CLAUDE.md` / `HERMES.md` / `ROADMAP.md`，让 Claude/Hermes 下一轮先读这两份规格。
- 用户补充协作规则：不能写“Claude/Hermes 实现”这种模糊归属。谁的活就是谁的活；Hermes 是候补草稿 agent，只做被明确点名的小块，不能独立宣称完成 Claude-owned 功能。
- 当时灯光数量复核：多灯已支持，默认 Key/Fill/Rim 三盏；左侧灯光列表可添加/复制/删除，但 `MAX_LIGHTS = 3`，满 3 后显示“满 3”。开源第一版暂不提高上限；当时计划开源后单独做更多灯，2026-06-22 已调整为 v0.8 先做多光源 / 多灯管理。
- 用户新增路线判断：v0.7 完成后即可开源；开源第一版不等待多语言或更多光源。该路线已在 v0.7 / v0.7.1 执行完成；2026-06-22 用户与 Codex 进一步判断，过早 i18n 会拖慢新增功能字段，因此后续改为 v0.8 更多光源 / 多灯管理、v0.9 自定义灯具预设导入/导出，多语言后置。
- v0.4.8 落地后，Codex 对 `V0_5_FIXTURE_SPEC.md` 做开工前定稿：面板灯改为更软更宽（80° / 0.92），RGB 灯管改为更软更铺开（80° / 0.86），暖色 practical 改为 `tungsten`，UI 增加能力标签，验收清单补齐全彩能力、自定义参数和不残留 RGB 色的边界。

下一步建议：

1. Claude 按定稿后的 `V0_5_FIXTURE_SPEC.md` 集成灯具库。
2. Hermes 只能在 Claude/Codex 明确指定时起草 `fixturePresets.ts` 或 LightPanel 的小段 UI，不负责整合、验收或改数值。

### v0.5.0 - 灯具器械预设库（用户真机验收通过）

日期：2026-06-20

负责人：Claude Code 集成；`fixturePresets.ts` 由 Hermes 逐字起草、Claude 审核验收

完成内容（严格按 `V0_5_FIXTURE_SPEC.md`）：

- 类型（Claude，`types.ts`）：`FixtureCategory`/`FixtureColorEngine`(7 值含 `tungsten`)/`FixturePowerClass`/`FixtureUse` + `LightConfig.fixturePresetId?`。
- 数据（Hermes 起草、Claude 审核，`src/data/fixturePresets.ts`）：`FixturePreset` 类型 + `FIXTURE_PRESETS` 8 个预设，字段/数值/notes 逐字照当前 spec §4/§5（含 §5.5/§5.7 的 `colorTemperature: undefined`）。
- store（Claude，`actions/lightActions.ts`）：`applyFixturePreset(lightId, fixturePresetId)`。`undefined`/空 → 只清 `fixturePresetId`；未知 id → no-op；命中 → 只改 type/intensity/beamAngle/softness/distance/color/colorTemperature + fixturePresetId，保留 id/name/enabled/position/target/targetMode/targetPersonId。`Store` 类型同步加签名。
- UI（Claude/Codex，`LightPanel.tsx`）：「基础」区顶部「器械」下拉（`自定义参数` + 8 灯具，文案 `选择灯具只设置默认光质，之后仍可手动微调。`），Header 副标题选预设后显示 `${器械名} · 灯光参数`；Codex 复核补齐 `全彩/双色温/暖色/白光` 能力标签。
- 兼容：可选字段，旧方案/AB/保存天然兼容，`sceneMigration`/`sceneDiff` 无需改（spec §8）。

协作插曲（值得记）：

- Hermes 逐字抄 spec 时撞到 `colorEngine: 'tungsten'` 不在枚举 → tsc 报错。Hermes **按边界停下标记、不擅改 types.ts、不猜值**，做得对。根因：Codex 在 Claude 读完 spec 后更新了 §4（加 `tungsten`，并调了 LED 面板/RGB 灯管/实景灯等数值），Claude 的 `types.ts` 落后一版。Claude 一行把枚举对齐当前 spec §4 即解；Hermes 的 `fixturePresets.ts` 经逐条对照**当前 spec** 确认逐字无误，原样验收。`rgbacl` 为有效但未被任何预设使用的预留值，保留不动。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过。
- Claude 确定性自测（DOM）：器械下拉 9 项有序；选 Nanlux Evoke 600C → 亮度 1.80→2.15、光束 45°→65°、柔硬→硬 0.14、类型→硬光、副标题→`Nanlux Evoke 600C · 灯光参数`、`fixturePresetId` 写入；回到 `自定义参数` → 参数保持不变、只清标记、副标题回 `硬光 · 灯光参数`；零 console 报错。
- 用户真机视觉验收通过：面板比 COB 更软更宽、菲涅尔更窄更硬、RGB/小型效果灯出彩光、白光灯具回白光色温、选器械后仍可手动微调、A/B 切器械高亮`灯光`、保存刷新加载灯具选择不丢。

### v0.4.8 - store action 拆分（无行为变更）

日期：2026-06-20

负责人：Claude Code 集成（8 个 action 工厂外包 OpenRouter glm-5.2 逐字搬运起草、Claude 逐组审核）

完成内容（严格按 `STORE_ACTION_SPLIT_SPEC.md`）：

- `src/state/store.ts`：685 → 38 行，仅保留初始 state + `...createXActions(set[,get])` 组合 8 组 action；从 `./storeTypes` re-export `DragTarget`/`CompareSnapshot`/`Store` 保持公共接口。
- 新增 `src/state/storeTypes.ts`：`DragTarget`、`CompareSnapshot`、`Store`（含全部 action 签名）、`StoreSet`/`StoreGet`（`StoreApi<Store>['setState'|'getState']`，与 zustand v5 的 create set/get 兼容，无需 StateCreator）。
- 新增 `src/state/storeHelpers.ts`：纯 helper `mapLights`/`chestTarget`/`carryBoundPeople`/`detachPeopleFrom`（不碰 set/get、不 import React/Three）。
- 新增 `src/state/actions/`：`viewActions`(3)/`compareActions`(3)/`studioActions`(1)/`cameraActions`(7)/`lightActions`(8)/`personActions`(6)/`objectActions`(7)/`presetActions`(7)，每个导出 `createXActions(set[,get]): Pick<Store,...>` 工厂（用 `get` 的仅 light/person/object）。
- 分组按 spec：`updatePerson`/`setPersonPositionXZ`→person、`updateCamera`→camera、`resetScene`/`applyDebugPreset`→preset。42 个 action 各归一组、无重复无遗漏（`create<Store>` 全量约束 + tsc 通过为证）。
- 分工：8 个工厂逐字搬运由 glm-5.2 起草、Claude 逐组对照源审核；类型/helper/store 组合由 Claude 自写。审核抓到 glm 在 `setCameraFromFree` 漏一个右括号，已修。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过；单 action 文件均 <150 行，store.ts 38 行。
- 浏览器实测：应用完整渲染（对象列表/灯光面板/读数 1.80/2.60/3.69/49 与重构前一致），store 由 8 工厂正确组合、无循环依赖、零 console 报错。
- 无依赖新增、无产品行为变化、调用方 import 路径不变。

未完成 / 下一步：

- 渲染债务或 v0.6 控光附件。v0.5 灯具器械预设库已通过用户真机验收。

### v0.4.7 - v0.4c 摄影机控制（用户真机验收通过）

日期：2026-06-19

负责人：Claude Code 集成（纯模块外包 OpenRouter glm-5.2 起草、Claude 逐行审核）

完成内容（严格按 `V0_4C_CAMERA_SPEC.md`）：

- 类型：`CameraConfig` 新增 `targetMode?: CameraTargetMode`、`targetPersonId?`；`CameraTargetMode = 'manual' | 'person' | 'peopleCenter'`。
- 迁移：`sceneMigration` 旧方案补 `targetMode='manual'`、`targetPersonId=` 第一个人物。字段属 `SceneConfig.camera`，方案保存 / A/B / 导出天然携带。
- 纯模块（外包 glm-5.2、Claude 审核落盘）：`src/domain/cameraMath.ts`（`cameraAzimuthDeg`/`cameraHorizontalDistance`/`cameraPositionFromPolar`，以 target 为中心、`atan2(dx,dz)`，正反算自洽）；`src/data/cameraPresets.ts`（5 个机位预设，数值/文案逐字按 spec §3）；`src/ui/CameraPanel.tsx` 重写（镜头/机位/目标/机位预设/从自由视角取景 五区）。
- store（Claude 自写）：`setCameraTargetMode`/`aimCameraAtPerson`/`applyCameraPreset`/`requestFreeCameraCapture`/`setCameraFromFree`；`freeCameraCaptureRequestId` 状态。
- 渲染端实时跟随：`cameraMath.getEffectiveCameraTarget` + `CameraRig.PerspectiveRig` 在镜头视角 lookAt 有效目标（锁定人物/多人中心随人物移动而跟随，镜像灯光的渲染期解析）。
- 从自由视角取景：`StudioScene` 内 `FreeCameraCaptureBridge`（仅自由视角挂载），监听 `freeCameraCaptureRequestId`，读 R3F 相机 + OrbitControls target，调 `setCameraFromFree` 写回主摄影机并切到镜头视角；非自由视角时面板按钮只切到自由视角、不改相机。
- A/B：`sceneDiff` 摄影机 diff 纳入 `targetMode` 和锁定人物 id，目标模式或锁定对象不同时「摄影机」标签高亮。
- 棚内夹紧（用户追加，原 spec 无）：`cameraMath.clampCameraInsideStudio(position, studio, margin=0.4)` 将摄影机约束在敞开棚体内——侧墙内 `±(W/2−0.4)`、`y∈[0.4, 天花?H−0.4 : 不限]`、`z≥−D/2+0.4`，前方 +Z 敞开。镜头模式在 `updateCamera`/`applyCameraPreset`/`setCameraFromFree` 写入处夹紧（滑杆贴墙、stored 与读数一致）+ `CameraRig.PerspectiveRig` 渲染再夹一道（覆盖载入/AB/遗留相机）；自由模式 `StudioScene.FreeCameraClamp` 每帧夹紧并重指向 target（默认 priority，跑在 drei OrbitControls 的 priority −1 update 之后，稳定无抖；棚内时为 no-op）。效果：转动/绕行到墙后变成贴墙滑动，不再一片白。
- 用户反馈修复 (a)：自由/俯视可拖拽摄影机机位。`DragTarget` 加 `'camera'`，新增 store `setCameraPositionXZ`（落点夹紧棚内），`CameraGizmo` 加 `onPointerDown` 起拖（停 OrbitControls），`GroundDragController` 加 camera 分支——与灯/人/物同一套地面拖拽机制。（spec §6 原把「摄影机拖拽 gizmo」列为暂不做，用户要求后补上。）
- 用户反馈修复 (b)：自由模式「看向高度」滑杆会带动人/白棚位置。根因：自由视角 `OrbitControls` 的 `target` 绑到 `scene.camera.target` 且每渲染重设，滑杆改 `target.y` → 重渲染 → 轨道枢轴被拽高 → 整个自由视角平移（视觉误判为场景移动）。改为 `useMemo([view])` 进入自由视角时捕获一次枢轴，之后 `camera.target` 变化不拽动自由视角；取景桥仍读实时 `controls.target`。
- 严格按 spec 的 UI 文案：`手动/锁定人物/多人中心`、`锁定对象`、`对准 Actor X 一次`、`方位角/距离/高度/看向高度`、`正面全身/45°侧前/高机位/低机位/俯拍沟通`、`设为当前自由视角`/`切到自由视角调整`/辅助文案。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过。
- Claude 确定性自测（DOM 层，非 3D）：摄影机面板五区/5 预设/新滑杆全部挂载、零 console 报错；点 `45°侧前` 预设后机位读数方位角 0°→45°、距离 6.20→5.94m（= √(4.2²+4.2²)），极坐标与预设一致。

用户真机验收通过（spec §8 共 9 项，含 3D 交互、按《工作约定》交用户肉眼看）：

1. 方位角/距离/高度/看向高度/焦段/画幅可调。2. `正面全身` 回到默认构图。3. `45°侧前` 明显改角度。4. 高/低机位差异明显。5. `锁定人物` 后移动 Actor A，摄影机跟随。6. `多人中心` 后加/移第二人，目标跟随中心。7. 自由视角点 `设为当前自由视角` 后主摄影机变成该自由视角。8. A/B 中改摄影机 B 不动、差异摘要高亮「摄影机」。9. 对比切回镜头/自由/俯视/侧视不黑屏。

未做 / 注意：spec §6 明确暂不做的景深/光圈/路径动画/多机位/精确镜头畸变/云端分镜仍未做。摄影机拖拽原本暂不做，但用户在 v0.4.7 追加后已补入并验收。

### v0.4.6 - A/B 对比产品引导（用户真机验收通过）

日期：2026-06-19

负责人：Hermes 起草，Codex 复核修正，用户真机验收

完成内容：见 §2 顶部状态块。要点：`src/domain/sceneDiff.ts` 6 类差异摘要条；B 空状态三动作卡；`CompareSnapshot.frozenAt` + 「冻结于 X 前」；A/B 文案明确化。Codex 复核修复「进对比不再自动塞 B」让空状态卡可达。用户真机验收通过。（本条 §5 记录由 Claude 补记，Codex 本轮限额。）

### v0.4.5 - attach-to-support 实时绑定

日期：2026-06-19

负责人：Hermes 起草，Codex 复核

完成内容：

- 人物放到椅子、沙发、凳子、桌面、台座、箱体或直播圆形小舞台后，会记录承载物 id、本地 X/Z 偏移和相对朝向。
- 承载物移动、旋转或尺寸/高度变化时，绑定人物会跟随更新位置、高度和朝向。
- 删除承载物、点击“回到地面 / 起立回地面”、或手动改变人物位置时，会解除绑定。
- Codex 复核补丁：换姿态但位置不变时不误解绑；绑定状态下手动改人物朝向会更新相对朝向，后续旋转承载物不把朝向弹回旧值。
- `CLAUDE.md`、`HERMES.md`、`ROADMAP.md`、`ARCHITECTURE.md` 已同步到 v0.4.5，避免后续 agent 误以为 attach-to-support 仍未完成。

验证：

- `npm run lint` 通过。
- `npm run build` 通过（包含 `tsc -b`；仍有历史 Vite 大 chunk 提示，不影响运行）。
- 用户真机验收通过：椅子/小舞台移动跟随、旋转跟随、回地面解绑、手动拖人解绑、A/B/保存加载不崩。
- 验收后新增产品判断：A/B 对比功能可用，但产品引导不够明确，需在 v0.4.6 补齐。

### v0.4.4 - v0.4b 坐姿与承载物联动

日期：2026-06-19

负责人：Claude Code（用户真机视觉验收）

完成内容：

- 承载面角色：`src/domain/supportSurfaces.ts` 新增 `SupportRole = 'seat' | 'stand'` 与 `getObjectSupportRole`。椅子/沙发/凳子 = `seat`，桌子/平台/台座/圆柱台座/箱体 = `stand`。凳子无靠背，座面即顶面，由「可站」改判为「可坐」。`SupportSurface` 带 `role`，标签追加「（坐）/（站）」。
- 坐姿类型：`PoseConfig` 新增可选 `seated?: boolean`；前臂内旋 `leftForearmYaw/rightForearmYaw`（必填，`NEUTRAL` 默认 0，符号约定写进 `types.ts`）。旧方案经 `sceneMigration` 合并 `DEFAULT_POSE` 自动补全，向后兼容。
- 坐姿骨架（`Person.tsx`）：`seated` 时以「臀=组原点」为基准——`placeOnSurface` 把人放到座面高度，骨盆落座、双腿在髋（`SEAT_HIP_FLEX=-84`）与膝（`SEAT_KNEE_FLEX=84`）折叠垂下，脚落地面附近；站姿保持原「脚=原点」向上搭建。上半身（躯干/头/双臂）子树两种姿态完全复用，只切 `torsoPivotY/pelvisY` 与腿部分支。腿改为 `[-1,1].map` 渲染。
- 前臂内旋**结构性修复**：原本 yaw 与 bend 同在肘 group 的 Euler `[-bend, yaw, 0]`——Three XYZ 顺序下 Y 先作用，而前臂初始沿本地 Y 轴，绕 Y 自转对朝向无效，故 v0.4b 初版 yaw 完全没用。改为 yaw 外层 group 包住 bend 内层 group，先弯肘再绕上臂轴扫动弯好的小臂。叉腰预设改 `rightForearmYaw -85`（负号把手往腰内侧扫，已推导验证）。
- 姿态预设（`src/data/poses.ts`）：新增 `seated`/`seated-talk`/`seated-hands-knees` 三个坐姿；导出 `SEATED_HIP_HEIGHT=0.46`，供面板在地面手动选坐姿时抬高至座高让脚落地。
- 面板（`PersonPanel.tsx`）：`placeOnSurface` 按 `role` 自动切坐/站姿并写入承载面高度；新增「坐姿（折叠双腿）」开关与 `reconcileY`（地面↔座高互转）；「回到地面」按钮坐姿时文案变「起立回地面」并清坐姿；姿态微调新增「左/右前臂·内旋」两滑杆。

验证：

- `npx tsc -b` / `npm run lint` / `npm run build` 全通过。
- 用户真机视觉验收：「一只手叉腰」手到腰侧、「起立回地面」正确站起落地，均通过。
- 按《工作约定》第 2 条，人物姿态轻改由用户肉眼验收（R3F 预览黑屏/resize 不可靠），不再由 Claude 自验。

未完成 / 下一步：

- **历史备注，已在 v0.4.5 解决**：v0.4.4 时承载物绑定人物一起移动（attach-to-support）尚未做，当时「放到承载物」仍是一次性吸附。v0.4.5 已补齐 `supportObjectId` / `supportLocalOffset` / `supportRotationOffset` 和移动/旋转跟随。
- 坐姿腿折叠角为固定常量，按典型座高（~0.46m）标定；极端座高会有轻微脚穿地/悬空，第一版可接受。
- 叉腰 yaw 符号若个别角度仍反，由面板「右前臂·内旋」滑杆现场微调。

### v0.4.3 - v0.4b 前置轻量拆分

日期：2026-06-19

负责人：Claude Code

完成内容：

- `ParamPanel.tsx` 拆分：从 409 行降为 26 行，只保留按 `selection.kind` 分发到对应面板 + `EmptyState`。
- 新增独立面板文件：`src/ui/LightPanel.tsx`、`PersonPanel.tsx`、`ObjectPanel.tsx`、`CameraPanel.tsx`、`StudioPanel.tsx`；公共标题组件抽到 `src/ui/PanelHeader.tsx`（`Header`）。各面板按需精简 import，行为与原内联实现逐字一致。
- 收尾上一次未接线的孤儿：`LightPanel.tsx` 与 `PanelHeader.tsx` 此前已抽出但无人引用，本次接入 `ParamPanel` 并删除其内部重复的 `LightPanel`/`Header`。
- `StudioScene.tsx` 拆分（此前已落地，本次入账确认）：相机 rig 进 `CameraRig.tsx`（`OrthoRig`/`PerspectiveRig`）、地面拖拽进 `GroundDragController.tsx`、摄影机图标进 `CameraGizmo.tsx`、距离标签进 `DistanceLabel.tsx`，本体只剩场景组合（205 行）。
- 目录决策：面板统一留在 `src/ui`；`src/panels/README.md` 改为“历史建议目录，当前未使用”，避免后续 ui/panels 两边混放。
- `store.ts` 暂不拆，留待 v0.4b 增加坐姿/承载物绑定、摄影机目标模式等 actions 时一并拆。
- `ARCHITECTURE.md §2 / §9` 已同步标记 ParamPanel / StudioScene 拆分完成。

验证：

- `npm run lint` 通过。
- `npx tsc -b` 通过。
- `npm run build` 通过（仍有 Vite 大 chunk 提示，历史遗留、不影响运行）。
- 浏览器预览：默认 `LightPanel`（最复杂面板）完整渲染、各分区/滑杆/分段控件齐全，`error` 级 console 为空。

未完成 / 下一步：

- 进入 v0.4b：坐姿预设、人物放到椅子/沙发/凳子自动坐下、放到桌面/舞台/台座保持站姿并校正脚底高度、前臂内旋让叉腰更像。

### 2026-06-19 - 架构体检与 v0.4b 前置整理建议

负责人：Codex

结论：

- 当前代码架构和最初设想基本一致，主干仍然清晰。
- 入口层保持很薄：`src/App.tsx` 只渲染 `DirectLightApp`，`src/app/AppShell.tsx` 负责四区布局。
- `src/data` 已成为规格库：渲染数值、默认场景、姿态预设、道具预设都集中在这里。
- `src/domain` 已承担业务计算：灯光目标、承载面高度、旧方案迁移、灯光摘要。
- `src/scene` 主要负责 3D 渲染、相机和拖拽；`src/state` 仍是纯状态层；`src/ui` 负责传统界面。

需要控制的风险：

- `src/state/store.ts` 已经偏大，后续再加坐姿绑定、摄影机目标模式时可拆 action。
- `src/ui/ParamPanel.tsx` 已经同时容纳五类面板，应拆成多个面板文件。
- `src/scene/StudioScene.tsx` 同时承担相机、拖拽、gizmo、距离标签和场景组合，应拆出子模块。
- `src/panels` 目前只是空的建议目录；后续要么统一继续用 `src/ui`，要么一次性迁移到 `src/panels`，不要混用。

给 Claude Code 的当时下一步建议（历史记录，以下事项已进入后续版本）：

1. 先做一次不改变产品行为的轻量拆分。
2. 再做 v0.4b：坐姿、人物与承载物绑定、前臂内旋。
3. 然后做 v0.4c：摄影机角度、摄影机目标、用当前自由视角设为摄影机。

### v0.4.2 - Codex 姿态验收与旧方案迁移

日期：2026-06-19

负责人：Codex

完成内容：

- 复核 Claude Code 的 v0.4a/v0.4.1 姿态实现：层级骨架、9 个姿态预设、10 个滑杆和投影关系整体成立。
- 新增 `src/domain/sceneMigration.ts`，集中处理旧本地方案/旧 A-B 快照的结构迁移：缺失 `pose` 时补 `DEFAULT_POSE`，缺失 `objects` 时补空数组，缺失灯光 `targetMode/targetPersonId` 时补当前默认行为。
- `store.ts` 在读取本地方案、设置/交换 A-B、加载方案、复制方案时统一走迁移函数，避免 v0.1-v0.3 保存的数据进入 v0.4 后黑屏或面板崩溃。
- `PersonPanel` 使用 `DEFAULT_POSE` 合并当前人物姿态，旧方案也能显示姿态下拉和滑杆；手动拖动滑杆会进入「自定义微调」状态。
- 顶栏版本号更新为 `v0.4.2`。

未完成 / 下一步：

- 真正坐姿还没做：人物放到椅子/沙发/凳子上目前只是高度变化，需要自动切换为坐姿或手动选择坐姿预设。
- 真正手叉腰还没做：需要增加前臂 yaw/twist 一类自由度。
- 姿态滑杆现在偏工程化，后面可以折叠为“预设优先、细调其次”的导演友好 UI。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地预览检查：姿态面板可用；“抬一只手”“一只手叉腰”能看到人物与阴影变化。

### v0.4.0 - v0.4a 人物基础姿态

日期：2026-06-18

负责人：Claude Code（代码起草：OpenRouter qwen3.7-max + qwen3-coder）

完成内容：

- 类型：`types.ts` 新增 `PoseConfig`（presetId + 10 个关节角，**单位为度**，符号约定写在类型注释里）；`PersonConfig` 增加 `pose: PoseConfig`。
- 数据：`src/data/poses.ts` 定义 `DEFAULT_POSE` 与 9 个 `POSE_PRESETS`（自然站立/侧身/头转向主光/低头/抬一只手/双手下垂/一只手叉腰/身体前倾/轮廓光站姿）。角度为工程默认，**待 Codex 视觉定夺**。`buildPersonFromPreset` 默认带 `pose`。
- 骨架重构：`Person.tsx` 从平铺绝对定位改为层级枢轴——torso 枢轴(pitch/yaw)→ 头枢轴(pitch/yaw) + 左右臂肩枢轴(pitch + roll)→ 肘枢轴(forearm bend)；手臂拆上臂+前臂。腿/盆骨保持静态。所有实心 mesh 保留 castShadow/receiveShadow。
- 符号约定（person 朝 +Z）：头/躯干 pitch + = 前倾/低头(本地 X 正)；手臂 pitch + = 前摆(本地 X 取负)；左臂 roll 取负实现外展镜像；前臂在肘部二级枢轴。
- UI：`PersonPanel` 加「姿态」预设下拉 + 「姿态微调」10 个度数滑杆（经 `setPose` 局部更新 `person.pose`）。
- 随场景天然支持：方案保存/恢复、A/B、导出都含 pose；`Person` 加 `pose ?? DEFAULT_POSE` 兜底，防旧快照(无 pose)载入崩溃。
- 验证：预览实测「抬一只手」右臂抬起外展+肘弯、「身体前倾」侧视确认上身朝镜头倾斜，骨架无脱节、投影正常；`tsc -b` / `lint` / `build` 全通过。
- 分工：高风险的层级骨架(枢轴/符号)交 qwen3.7-max 起草、Claude 逐枢轴审核 + 预览校正；面板 UI 交 qwen3-coder；姿态预设角度值由 Claude 给工程默认、标注待 Codex 调。



### v0.3.4 - 人物承载面 + 灯光自动对齐

日期：2026-06-18

负责人：Codex

完成内容：

- 术语修正：将用户所说“人台”拆成两类，`mannequin` 继续表示服装人台；可放真人上去的物体归入 `platform`，命名为“直播圆形小舞台 / 人物站台”。
- 对象库：`src/data/sceneObjects.ts` 新增 `stage-round-live`，默认尺寸 `1.2 × 1.2 × 0.3m`，圆柱几何，白色亚光，可投影、可接收阴影。
- 人物高度：`PersonPanel` 新增“离地 Y”滑杆；人物可以通过“放到承载物”下拉一键落到桌面、椅面、凳面、沙发坐面、台座、箱体或舞台台面；新增 `src/domain/supportSurfaces.ts` 集中计算承载面高度。
- 对象高度：`ObjectPanel` 新增“离地 Y”，支持临时把桌椅/台座/舞台整体抬高。
- 灯光目标：新增 `LightTargetMode = manual | person | peopleCenter`；`LightRig` 渲染时通过 `src/domain/lightTargets.ts` 计算有效目标点。手动模式保持旧行为；锁定人物和多人中心会随人物 X/Z/Y 与身高变化实时更新。
- UI：灯光参数面板新增“目标 / 对齐”，可选择手动、锁定人物、多人中心；“对准一次”会写入当前人物目标点并切回手动。
- 验证：`npm run lint` 通过；`npm run build` 通过，仍有 Vite 大 chunk 提示，不影响运行。

### v0.3.2 - 白棚结构/道具/人台工程接入

日期：2026-06-18

负责人：Claude Code（代码起草：OpenRouter qwen3.7-max + qwen3-coder）

完成内容：

- 类型：`SceneObjectConfig` 新增 `geometry: SceneObjectGeometry`（`kind` 无法区分长桌/圆桌、半身/全身人台，渲染几何体须显式携带）；`SceneObjectGeometry` 提到 `types.ts` 作类型源头，`sceneObjects.ts` 改为从 types 导入。
- store：新增 7 个对象动作 `addObject`(按预设)/`duplicateObject`/`removeObject`/`updateObject`/`setObjectPositionXZ`/`rotateObject`/`toggleObjectVisibility`，上限 `MAX_OBJECTS = 12`；`DragTarget` 扩展到 `'light' | 'person' | 'object'`。
- 渲染：新增 `src/scene/SceneObjects.tsx`，按 `geometry` 画 box/cylinder/panel/chair/sofa/mannequinHalf/mannequinFull 简化体；材质取 `SCENE_OBJECT_MATERIALS`（颜色用对象自身 color 覆盖，opacity<1 时透明）；逐对象 castShadow/receiveShadow、选择环、脚下隐形拖拽热区。
- 接线：`StudioScene` 渲染 `SceneObjects` 并把 `object` 接入 `GroundDragController`（拖拽走 `setObjectPositionXZ`）；`ObjectList` 加「道具 / 结构」组（预设库下拉添加 + 显隐/复制/删除，满 12 提示）；`ParamPanel` 加 `ObjectPanel`（名称/类型/显示、位置 XZ/朝向、宽深高、材质 Segmented/颜色、投射·接收阴影·俯视标签）。
- 道具随方案保存 / A/B 对比 / 导出天然包含（快照即整 `SceneConfig`）。
- 预览实测（全新上下文）：加长桌(木)/椅子(黑)/方形台座(白)/全身人台(白)/背景板，各自材质与地面投影正确，遮挡关系清楚；`tsc -b` / `lint` / `build` 全通过。
- 注：拖拽对象沿用人/灯同一 `GroundDragController` 机制，自动化预览无法驱动真实 3D 拖拽（R3F 不吃合成指针事件），建议真机确认手感。

### v0.3.1 - 白棚结构对象规格先行

日期：2026-06-18

负责人：Codex

完成内容：

- `src/types.ts` 新增 `SceneObjectKind` / `SceneObjectMaterial` / `SceneObjectSize` / `SceneObjectConfig`，并在 `SceneConfig` 中预留 `objects: SceneObjectConfig[]`。
- `src/data/defaults.ts` 新增 `buildDefaultObjects()`，默认返回空数组；当前打开应用仍保持干净白棚，不自动塞道具。
- 新增 `src/data/sceneObjects.ts`：定义首批结构对象预设、默认尺寸、默认位置、材质、投影规则、用途说明和 v0.3 默认沟通场景。
- `RENDERING_SPEC.md §6.5` 增加白棚结构与道具的视觉规则、尺寸表、材质规则、俯视图表达和验收场景。
- `ROADMAP.md` 标记 v0.3 Codex 规格已完成，下一步交给 Claude Code 工程接入。
- 封包/开源策略调整：不在 v0.3 后立即封包，等 v0.3-v0.6 核心功能都完成且稳定后再做 v0.7 可开源第一版；这条策略已在 v0.7 / v0.7.1 执行完成，后续路线已调整为先更多光源、再自定义灯具预设，多语言后置。

### v0.2.3 - 侧视修复 + 拖拽控制器去重 + 灯-人耦合排查

日期：2026-06-18

负责人：Claude Code

完成内容：

- 侧视全白修复：侧视正交相机在 x=22，被 x=±4 的白色侧墙整面遮挡。Studio 新增 `suppressSideWalls`，由 `SceneContents` 在 `view === 'side'` 时传入，侧视不渲染侧墙，人物侧剖面恢复可见（截图验证）。
- 移除与 Codex `GroundDragController` 重复的旧 `DragPlane`（v0.1.0 遗留），消除两套拖拽控制器并存；用户在真机确认拖人物/拖灯仍顺手。
- 排查“拖动人物灯光会跟随”：实测人物 X 0→2 时 Key Light 距离 3.69m→2.53m、角度 49°→18° 如实变化，灯绝对位置不动；代码确认灯 target 全静态、唯一逐帧循环是相机。结论：非 bug，是“灯静止、人走位 → 人身上受光/阴影随之变化”的正确物理。用户选择暂不加“灯锁定人物”开关，留到 v0.3 灯光目标模式。
- `tsc -b` / `lint` / `build` 全通过。


### v0.2.2 - A/B 切换黑屏修复 + v0.3 范围补充

日期：2026-06-18

负责人：Codex

完成内容：

- 修复 A/B 对比切回其他视图后画布黑屏：`Stage` 外层尺寸监听容器保持常驻，不再在 compare/normal 之间整体替换。
- 普通视图的 `StudioScene` 按 viewMode 加 key，切换镜头/自由/俯视/侧视时重新初始化对应相机。
- `setViewMode` 切换视图时清空 `dragTarget`，避免拖拽状态跨视图残留。
- 人物模型新增不可见地面热区，让俯视图里更容易点中并拖动人物。
- 新增全局地面拖动控制器：拖动开始后，用当前相机射线投到地面更新人物/灯具 XZ 位置，减少拖动过程丢失命中的情况。
- 拖拽平面拦截 pointer up / click，避免拖完人物或灯具后被白棚误选中。
- 拖动结束后恢复选中刚拖动的目标，避免释放鼠标时误选到旁边灯具或地面。
- 顶栏版本显示更新为 `v0.2.2`。
- `ROADMAP.md` 将 v0.3 补充为：人物继续可拖动、灯光目标支持主人物/选中人物/多人中心/指定点、白棚结构对象可拖动旋转。
- `ROADMAP.md` 新增 v0.7 桌面 App 封包交付线：Electron/Tauri 均可作为内测封包候选，先保证核心功能稳定再封包。2026-06-20 路线更新后，v0.7 同时是可开源第一版收口；v0.7 之后即可开源。

### v0.2.1 - 多人物视觉定稿

日期：2026-06-18

负责人：Codex

完成内容：

- 默认人物名称从 `Actor` 调整为 `Actor A`。
- 新增 `PERSON_STAGING_PRESETS`，统一管理 Actor A-E 的默认站位、朝向、肤色和服装色。
- 新增人物默认站位改为：A 居中、B 左后、C 右前、D 左前外侧、E 右后外侧。
- 服装颜色采用低饱和深色组，便于区分人物但不抢灯光色彩判断。
- `addPerson` 改为按 `PERSON_STAGING_PRESETS` 生成新人物，不再横向等距堆到右侧。
- 将多人物视觉规则同步到 `RENDERING_SPEC.md` 与 `ROADMAP.md`。
- `npm run lint` 通过，`npm run build` 通过。

### v0.2.0 - 多人物与站位

日期：2026-06-18

负责人：Claude Code（代码起草：OpenRouter qwen3.7-max + qwen3-coder）

完成内容：

- `src/data/defaults.ts` 新增 `MAX_PEOPLE = 5`。
- store 新增 `addPerson` / `duplicatePerson` / `removePerson` / `rotatePerson`：
  - v0.2.0 初版：addPerson 从 `buildDefaultPerson()` 起步，新 id、命名 `Actor N`、位置按人数横向错开（x 夹在 ±3.8）。
  - v0.2.1 当前规则：addPerson 已改为读取 `PERSON_STAGING_PRESETS`，以 Actor A-E 的默认站位/朝向/颜色生成。
  - duplicatePerson 深拷贝并右移 0.7m；removePerson 永远保底留 1 人，删到选中项时改选第一个。
- `ObjectList` 人物区对齐灯光区：标题加「＋ 添加人物 / 满 5」，每行 hover 出「复制 / 删除」（仅剩 1 人时删除禁用）。
- `StudioScene` 由只渲染 `people[0]` 改为遍历 `scene.people`，逐人选择环 + 逐人拖拽（drag 仍走 `setPersonPositionXZ(id)`，机制不变）；灯到人距离标注仍以主人物 `people[0]` 为参照。
- `ParamPanel` 的 `PersonPanel` 本就按 id 通用，无需改动即支持多人编辑。
- 方案保存 / A/B 对比 / 导出图天然包含多人物（快照即整 `SceneConfig`，B 为深拷贝，改 A 不动 B）。
- 预览实测：加到 3 人各自投影、逐人选中联动面板、俯视显示全部、删到 1 人时删除禁用；`tsc -b` / `lint` / `build` 全过，无运行时报错。命名/站位当前以 v0.2.1 规则为准。
- 模型分工：带逻辑的 store 动作与场景渲染交 qwen3.7-max，机械 UI 接线交 qwen3-coder，Claude 全程审核 + 集成 + 验收。

### v0.1.5 - 对比视图灯光摘要（首个委托写码案例）

日期：2026-06-18

负责人：Claude Code（代码起草：OpenRouter glm-5.2）

完成内容：

- 新增纯函数 `src/domain/lightingSummary.ts`：`summarizeLighting(scene)` 返回单行中文摘要，如 `3 灯 · 主柔光 1.8 / 柔75% / 5600K`（取开启灯中强度最高者为主灯；色温优先显示 K，否则显示十六进制色）。
- 对比视图 A/B 两块画面的角标下各加一行摘要，导演无需进面板即可读出两边灯光差异。
- 协作流程：纯函数由 `z-ai/glm-5.2` 按 Claude 写的精确规格起草，Claude 逐行审核（类型、边界、风格）后落盘并接线；`tsc -b` / `lint` / `build` 全通过，预览实测 A=硬光 2.0/柔10%、B=柔光 1.8/柔65% 摘要如实区分。
- 说明：用户已有 OpenRouter key，约定编程时由 glm-5.2 / qwen 写码、Claude 审核以更持久使用；qwen-3.7 当时被账号隐私设置挡住，现以 glm-5.2 为主力。

### v0.1.4 - 白棚结构、道具和人台需求拆分

日期：2026-06-18

负责人：Codex

完成内容：

- 在 `ROADMAP.md` 新增 v0.3：白棚结构、道具和人台。
- 将路线图顺延为 v0.2 多人物与站位、v0.3 白棚结构/道具/人台、v0.4 人物基础姿态、v0.5 灯具器械预设库、v0.6 控光附件。
- 明确桌子、椅子、台座、人台、背景板等结构对象的 MVP 范围、数据结构建议、分工和验收标准。
- 更新 README 与 CLAUDE 入口说明。

### v0.1.3 - 后续需求拆分

日期：2026-06-18

负责人：Codex

完成内容：

- 新增 `ROADMAP.md`。
- 确认 A/B 对比已由 Claude Code 在 v0.1.2 完成，后续功能默认都要能用 A/B 验证差异。
- 将后续需求拆成版本线：v0.2 多人物与站位、v0.3 人物基础姿态、v0.4 灯具器械预设库、v0.5 控光附件。
- 注：v0.1.4 后插入“白棚结构、道具和人台”，后续版本号已顺延。
- 继续沿用原分工：Codex 定义产品/视觉/渲染规格与验收，Claude Code 负责工程落地和本地验证。
- 将 README 与 CLAUDE 入口文档指向 `ROADMAP.md`。

### v0.1.2 - A/B 多方案对比视图

日期：2026-06-18

负责人：Claude Code

完成内容：

- 顶部视图切换新增第 5 个标签「对比」（`ViewMode` 增加 `'compare'`）。
- 对比布局：中央舞台分左右两块 letterbox 画面。左 A=`store.scene`（实时、可经右侧面板编辑），右 B=`compareB` 冻结快照（`SceneConfig` 克隆，编辑 A 不影响 B）。两块各按自己快照的画幅比 letterbox，均锁定镜头机位、非交互。
- B 槽来源三种：① 下拉选任一已存方案（`LightingPreset.sceneSnapshot`）；② 「冻结当前为 B」把当前 A 拷一份固定；③ 「⇄ 交换 A/B」把 B 变成在编辑的 A、原 A 退到 B。
- 进入对比模式时若 B 为空，自动把当前场景冻结为 B，立刻就有得比。
- 顶部新增对比控制条 `src/ui/CompareControls.tsx`；对比模式下隐藏左上角浮动视图徽标避免重叠。
- 工程：把 `StudioScene` 参数化（可传入任意 `scene`、强制 `view`、`interactive`、`registerCapture`），两个画布复用同一套场景图，不重复代码；只有 A 画布注册截图桥，导出/存方案仍走 A。
- 顺手修复预览端口：`vite.config.ts` 现读 `PORT` 环境变量，`.claude/launch.json` 开 `autoPort`，预览可自动避开被占用的 5173。
- `tsc -b` / `npm run lint` / `npm run build` 全通过；预览中逐项验收（进对比→改 A→B 不动→交换）均正常，无运行时报错。

### v0.1.1 - Codex 视觉定稿与主干拆分

日期：2026-06-18

负责人：Codex

完成内容：

- 将项目文件夹移动到 `/Users/admin/Desktop/direct light`。
- 复核 v0.1.0 默认视图、Low Key Hard、High Soft Commercial、RGB Rim 的实际画面。
- 默认摄影机从 `z=5.2` 拉远到 `z=6.2`，目标点从 `y=1.2` 降到 `y=1.05`，给人物脚下和地面阴影更多余量。
- 决定暂不调整 `SPOT_INTENSITY_SCALE=9` 与 `toneMappingExposure=1.0`：当前默认、硬光、柔光都能保留受光和阴影层次。
- 决定暂不调整彩色染色强度：RGB Rim 的蓝色染色可见但不过量。
- 按 `ARCHITECTURE.md §3.1` 拆薄 `src/App.tsx`，新增 `src/app/DirectLightApp.tsx` 与 `src/app/AppShell.tsx`。
- 修复 `src/scene/LightRig.tsx` 的 React Hook lint 警告。
- `npm run build` 通过，`npm run lint` 通过。

### v0.0.3 - 代码结构约定

日期：2026-06-17

负责人：Codex

完成内容：

- 检查当前 `src` 代码结构。
- 识别现有 `LightRig.tsx` 与 `capture.ts` 的合理归属。
- 新增 `ARCHITECTURE.md`。
- 明确主干原则：`main.tsx` 和 `App.tsx` 保持薄入口。
- 明确模块空间：`app`、`scene`、`panels`、`state`、`data`、`domain`、`lib`。
- 明确后续调试入口和新文件放置规则。
- 更新 `README.md` 与 `CLAUDE.md`，让 Claude Code 优先阅读架构文档。

### v0.1.0 - 可运行的白棚灯光预览

日期：2026-06-17

负责人：Claude Code

完成内容：

- 安装并接入 Three.js / React Three Fiber / drei / Zustand / Tailwind v4。
- 移除 Vite starter，落地四区主界面（对象列表 / 3D 预览 / 参数面板 / 方案栏）。
- 按 `RENDERING_SPEC.md` 实现：白棚（地面+后墙+侧墙+顶面+无缝弧形 fillet）、简化人物（头/躯干/四肢/朝向）、灯具映射（硬/柔/面光）。
- 默认场景：右前 45° 主光（柔光 5600K）开启并投射实时阴影，补光/彩色轮廓光默认关闭。
- 全局补光 = 反射强度映射的 ambient + hemisphere；彩色光按饱和度做环境染色（彩光真实影响白棚，而非仅改 UI）。
- 阴影用 VSMShadowMap，`softness` 经 `getShadowRadius/getPenumbra` 控制软硬。
- 视图：镜头（按画幅 16:9/4:3/1:1/9:16 letterbox 锁定）、自由（轨道）、俯视（灯位图 + 灯到人距离标注）、侧视。
- 交互：点选对象、灯光参数全套（类型/开关/颜色/色温/亮度/高度/距离/方位/光束角/柔硬/对准人物）、自由/俯视中拖灯改灯位。
- 方案：保存到 LocalStorage（含缩略图）、载入、复制、删除；导出当前预览 PNG。
- 内置三个调试预设：Low Key Hard / High Soft Commercial / RGB Rim。

本地截图验收（自由+俯视）：硬↔柔阴影差异、灯高↔影长、彩光染白棚、低反射变暗变沉，均肉眼可辨。

### v0.0.2 - 渲染规格与协作机制

日期：2026-06-17

负责人：Codex

完成内容：

- 新增 `RENDERING_SPEC.md`。
- 新增 `COLLABORATION.md`。
- 在 `README.md` 增加文档索引。
- 在 `CLAUDE.md` 增加阅读顺序和协作要求。
- 明确 Codex 与 Claude Code 的分工。
- 明确当前项目状态：已有 Vite 骨架，尚未实现灯光模拟。

### v0.0.1 - 需求文档

日期：2026-06-17

负责人：Codex

完成内容：

- 新建 Direct Light 项目文件夹。
- 新增 `README.md` 产品需求文档。
- 新增 `CLAUDE.md` 给 Claude Code 的入口说明。
- 明确项目定位、MVP、功能范围、数据结构和验收标准。

## 6. 已完成事项

文档（Codex）：

- 创建项目目录与完整产品需求文档。
- 建立 Claude Code 入口说明、渲染规格、协作记录、代码架构文档、后续路线图。

v0.1.0 实现（Claude Code，2026-06-17）：

- 安装并接入 Three.js / R3F / drei / Zustand / Tailwind v4，移除 Vite starter。
- 四区主界面：对象列表 / 3D 预览 / 参数面板 / 方案栏 + 视图切换。
- 白棚（地面+后墙+侧墙+顶面+无缝圆角近似）、简化人物（头/躯干/四肢/朝向）、灯具映射（硬/柔/面光）。
- 默认主光开启并投射实时阴影（VSMShadowMap，`softness→shadow.radius` 生效）。
- 反射→ambient/hemisphere 补光、彩光环境染色（真实影响白棚）。
- 四视图（镜头 letterbox / 自由 / 俯视灯位图含距离标注 / 侧视）。
- 灯光全套参数 + 拖灯改位 + 对准人物；方案存取（LocalStorage + 缩略图）；导出 PNG；三个调试预设。
- `npm run dev`/`build`、`tsc -b` 全通过；自由+俯视逐项截图验收通过。
- 代码结构与 `ARCHITECTURE.md` 基本一致：`scene`/`data`/`state`/`lib`/`ui`（面板用 `ui`，纯函数用 `lib`，均为架构文档允许的选项）。

v0.1.1 调整（Codex，2026-06-18）：

- 项目已移动到桌面路径。
- 默认摄影机构图已定稿并写回 `src/data/rendering.ts` / `RENDERING_SPEC.md`。
- 全局亮度标定和彩色染色强度暂时保持。
- `App.tsx` 已拆成薄入口，主布局移入 `src/app`。
- lint 警告已清零。

v0.1.2 实现（Claude Code，2026-06-18）：

- A/B 对比视图：左实时编辑 A、右冻结对照 B，改 A 即时看前后差异。
- B 来源：已存方案下拉 / 冻结当前 / 交换 A/B；进对比自动冻结当前为 B。
- `StudioScene` 参数化复用，新增 `src/ui/CompareControls.tsx`、store `compareB` 状态与动作。
- 预览端口修复：`vite.config.ts` 读 `PORT`、`.claude/launch.json` 开 `autoPort`。
- `tsc -b` / `lint` / `build` 全通过，预览逐项验收无报错。

v0.1.3 / v0.1.4 文档拆分（Codex，2026-06-18）：

- A/B 已作为后续功能的默认验收方式。
- `ROADMAP.md` 已包含多人物、白棚结构/道具/人台、人物姿态、灯具器械库和控光附件。
- README、CLAUDE、COLLABORATION 已同步指向新路线。

## 7. 当前待完成事项

P0（v0.1.0，✅ 全部完成）：主界面、3D 场景、人物、摄影机、默认主光+实时阴影、可见灯位/阴影变化。

P1（基本完成）：

- ✅ 对象列表（人物/灯光/摄影机/白棚）
- ✅ 灯光参数面板（颜色/亮度/高度/柔硬/类型 硬柔面）
- ✅ 俯视图
- ✅ 本地保存灯光方案

P2（部分完成）：

- ✅ 彩色轮廓光预设（RGB Rim 调试预设）
- ✅ 白棚反射强度调节
- ✅ 导出当前预览图（PNG）
- ✅ 灯到人物距离标注（俯视）
- ✅ A/B 方案对比（v0.1.2）

下一轮待办（按建议优先级）：

1. ✅ **[Claude] v0.2 多人物与站位**（v0.2.0 完成）：添加/复制/删除人物、逐人选择/编辑/拖拽、多人投影、A/B 含多人。
2. ✅ **[Codex] v0.2 视觉规格**（v0.2.1 完成）：定义默认多人站位、Actor A-E 命名、低饱和服装色、俯视图朝向表达。
3. ✅ **[Codex] v0.2.2 黑屏修复与 v0.3 范围补充**：修复 A/B 切回其他视图黑屏；把人物拖动、灯光目标模式和桌面封包写入路线图。
4. ✅ **[Codex] v0.3 视觉规格**（v0.3.1 完成）：定义首批道具默认尺寸、材质对光影的影响、俯视图表达、“拍摄前沟通场景”验收图，以及灯光目标模式默认行为。
5. ✅ **[Claude + Codex] v0.3 白棚结构/道具/人物承载面/灯光目标模式**：结构对象接入、材质修复、直播圆形小舞台、人物离地高度、承载面放置、灯光自动对齐已完成。
6. ✅ **[Claude + Codex] v0.4a 人物基础姿态**：层级骨架、站姿/侧身/低头/抬手/叉腰近似/前倾/轮廓光测试预设、10 个微调滑杆已完成；Codex 已补旧方案迁移。
7. ✅ **[Claude] v0.4.3 前置轻量拆分**（完成）：`ParamPanel.tsx` 拆成 5 个面板文件 + `PanelHeader`，降为纯分发；`StudioScene.tsx` 拆出 `CameraRig`/`GroundDragController`/`CameraGizmo`/`DistanceLabel`；目录统一 `src/ui`；`store.ts` 暂缓拆。产品行为不变，`tsc·lint·build` 全绿。
8. ✅ **[Claude] v0.4.4 v0.4b 姿态与承载物联动**（完成，用户验收）：坐姿骨架、坐/站承载面分流、放到承载物自动坐下/站立校正脚底、起立回地面、前臂内旋修复让叉腰到位。
9. ✅ **[Hermes + Codex] attach-to-support 实时绑定**（v0.4.5，用户验收通过）：人物绑定承载物后，移动/旋转承载物时人物跟随；手动挪人/回到地面/删除承载物时解绑。
10. ✅ **[Hermes + Codex] v0.4.6 A/B 对比产品引导**：明确 A=当前编辑、B=冻结参考；B 为空时给清晰入口；显示 B 来源；增加差异大类摘要。**用户真机验收通过**。
11. ✅ **[Claude + glm-5.2] v0.4.7 v0.4c 摄影机控制**（用户真机验收通过）：方位角/距离/高度/看向高度、目标模式（手动/锁定人物/多人中心）、5 个机位预设、从自由视角取景、A/B 摄影机差异、棚内夹紧、自由/俯视拖拽摄影机均已完成。
12. ✅ **[Claude + Hermes + Codex] v0.5.0 灯具器械预设库**（用户真机验收通过）：8 个灯具预设、`applyFixturePreset`、LightPanel 器械下拉和能力标签已完成。
13. ✅ **[Claude/Codex] v0.5.1 渲染可信度**（用户真机验收通过）：真实弧形 cyclorama、柔/面光/RGB 灯管可见灯体、`floorReflectance` 地面反弹权重已落地。
14. ✅ **[Claude/Codex] v0.6a 控光附件 MVP**（用户真机验收通过）：四个灯上附件、有效光质、A/B 差异和保存字段已落地。
15. ✅ **[Claude/Codex] v0.6b 附件视觉 + 导演视角简介**（用户视觉验收通过）：四个灯上附件有 3D 可见形体，镜头视角选中灯时显示一行导演简介。
16. ✅ **[Claude/Codex] v0.6c 棚内独立控光器材**（用户真机视觉验收通过）：黑旗、反光板、柔光布框作为现有 object 系统的新对象类别，零光学。
17. ✅ **[Hermes + Claude + Codex] v0.6d 近似光学效果**（用户真机视觉验收通过）：按 `V0_6D_OPTICS_SPEC.md` 做黑旗吃光/负补光、反光板弱补光、柔光布框软化；验收修复已隐藏 gear 材质选择器；TopBar 已升 `v0.6d`。
18. ✅ **[Claude + Codex] v0.6e 收口**（用户视觉验收通过）：按 `V0_6E_CLOSEOUT_SPEC.md` 做 A/B「控光器材」差异类别、保存/加载/复制/A-B/导出回归、README 开源前限制说明；TopBar 已升 `v0.6e`。
19. ✅ **[Claude 主导 + Codex 复核] v0.7 可开源第一版 / 桌面封包**：正式开源 README / license / 运行说明 / 已知限制 / 路线图、GitHub Pages、Tauri macOS 封包与 Release CI 均已完成。
20. ✅ **[Claude 主导] v0.7.1 应用图标 / Release 收口**：正式 App 图标已替换，`package.json` / `tauri.conf.json` / `Cargo.toml` / TopBar 版本同步到 `0.7.1`，latest `.dmg` 已发布。
21. ✅ **[Claude Code + Codex] v0.8 更多光源 / 多灯管理**（用户视觉验收通过）：灯光上限提高到 6、默认仍 Key/Fill/Rim 三盏、列表计数/满额状态可读；A/B、保存、导出路径确认不丢 6 灯。
22. **[后续] v0.9 自定义灯具预设导入/导出**：用严格 JSON schema 支持用户保存、导出、导入自己的灯具预设，不做任意参数上传或真实 IES/光度文件。
23. **[后续] 多语言 UI**：在核心功能和字段更稳定后再抽取简体中文 / 英语 / 日语文案；保存方案、A/B 和场景数据不能依赖语言。

## 8. 开发验收清单

截图验收时间：2026-06-17（v0.1.0）

### 第一阶段：可见白棚 ✅

- ✅ 页面不再显示 Vite 默认 starter。
- ✅ 中央有白棚 3D 视图。
- ✅ 能看到人物、地面、后墙。
- ✅ 摄影机视角构图合理（Codex 已将默认机位拉远，见 §11）。

### 第二阶段：可见灯光 ✅

- ✅ 默认主光打开。
- ✅ 人物受光明显。
- ✅ 地面有阴影。
- ✅ 改变灯位时，受光和阴影实时变化。

### 第三阶段：可调参数 ✅

- ✅ 灯高 / 亮度 / 颜色 / 柔硬均可调。
- ✅ 调参后画面变化明显（硬↔柔、灯高↔影长、彩光染棚均肉眼可辨）。

### 第四阶段：导演可用 ✅

- ✅ 俯视图能看清人物、灯、摄影机位置（含灯到人距离标注）。
- ✅ 可保存 / 恢复方案（LocalStorage，带缩略图）。
- ✅ 可导出预览图（PNG）。

## 9. 关键决策记录

### 决策 001：先做实时近似，不做路径追踪

原因：

- 导演需要快速反馈。
- 第一版重点是灯位、阴影和颜色关系。
- 路径追踪会显著增加实现复杂度。

结论：

- MVP 使用实时 Three.js 渲染。
- 白棚反射用环境光、半球光和经验补光近似。

### 决策 002：先做假人，不做写实角色

原因：

- 第一版重点是灯光关系。
- 写实角色会消耗大量建模和材质时间。

结论：

- MVP 用简化站立人物。
- 体块必须能表现头、躯干、四肢和朝向。

### 决策 003：渲染规格用数值文档管理

原因：

- Codex 后续需要根据截图调光。
- Claude Code 需要清楚的实现目标。

结论：

- 默认灯光、白棚反射、阴影规则统一写在 `RENDERING_SPEC.md`。
- 实现代码应尽量从这些规格映射。

## 10. 下一步建议

v0.2 多人物、v0.3 白棚结构/道具、v0.4 人物姿态、v0.4.5 承载物实时绑定、v0.4.6 A/B 引导、v0.4.7 摄影机控制、v0.4.8 store action 拆分、v0.5.0 灯具器械库、v0.5.1 渲染可信度、v0.6a 控光附件 MVP、v0.6b 附件视觉/导演简介、v0.6c 棚内独立控光器材、v0.6d 近似光学、v0.6e 收口、v0.7 开源第一版和 v0.7.1 桌面图标 / Release 都已通过。不要重复做摄影机面板、store 拆分、灯具库第一版、v0.5.1 主体实现、v0.6a 附件数值、v0.6b 附件视觉、v0.6c gear 视觉、v0.6d 光学公式、v0.6e A/B 收口或 v0.7 开源收口。

建议先做最小闭环：

1. v0.9 自定义灯具预设导入/导出：用严格 JSON schema 支持用户沉淀自己的灯具参数。
2. 后续多语言：等核心功能和字段稳定后，再抽取简体中文 / 英语 / 日语 UI 文案，并验证切换语言不改变场景、A/B 或保存方案。

## 11. Codex 视觉定夺（v0.1.1）

Codex 已在 2026-06-18 定夺：

1. **默认镜头构图**：拉远机位。`DEFAULT_CAMERA.position.z` 从 `5.2` 调到 `6.2`，`target.y` 从 `1.2` 调到 `1.05`，让人物脚下和地面阴影有更多余量。
2. **SpotLight 亮度标定**：暂不调整。`SPOT_INTENSITY_SCALE=9` 与 `toneMappingExposure=1.0` 当前能兼顾默认柔光、低调硬光和高柔广告感，既不明显过曝，也保留阴影层次。
3. **彩色染色强度**：暂不调整。`getColorBounceIntensity` 的 `0.12` 系数和 `0.28` 上限在 RGB Rim 下可见但不过量，适合作为第一版预演强度。

工程侧已知简化（非阻塞，后续可做）：

- v0.5.1 已把无缝弧形背景改成一体 cyclorama surface；仍是实时 Three.js 近似，不是物理路径追踪。
- v0.5.1 已给柔光/面光/RGB 灯管补可见灯体；照明和阴影仍由 SpotLight 近似承担，不使用 RectAreaLight 作为真实照明。
- v0.5.1 已让 `floorReflectance` 进入 ambient/hemisphere/colored bounce；仍是经验公式，不是物理 GI。
- 拖拽支持灯/人/道具/摄影机在地面 XZ 平移（高度走滑杆）；侧视拖拽不是主要路径，优先按自由/俯视验收。

## 12. 后续路线图索引

完整后续需求拆分见 `ROADMAP.md`。

当前版本线：

- v0.2：多人物与站位。
- v0.3：白棚结构、道具和人台，例如桌子、椅子、台座、背景板、人台。
- v0.4：人物基础姿态。
- v0.5：灯具器械预设库，例如 Nanlux Evoke 600C / 南光体系灯具。
- v0.6：控光附件和棚内控光器材，例如柔光箱、蜂巢、黑旗、反光板、柔光布框。
- v0.7：开源第一版、GitHub Pages、Tauri macOS 桌面封包和 v0.7.1 正式图标。
- v0.8：更多光源 / 多灯管理。
- v0.9：自定义灯具预设导入/导出。
- 后续：多语言 UI。

如何运行：`npm install` → `npm run dev`（端口 5173）。`.claude/launch.json` 已配置预览。
