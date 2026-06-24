# V0.10.1 Built-In Display Labels + Scene Diff Copy Spec

> Status: COMPLETE / USER-ACCEPTED (Claude-led, 2026-06-24). User real-machine visual acceptance passed; Codex copy review found no blocking en/ja changes. Spec §5 wording remains the authoritative first-pass copy.
> Owner split: Codex owns product wording and acceptance rules; Claude Code owns implementation and verification. OpenRouter may draft mechanical table wiring only after Claude gives it this spec; Claude must review every string and call site.

## 1. Goal

v0.10.1 finishes the data-derived display text that v0.10b intentionally left raw.

This slice localizes built-in labels and director-facing derived summaries without changing scene data, built-in data records, custom fixture JSON, saved presets, or rendering behavior.

## 2. Scope

Translate / localize:

- Built-in light type labels.
- Fixture capability labels.
- Built-in fixture display labels.
- Light modifier labels, short labels, and effect phrases.
- Light target mode labels.
- Color swatch labels.
- Camera preset labels.
- Pose preset labels.
- Scene-object preset labels.
- Scene-object material labels.
- Scene-object kind display labels shown in object rows/panels.
- Support-surface option labels in `PersonPanel`.
- Effective light summary in `LightBeamSection`.
- Director light brief overlay in camera view.
- A/B compare scene-diff category labels and hints.
- A/B pane lighting summary.
- Top-bar debug preset button `title` copy.

Do not translate in this slice:

- User-authored strings: light names, person names, object names, preset names, custom fixture labels.
- Brand/model names: for example `Nanlux Evoke 600C`.
- Units and physical symbols: `m`, `K`, `W`, `%`, `mm`, `°`.
- Built-in ids: for example `generic-cob-600d`, `blackFlag`, `peopleCenter`.
- Exported custom fixture JSON schema fields.
- Dormant data notes/use cases not currently rendered in UI, such as `fixture.notes`, `SCENE_OBJECT_PRESETS.useCase`, and `SCENE_OBJECT_MATERIALS.shadowNote`.
- Custom fixture parser/normalizer warning strings in `domain/customFixtures.ts` and `domain/customFixturePack.ts`; those are not surfaced as detailed localized UI in v0.10.1.
- Docs and comments.

## 3. Architecture

Add a small pure display layer:

- `src/i18n/display.ts`

Suggested exports:

```ts
getLightTypeLabel(language, type)
getFixtureDisplayLabel(language, fixture)
getFixtureCapabilityLabel(language, fixture)
getModifierLabel(language, modifierId)
getModifierShortLabel(language, modifierId)
getModifierEffectPhrase(language, modifierId)
getLightTargetModeLabel(language, mode)
getColorPresetLabel(language, nameOrColor)
getCameraPresetLabel(language, presetId)
getPosePresetLabel(language, presetId)
getSceneObjectPresetLabel(language, presetId)
getSceneObjectMaterialLabel(language, material)
getSceneObjectKindLabel(language, kind)
getSupportSurfaceLabel(language, object, y, role)
```

Implementation notes:

- Helpers take `language: AppLanguage`; they do not read Zustand directly.
- Keep source data in `src/data/*` unchanged.
- Built-in records map by stable ids/enums.
- If a helper cannot find a localized built-in label, fall back to the existing source label or id.
- Custom fixtures must return `fixture.label` exactly as authored.
- User object/light/person/preset names must pass through unchanged.
- Prefer adding one new `messages/display.ts` domain file for these labels, then register it in `messages/index.ts`.
- Use the current typed dictionary pattern: zh source object `as const`, `en`/`ja` typed as `Record<Key, string>`.

## 4. Expected Code Touches

Allowed:

- `src/i18n/display.ts`
- `src/i18n/messages/display.ts`
- `src/i18n/messages/index.ts`
- `src/ui/light-panel/*`
- `src/ui/object-list/*`
- `src/ui/CameraPanel.tsx`
- `src/ui/PersonPanel.tsx`
- `src/ui/ObjectPanel.tsx`
- `src/app/DirectorLightBrief.tsx`
- `src/app/compare/ComparePane.tsx`
- `src/app/compare/CompareStage.tsx`
- `src/domain/lightBrief.ts`
- `src/domain/lightModifiers.ts`
- `src/domain/lightingSummary.ts`
- `src/domain/sceneDiff.ts`
- `src/domain/supportSurfaces.ts` only if Claude chooses to keep support-label formatting there.
- `src/ui/TopBar.tsx` only for debug preset title localization.

Do not touch:

- `SceneConfig` shape.
- `src/data/*` values except imports/types if truly necessary.
- `src/domain/customFixtures.ts`
- `src/domain/customFixturePack.ts`
- `src/domain/sceneMigration.ts`
- `src/scene/*`
- Tauri/GitHub release workflows.
- TopBar version text.

## 5. Copy Tables

Use these as the first-pass authoritative wording. Claude may adjust only for code fit; product wording changes should come back to Codex.

### 5.1 Light Types

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| lightType.hard | 硬光 | hard light | 硬光 |
| lightType.soft | 柔光 | soft light | 柔光 |
| lightType.panel | 面光 | panel light | 面ライト |

### 5.2 Fixture Capability

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| fixtureCapability.fullColor | 全彩 | full color | フルカラー |
| fixtureCapability.biColor | 双色温 | bi-color | バイカラー |
| fixtureCapability.tungsten | 暖色 | warm/tungsten | 暖色/タングステン |
| fixtureCapability.white | 白光 | white only | 白色光 |

### 5.3 Built-In Fixtures

Custom fixture labels are never translated.

| id | zh-CN | en | ja |
| --- | --- | --- | --- |
| generic-cob-600d | 600W COB 白光 | 600W COB daylight | 600W COB 白色光 |
| generic-cob-600b | 600W COB 双色温 | 600W COB bi-color | 600W COB バイカラー |
| nanlux-evoke-600c | Nanlux Evoke 600C | Nanlux Evoke 600C | Nanlux Evoke 600C |
| generic-led-panel-soft | LED 面板柔光 | soft LED panel | LED ソフトパネル |
| generic-rgb-tube | RGB 灯管 | RGB tube | RGB チューブ |
| generic-fresnel-hard | 菲涅尔硬光 | hard Fresnel | フレネル硬光 |
| generic-small-effect-rgb | 小型 RGB 效果灯 | small RGB effect light | 小型RGBエフェクトライト |
| generic-practical-warm | 暖色实景灯 | warm practical | 暖色プラクティカル |

### 5.4 Light Modifiers

| id | label zh-CN | label en | label ja | short zh-CN | short en | short ja | effect zh-CN | effect en | effect ja |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| softbox-medium | 中号柔光箱 | medium softbox | 中型ソフトボックス | 柔化 | soften | 柔化 | 柔光主光 | soft key | 柔らかい主光 |
| honeycomb-grid | 蜂巢 | honeycomb grid | ハニカムグリッド | 控光 | control | 制御 | 收束控光 | tighter control | 光を絞る制御 |
| standard-reflector | 标准反光罩 | standard reflector | 標準リフレクター | 集中 | focus | 集光 | 集中硬光 | focused hard light | 集光した硬光 |
| diffusion-cloth | 柔光布 | diffusion cloth | ディフュージョンクロス | 扩散 | diffuse | 拡散 | 扩散片 | diffusion | 拡散 |
| none | 无附件 | no modifier | アクセサリなし |  |  |  | 可手动调光 | manually adjustable | 手動調整可 |

### 5.5 Light Target Modes

| mode | zh-CN | en | ja |
| --- | --- | --- | --- |
| manual | 手动 | manual | 手動 |
| person | 锁定人物 | lock to subject | 人物にロック |
| peopleCenter | 多人中心 | people center | 複数人物の中心 |

