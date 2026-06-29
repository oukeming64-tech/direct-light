# V0.10 Multilingual UI Spec

> Status: COMPLETE / USER-ACCEPTED / RELEASED (Claude-led, 2026-06-24). v0.10a foundation, v0.10b core-UI extraction, v0.10.1 built-in display labels + `sceneDiff` copy, and v0.10d closeout are complete. The user chose `v1.0.0` as the major milestone release; version metadata is `1.0.0` and the GitHub release/tag is published. Per-version progress lives in `COLLABORATION.md`.
> Owner split: Codex owns product wording and acceptance rules; Claude Code owns implementation and final integration; OpenRouter may draft mechanical string-extraction patches under Claude review; Hermes may only do narrow scan/copy-table subtasks when explicitly assigned.

## 1. Product Position

v0.10 adds runtime UI localization for Direct Light. It does **not** translate scene content, user-authored names, fixture files, saved presets, or exported data.

Initial languages:

- Simplified Chinese (`zh-CN`) as the source language and default.
- English (`en`).
- Japanese (`ja`).

The goal is to make the app usable for non-Chinese users while keeping the current "simple components + simple store" architecture intact.

## 2. Non-Negotiable Boundaries

Language is an app preference, not scene data.

- Do not add language fields to `SceneConfig`.
- Do not add language fields to saved lighting presets, A/B snapshots, camera config, people, lights, scene objects, custom fixtures, or custom fixture packs.
- Do not rewrite user-entered names when switching language.
- Do not rewrite saved scene data when switching language.
- Do not mutate built-in data tables only to change display language.
- Do not introduce a heavy i18n dependency for v0.10 unless Codex and the user explicitly approve it.
- Do not translate brand names, model names, ids, units, numeric values, or user-authored labels.

Allowed persistence:

- Store the selected app language separately in localStorage under `direct-light.language.v1`.
- This key is independent from saved scenes (`direct-light.presets.v1`) and custom fixtures (`direct-light.customFixtures.v1`).

## 3. Architecture Decision

Use a small typed in-repo i18n layer.

Recommended files:

- `src/i18n/languages.ts` — `AppLanguage`, `DEFAULT_LANGUAGE`, supported language metadata.
- `src/i18n/messages.ts` or `src/i18n/messages/*` — typed dictionaries for `zh-CN`, `en`, `ja`.
- `src/i18n/index.ts` — `t(language, key, params?)`, fallback behavior, and helper exports.
- `src/i18n/useT.ts` — optional hook that reads the current language from the store and returns a translator.
- `src/i18n/display.ts` — optional display helpers for built-in preset labels, capability labels, enum labels, and scene-object preset labels.

Store placement:

- Add top-level `language: AppLanguage` to the Zustand store, not to `scene`.
- Add `setLanguage(language)` in the existing view/app action area, preferably `src/state/actions/viewActions.ts` unless Claude finds a more local existing app-preference action.
- Add `loadLanguage` / `saveLanguage` to `src/lib/storage.ts`.

UI placement:

- Add a compact language control in `src/ui/TopBar.tsx` or a small child component such as `src/ui/LanguageMenu.tsx`.
- Keep the control light and work-focused. No settings page is required for v0.10.

## 4. Translation Key Rules

Use semantic keys, not Chinese source strings as keys.

Good:

```ts
t('topBar.versionPrefix')
t('objectList.lights.count', { current, max })
t('lightPanel.fixture.saveCurrent')
```

Avoid:

```ts
t('保存方案')
t('灯光 N/MAX_LIGHTS')
```

Granularity:

- Prefer full UI phrases over word-by-word assembly.
- Use interpolation only for numbers, names, and short values.
- Keep punctuation inside each language's phrase when natural.
- If a translation is missing, fall back to `zh-CN` and make the missing key easy to spot during development.

## 5. What Gets Translated

Translate:

- Top bar labels, view names, mode labels, and language control labels.
- Object list section titles and action labels.
- Parameter panel titles, field labels, helper text, button labels, and empty states.
- A/B compare labels, freeze/swap/reset copy, diff-category names, and empty-state instructions.
- Preset bar commands and save/load/delete text.
- Import/export status text and validation summaries shown in the UI.
- Built-in enum/capability labels such as light types, fixture capability labels, color engines, power class display names, modifier labels, camera target modes, material labels, and scene-object preset display names.
- Director-view brief copy.

Do not translate:

- `LightConfig.name`, `PersonConfig.name`, `SceneObjectConfig.name`, saved preset names, custom fixture labels, or any other user-authored string.
- Built-in ids such as `generic-cob-600d`, `blackFlag`, `stage-round-live`, or `peopleCenter`.
- Brand/model names such as `Nanlux Evoke 600C`.
- Units and physical symbols (`m`, `K`, `W`, `%`) except surrounding explanatory text.
- JSON schema field names in exported custom fixture files.
- README / documentation in this runtime feature. Docs remain separate artifacts.

Special display rule:

- Built-in presets may have localized display labels by id, but their data records stay unchanged.
- Custom fixtures always display the user-authored `label`.

## 6. Terminology Table

Use this as the first-pass wording baseline. Codex may polish copy after implementation screenshots.

| Concept | zh-CN | en | ja |
| --- | --- | --- | --- |
| Direct Light | Direct Light | Direct Light | Direct Light |
| 白棚 | 白棚 | white studio | 白ホリ |
| 镜头视角 | 镜头视角 | camera view | カメラビュー |
| 俯视图 | 俯视图 | top view | トップビュー |
| 自由视角 | 自由视角 | free view | フリービュー |
| 灯光 | 灯光 | light | ライト |
| 灯具 / 器械 | 器械 | fixture | 器具 |
| 内置器械 | 内置器械 | built-in fixtures | 標準器具 |
| 我的器械 | 我的器械 | my fixtures | マイ器具 |
| 自定义参数 | 自定义参数 | custom params | カスタム設定 |
| 存当前灯为器械 | 存当前灯为器械 | save current light as fixture | 現在のライトを器具として保存 |
| 控光附件 | 控光附件 | modifier | ライトアクセサリ |
| 控光器材 | 控光器材 | control gear | ライトコントロール機材 |
| 黑旗 | 黑旗 | black flag | 黒フラッグ |
| 反光板 | 反光板 | reflector | レフ板 |
| 柔光布框 | 柔光布框 | diffusion frame | ディフュージョンフレーム |
| A/B 对比 | A/B 对比 | A/B compare | A/B比較 |
| 冻结 | 冻结 | freeze | 固定 |
| 保存方案 | 保存方案 | save preset | プリセット保存 |
| 导入 | 导入 | import | インポート |
| 导出 | 导出 | export | エクスポート |

## 7. Version Split

### v0.10a — i18n Foundation

Scope:

- Add the typed i18n module and language store preference.
- Add localStorage load/save for `direct-light.language.v1`.
- Add a compact language selector in the top bar.
- Translate only the top bar, view badge, language control, and a small set of shared/common labels.
- Add enough tests or deterministic checks to prove switching language does not touch `scene`, `customFixtures`, saved presets, or A/B snapshots.

Non-goals:

- Do not mass-convert every UI string yet.
- Do not change exported JSON shape.
- Do not change built-in data tables for display labels yet.

### v0.10b — Core UI Extraction

Scope:

- Convert core UI chrome to `t(...)`: object list, parameter panels, controls, A/B compare UI, preset bar, import/export status text, and director brief.
- Keep implementation in existing modules and small helper files.
- Mechanical extraction may be drafted by OpenRouter, but Claude Code must review every changed file for key correctness, grammar, and layout risk.

Non-goals:

- Do not restructure the store.
- Do not move UI components into a new app framework.
- Do not translate docs or generated screenshots.

### v0.10c — Built-In Display Labels + Copy Pass

Scope:

- Add localized display helpers for built-in fixture labels, scene-object preset labels, modifier labels, camera preset labels, material labels, and enum labels.
- Preserve ids and raw data. Display helpers map ids/semantic fields to localized labels.
- Polish English and Japanese copy for director-facing wording.
- Scan for remaining raw Chinese runtime UI strings in `src/ui`, `src/app`, and user-visible `src/domain` copy.

