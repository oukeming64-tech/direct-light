// Top-bar copy. Each domain file owns its keys: zh-CN is the source of truth
// (`as const` → the key set); en/ja are typed `Record<Key, string>` so the
// compiler forces them to cover exactly the same keys. The aggregator in
// ./index.ts merges every domain into the final MESSAGES table.

import type { AppLanguage } from '../languages'

const zh = {
  "plan.export": "导出方案",
  "plan.import": "导入方案",
  "plan.camera": "镜头画面",
  "plan.top": "俯视位置图",
  "plan.lights": "灯具清单",
  "plan.name": "灯号 / 名称",
  "plan.fixture": "灯具 / 附件",
  "plan.target": "目标 X, Y, Z (m)",
  "plan.settings": "强度 / 颜色 / 色温 / 光束角 / 柔度 / 距离",
  "plan.note": "预演参数用于沟通，不代表现场测光值。自定义灯具定义随包保存，外部人物模型文件不在包内。",
  "plan.restoreHint": "可打印此文件；在 Direct Light 的“导入方案”中选择本文件，可加入已存方案继续编辑。",
  "plan.exported": "方案包已生成，包含画面、位置图和可编辑场景。",
  "plan.imported": "已加入已存方案，当前场景保持原样。",
  "plan.failed": "未完成。请确认文件为本应用的方案包（20 MB 内），且浏览器允许本地保存。",
  'topBar.subtitle': '白棚灯光预演',
  'topBar.exportImage': '导出图片',
  'topBar.reset': '重置',
  'topBar.resetTitle': '重置为默认场景',
  'topBar.quickLooks': '快速布光示例',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  "plan.export": "Export plan",
  "plan.import": "Import plan",
  "plan.camera": "Camera preview",
  "plan.top": "Top view",
  "plan.lights": "Light schedule",
  "plan.name": "Light / name",
  "plan.fixture": "Fixture / modifier",
  "plan.target": "Target X, Y, Z (m)",
  "plan.settings": "Intensity / color / CCT / beam / softness / distance",
  "plan.note": "Previz settings support discussion, not calibrated light measurements. Custom fixture definitions are included; external figure model files are not.",
  "plan.restoreHint": "Print this file, or choose it with Import plan in Direct Light to add an editable saved preset.",
  "plan.exported": "Plan exported with images, positions and editable scene.",
  "plan.imported": "Added to saved presets. The current scene is unchanged.",
  "plan.failed": "Could not finish. Use a Direct Light plan (under 20 MB) and allow local storage.",
  'topBar.subtitle': 'White-studio lighting preview',
  'topBar.exportImage': 'Export image',
  'topBar.reset': 'Reset',
  'topBar.resetTitle': 'Reset to the default scene',
  'topBar.quickLooks': 'Quick lighting looks',
}

const ja: Record<Key, string> = {
  "plan.export": "プランを書き出す",
  "plan.import": "プランを読み込む",
  "plan.camera": "カメラ画像",
  "plan.top": "俯瞰図",
  "plan.lights": "照明リスト",
  "plan.name": "灯番号 / 名前",
  "plan.fixture": "灯具 / アクセサリー",
  "plan.target": "照射先 X, Y, Z (m)",
  "plan.settings": "強度 / 色 / 色温度 / 配光角 / 柔らかさ / 距離",
  "plan.note": "数値はプリビズ用で、実測値ではありません。カスタム灯具の定義を含みます。外部の人物モデルは含みません。",
  "plan.restoreHint": "このファイルは印刷できます。Direct Light の「プランを読み込む」で選ぶと、保存済みプランに追加できます。",
  "plan.exported": "画像・配置・編集用データを書き出しました。",
  "plan.imported": "保存済みプランに追加しました。現在のシーンはそのままです。",
  "plan.failed": "完了できませんでした。本アプリのプラン（20 MB 以下）とローカル保存の設定をご確認ください。",
  'topBar.subtitle': '白ホリ用ライティングプレビュー',
  'topBar.exportImage': '画像を書き出す',
  'topBar.reset': 'リセット',
  'topBar.resetTitle': 'デフォルトシーンに戻す',
  'topBar.quickLooks': 'ライティング例',
}

export const topBar: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