### 5.6 Color Swatches

Use `COLOR_PRESETS.name` as the key where possible.

| name | zh-CN | en | ja |
| --- | --- | --- | --- |
| White | 白光 | white | 白色光 |
| Warm White | 暖白 | warm white | 暖かい白 |
| Cool White | 冷白 | cool white | 冷たい白 |
| Red | 红 | red | 赤 |
| Blue | 蓝 | blue | 青 |
| Green | 绿 | green | 緑 |
| Cyan | 青 | cyan | シアン |
| Magenta | 品红 | magenta | マゼンタ |
| Amber | 琥珀 | amber | アンバー |

Color-temperature preset labels such as `3200K`, `5600K`, and `6500K` stay unchanged.

### 5.7 Camera Presets

| id | zh-CN | en | ja |
| --- | --- | --- | --- |
| front-full | 正面全身 | front full body | 正面全身 |
| front-45 | 45°侧前 | 45° front side | 45°斜め前 |
| high-angle | 高机位 | high angle | ハイアングル |
| low-angle | 低机位 | low angle | ローアングル |
| top-communication | 俯拍沟通 | overhead planning | 俯瞰確認 |

### 5.8 Pose Presets

| id | zh-CN | en | ja |
| --- | --- | --- | --- |
| natural | 自然站立 | natural standing | 自然立ち |
| side | 侧身站立 | side standing | 横向き立ち |
| head-to-key | 头转向主光 | head toward key light | キーライトを見る |
| head-down | 低头 | head down | うつむき |
| raise-arm | 抬一只手 | one arm raised | 片手を上げる |
| arms-down | 双手下垂 | arms down | 両腕を下ろす |
| hand-on-hip | 一只手叉腰 | one hand on hip | 片手を腰に |
| lean-forward | 身体前倾 | leaning forward | 前傾 |
| rim-test | 轮廓光站姿 | rim-light stance | リムライト立ち |
| seated | 坐姿 | seated | 座り |
| seated-talk | 坐姿·前倾交谈 | seated, leaning into conversation | 座り・前傾で会話 |
| seated-hands-knees | 坐姿·手放膝 | seated, hands on knees | 座り・手を膝に |
| custom | 自定义微调 | custom adjustment | カスタム調整 |
| standingFallback | 站立 | standing | 立ち |
| none | 无 | none | なし |

`sceneDiff.poseLabel` should support the current ids above and legacy aliases that already exist in saved snapshots if any are still present.

### 5.9 Scene Object Presets

| id | zh-CN | en | ja |
| --- | --- | --- | --- |
| table-long | 长桌 | long table | 長テーブル |
| table-round | 圆桌 | round table | 丸テーブル |
| table-square | 方桌 | square table | 角テーブル |
| chair-basic | 椅子 | chair | 椅子 |
| stool-basic | 凳子 | stool | スツール |
| sofa-block | 沙发简化块 | simplified sofa block | 簡易ソファブロック |
| plinth-box | 方形台座 | box plinth | 角台座 |
| plinth-cylinder | 圆柱台座 | cylinder plinth | 円柱台座 |
| platform-low | 低矮平台 | low platform | 低い平台 |
| stage-round-live | 直播圆形小舞台 | round live stage | ライブ用円形ミニステージ |
| mannequin-half | 半身人台 | half-body mannequin | 半身マネキン |
| mannequin-full | 全身人台 | full-body mannequin | 全身マネキン |
| backdrop-panel | 背景板 | backdrop panel | 背景パネル |
| box-basic | 纸箱 / 箱体 | cardboard box / block | 段ボール / 箱 |
| black-flag | 黑旗 | black flag | 黒フラッグ |
| reflector-board | 反光板 | reflector | レフ板 |
| diffusion-frame | 柔光布框 | diffusion frame | ディフュージョンフレーム |