Allowed raw Chinese after v0.10c:

- `zh-CN` dictionary.
- Comments.
- Data that is intentionally user/content-facing and stored as source data.
- Documentation and specs.

### v0.10d — Acceptance + Closeout

Scope:

- Verify switching `zh-CN` / `en` / `ja` does not change scene, A/B, presets, custom fixtures, or export/import JSON.
- Verify key desktop layouts do not overflow in English or Japanese.
- Update release/version metadata only after user visual acceptance; this line shipped as `v1.0.0`.
- Update `README.md`, `README.en.md`, `CHANGELOG.md`, `ROADMAP.md`, `COLLABORATION.md`, `AGENTS.md`, `CLAUDE.md`, and `HERMES.md`.

## 8. Write Scope

Expected implementation files:

- `src/i18n/*`
- `src/lib/storage.ts`
- `src/state/storeTypes.ts`
- `src/state/store.ts`
- `src/state/actions/viewActions.ts` or equivalent app-preference action file
- `src/ui/TopBar.tsx`
- Existing UI modules under `src/ui/*`, `src/ui/light-panel/*`, `src/ui/object-list/*`
- Existing app/compare modules under `src/app/*` and `src/app/compare/*`
- `src/domain/lightBrief.ts` and `src/domain/sceneDiff.ts` only for user-visible labels/copy, not formulas

Do not touch unless a concrete bug requires it:

- `src/scene/*` rendering code
- `src/data/rendering.ts`
- `src/domain/controlGearOptics.ts`
- `src/domain/customFixtures.ts`
- `src/domain/customFixturePack.ts`
- `src/domain/sceneMigration.ts`
- `SceneConfig` shape
- Tauri/release workflows

## 9. Acceptance Criteria

Functional:

- Language selector switches between `zh-CN`, `en`, and `ja` without page reload.
- The selected language persists after refresh.
- Switching language does not mutate the scene object, saved presets, A/B snapshots, or custom fixtures.
- Built-in UI labels change language; user-entered names stay exactly as entered.
- Custom fixture labels stay exactly as authored; built-in fixture display labels may localize.
- Import/export JSON for custom fixtures is byte-shape compatible with v0.9 except for user-authored label values already in the file.

Regression:

- `npx tsc -b` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `git diff --check` passes.
- Save/load preset still works.
- A/B freeze/swap still works.
- Export preview still works.
- Custom fixture import/export still works.

Visual:

- 1280x820 desktop layout has no obvious text overlap in all three languages.
- Longer English/Japanese labels wrap or truncate intentionally, without resizing fixed controls.
- Object list rows, top bar controls, and light-panel action buttons remain scannable.
- User visual acceptance is required before closing v0.10.

## 10. Review Checklist

Before accepting v0.10:

- Search stale docs for `后续多语言`, `仅简体中文`, `multilingual postponed`, and `v0.10`.
- Search runtime UI for raw Chinese outside i18n dictionaries and allowed data.
- Confirm no language field entered `SceneConfig`.
- Confirm no language field entered custom fixture pack schema.
- Confirm `TopBar` version only changed during v0.10d closeout.
- Confirm `package.json` / Tauri / Cargo versions change only if a formal release is being cut.
- For the final milestone release, confirm all of the above use `1.0.0` / `v1.0.0`, not the earlier working label `0.10.0`.

## 11. Handoff Guidance

Claude Code implementation handoff should report:

- Which v0.10 slice was implemented.
- Which files were converted to i18n keys.
- Which raw Chinese strings intentionally remain and why.
- Proof that language switching does not mutate scene/preset/custom-fixture data.
- Type/lint/build/diff-check results.
- Any labels that need Codex/user copy review.

Hermes handoff, if used, should be narrower:

- "Scan these directories and report raw Chinese runtime UI strings."
- "Draft English/Japanese wording for these exact keys from the glossary."
- "Do not edit code unless the handoff names exact files and exact key mappings."