### 5.10 Scene Object Materials

| material | zh-CN | en | ja |
| --- | --- | --- | --- |
| matteWhite | 白色亚光 | matte white | 白マット |
| matteBlack | 黑色亚光 | matte black | 黒マット |
| matteGray | 灰色亚光 | matte gray | グレーマット |
| wood | 木质 | wood | 木材 |
| metal | 金属 | metal | 金属 |
| glass | 玻璃占位 | glass placeholder | ガラス仮置き |
| fabric | 布面 | fabric | 布 |
| scrimWhite | 柔光白（半透明） | diffusion white (translucent) | ディフュージョン白（半透明） |

### 5.11 Scene Object Kinds

These display `SceneObjectConfig.kind`; they are not user-authored.

| kind | zh-CN | en | ja |
| --- | --- | --- | --- |
| table | 桌子 | table | テーブル |
| chair | 椅子 | chair | 椅子 |
| stool | 凳子 | stool | スツール |
| sofa | 沙发 | sofa | ソファ |
| platform | 平台 | platform | 平台 |
| plinth | 台座 | plinth | 台座 |
| cylinderPlinth | 圆柱台座 | cylinder plinth | 円柱台座 |
| mannequin | 人台 | mannequin | マネキン |
| backdropPanel | 背景板 | backdrop panel | 背景パネル |
| box | 箱体 | box/block | 箱 |
| blackFlag | 黑旗 | black flag | 黒フラッグ |
| reflectorBoard | 反光板 | reflector | レフ板 |
| diffusionFrame | 柔光布框 | diffusion frame | ディフュージョンフレーム |

### 5.12 Support Surface Labels

`getPersonSupportSurfaces` currently renders a single string such as:

```txt
左侧椅子 · 座面 0.48m（坐）
```

The user-authored object name stays unchanged. Localize only the surface word and role.

| semantic | zh-CN | en | ja |
| --- | --- | --- | --- |
| surface.chair | 座面 | seat | 座面 |
| surface.sofa | 坐面 | seat | 座面 |
| surface.platform | 台面 | platform top | 台面 |
| surface.table | 桌面 | tabletop | 天板 |
| surface.stool | 凳面 | stool top | 座面 |
| surface.plinth | 台座 | plinth top | 台座上面 |
| surface.box | 顶面 | top surface | 上面 |
| surface.default | 承载面 | support surface | 支持面 |
| supportRole.seat | 坐 | sit | 座る |
| supportRole.stand | 站 | stand | 立つ |

Recommended formatted output:

- zh-CN: `{name} · {surface} {height}m（{role}）`
- en: `{name} · {surface} {height}m ({role})`
- ja: `{name} · {surface} {height}m（{role}）`

### 5.13 Effective Light Summary

Current zh:

```txt
亮度 1.37 · 光束 60° · 柔硬 0.80
```

Localized templates:

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| effective.intensity | 亮度 {value} | intensity {value} | 強度 {value} |
| effective.beam | 光束 {value}° | beam {value}° | ビーム {value}° |
| effective.softness | 柔硬 {value} | softness {value} | 柔らかさ {value} |
| effective.separator |  ·  |  ·  |  ·  |

### 5.14 Lighting Summary

Current zh examples:

```txt
无开启灯光
3 灯 · 主柔光 1.8 / 柔65% / 5600K
```

Localized templates:

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| lightingSummary.none | 无开启灯光 | no lights on | 点灯中のライトなし |
| lightingSummary.line | {count} 灯 · 主{type} {intensity} / 柔{softPct}% / {color} | {count} lights · key {type} {intensity} / soft {softPct}% / {color} | {count}灯 · 主{type} {intensity} / 柔{softPct}% / {color} |

Use localized light type labels for `{type}`.

### 5.15 Director Light Brief

Current pattern:

```txt
Key Light · Nanlux Evoke 600C · 中号柔光箱 · 柔光主光
Key Light · 自定义灯具 · 无附件
```

Rules:

- `light.name` stays user-authored.
- Built-in fixture labels localize by id.
- Custom fixture labels stay user-authored.
- If no fixture is found, use localized `custom fixture`.
- Modifier labels/effect phrases localize by id.
- If no modifier, use localized `no modifier`.

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| lightBrief.unnamed | 未命名灯 | unnamed light | 無名ライト |
| lightBrief.customFixture | 自定义灯具 | custom fixture | カスタム器具 |
| lightBrief.noModifier | 无附件 | no modifier | アクセサリなし |

Recommended function signature:

```ts
getLightBrief(light, language, customFixtures?)
```

`DirectorLightBrief` should read `language` and `customFixtures` from the store.

### 5.16 Scene Diff

Recommended function signature:

```ts
compareScenes(a, b, language)
```

The return shape can stay `{ category, label, same, hint }`.

Category labels:

| category | zh-CN | en | ja |
| --- | --- | --- | --- |
| lights | 灯光 | lights | ライト |
| people | 人物位置 | subject positions | 人物位置 |
| objects | 道具 | props | 小道具 |
| gear | 控光器材 | control gear | ライトコントロール機材 |
| pose | 姿态 | pose | ポーズ |
| camera | 摄影机 | camera | カメラ |
| studio | 白棚 | white studio | 白ホリ |

Hints:

| key | zh-CN | en | ja |
| --- | --- | --- | --- |
| sceneDiff.lights.same | 灯位/强度相同 | light position/intensity same | ライト位置/強度 同じ |
| sceneDiff.lights.changed | 类型/强度/位置有变化 | type/intensity/position changed | タイプ/強度/位置に変化 |
| sceneDiff.lights.counts | A开{aOn}/{aTotal} · B开{bOn}/{bTotal} | A on {aOn}/{aTotal} · B on {bOn}/{bTotal} | A点灯 {aOn}/{aTotal} · B点灯 {bOn}/{bTotal} |
| sceneDiff.people.same | {count} 人站位相同 | {count} subject positions same | {count}人の位置 同じ |
| sceneDiff.people.changed | 站位/朝向有变化 | position/facing changed | 位置/向きに変化 |
| sceneDiff.people.counts | A {aCount}人 · B {bCount}人 | A {aCount} subjects · B {bCount} subjects | A {aCount}人 · B {bCount}人 |
| sceneDiff.objects.same | {count} 个道具相同 | {count} props same | 小道具 {count}件 同じ |
| sceneDiff.objects.changed | 位置/朝向有变化 | position/facing changed | 位置/向きに変化 |
| sceneDiff.objects.counts | A {aCount}个 · B {bCount}个 | A {aCount} props · B {bCount} props | A {aCount}件 · B {bCount}件 |
| sceneDiff.gear.same | {count} 件控光器材相同 | {count} control gear items same | ライトコントロール機材 {count}件 同じ |
| sceneDiff.gear.changed | 位置/朝向/尺寸有变化 | position/facing/size changed | 位置/向き/サイズに変化 |
| sceneDiff.gear.counts | A {aCount}件 · B {bCount}件 | A {aCount} items · B {bCount} items | A {aCount}件 · B {bCount}件 |
| sceneDiff.pose.same | 姿态相同 | pose same | ポーズ同じ |
| sceneDiff.pose.changed | A「{aPose}」 · B「{bPose}」 | A “{aPose}” · B “{bPose}” | A「{aPose}」 · B「{bPose}」 |
| sceneDiff.camera.same | 焦段/机位相同 | focal length/camera position same | 焦点距離/カメラ位置 同じ |
| sceneDiff.camera.changed | A {aFocal}mm · B {bFocal}mm | A {aFocal}mm · B {bFocal}mm | A {aFocal}mm · B {bFocal}mm |
| sceneDiff.studio.same | 反射/环境相同 | reflectance/ambient same | 反射/環境 同じ |
| sceneDiff.studio.changed | A 反射{aReflectance} · B 反射{bReflectance} | A reflect {aReflectance} · B reflect {bReflectance} | A反射 {aReflectance} · B反射 {bReflectance} |

`CompareStage` should pass the current store language into `compareScenes`.

### 5.17 Debug Preset Titles

Button names remain English (`Low Key Hard`, `High Soft Commercial`, `RGB Rim`). Localize `title` descriptions.

| id | zh-CN | en | ja |
| --- | --- | --- | --- |
| low-key-hard | 硬光 · 右前 · 高1.8m · 反射0.25 · 长而硬的阴影 | hard light · front right · height 1.8m · reflectance 0.25 · long hard shadow | 硬光 · 右前 · 高さ1.8m · 反射0.25 · 長く硬い影 |
| high-soft | 柔光 · 右前偏高 · 高3.2m · 反射0.7 · 明亮干净广告感 | soft light · high front right · height 3.2m · reflectance 0.7 · bright clean commercial look | 柔光 · 右前高め · 高さ3.2m · 反射0.7 · 明るくクリーンな広告感 |
| rgb-rim | 正面弱白光 + 后侧蓝/紫轮廓 · 反射0.55 | weak front white + rear-side blue/purple rim · reflectance 0.55 | 正面の弱い白光 + 後ろ側の青/紫リム · 反射0.55 |

## 6. Wiring Checklist

Claude should update these visible call sites:

- `LightBaseSection`: light type labels, built-in fixture labels, fixture capability.
- `LightPanel`: subtitle fixture/light-type/modifier labels.
- `LightModifierSection`: modifier option labels and short badge.
- `LightColorSection`: color swatch labels.
- `LightTargetSection`: target mode labels.
- `LightBeamSection` / `domain/lightModifiers`: effective summary.
- `CameraPanel`: camera preset labels.
- `PersonPanel`: pose preset labels and support-surface option labels.
- `ObjectPanel`: material labels and object kind display.
- `SceneObjectsSection`: add-object dropdown labels and object kind row labels.
- `LightsSection`: light type row labels.
- `DirectorLightBrief`: localized built-in fixture/modifier/effect phrase.
- `ComparePane` / `domain/lightingSummary`: localized lighting summary.
- `CompareStage` / `domain/sceneDiff`: localized category labels and hints.
- `TopBar`: debug preset `title` descriptions.

## 7. Tests / Verification

Required:

- `npx tsc -b`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Raw Chinese scan:

```bash
rg -n "[一-龥]" src/ui src/app src/domain src/data
```

Expected allowed raw Chinese after v0.10.1:

- `src/i18n/messages/*` zh-CN dictionaries.
- Comments.
- User/content source data that is not rendered in this slice: `notes`, `useCase`, `shadowNote`, default communication-scene object names, custom fixture validation messages.
- Documentation under `src/**/README.md`.

Not allowed after v0.10.1:

- Raw Chinese fixture capability labels in UI.
- Raw Chinese built-in labels in dropdowns, segmented controls, badges, summaries, view overlays, A/B diff chips, or tooltips.
- Raw Chinese returned from `sceneDiff`, `lightBrief`, `lightingSummary`, or `formatEffectiveLightSummary` for `en` / `ja`.

Data-boundary check:

- Switching language must not mutate `scene`, `presets`, `compareB`, or `customFixtures`.
- Built-in fixture labels may localize; custom fixture labels must remain exactly as authored.
- Saved scenes and exported custom fixture JSON must keep the same shape and ids.

Visual acceptance:

- User should check `zh-CN`, `en`, and `ja` at 1280x820.
- Focus areas: light panel base/modifier/color/target sections, object add dropdown, person support dropdown, A/B compare strip, and camera-view director brief.
