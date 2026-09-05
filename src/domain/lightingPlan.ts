import type { SceneConfig, CustomFixturePreset, Vector3 } from '../types'
import { buildDefaultScene } from '../data/defaults'
import { getEffectiveLightTarget } from './lightTargets'
import { clampCameraInsideStudio, getEffectiveCameraTarget } from './cameraMath'
import { DEFAULT_POSE } from '../data/poses'
import { findFixtureById } from './customFixtures'
import { parseCustomFixturePack } from './customFixturePack'

export type LightingPlan = {
  schema: 'direct-light/lighting-plan'
  version: 1
  name: string
  scene: SceneConfig
  customFixtures: CustomFixturePreset[]
}

export function makeLightingPlan(scene: SceneConfig, customFixtures: CustomFixturePreset[], name: string): LightingPlan {
  const used = new Set(scene.lights.map((light) => light.fixturePresetId))
  return { schema: 'direct-light/lighting-plan', version: 1, name, scene: structuredClone(scene),
    customFixtures: structuredClone(customFixtures.filter((fixture) => used.has(fixture.id))) }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid plan object')
  return value as Record<string, unknown>
}

function shape(value: unknown, sample: unknown): void {
  if (sample === undefined) return
  if (typeof sample === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 100000) throw new Error('Invalid plan number')
  } else if (typeof sample === 'string' || typeof sample === 'boolean') {
    if (typeof value !== typeof sample) throw new Error('Invalid plan field')
  } else {
    const v = object(value)
    const optional = new Set(['colorTemperature', 'targetMode', 'targetPersonId', 'fixturePresetId', 'modifierId', 'normalBias', 'shadowMode', 'modelVariant', 'seated', 'supportObjectId', 'supportLocalOffset', 'supportRotationOffset'])
    for (const [key, field] of Object.entries(object(sample))) {
      if (v[key] === undefined && optional.has(key)) continue
      shape(v[key], field)
    }
  }
}

export function parseLightingPlan(text: string): LightingPlan {
  const plan = object(JSON.parse(text))
  if (plan.schema !== 'direct-light/lighting-plan' || plan.version !== 1 || typeof plan.name !== 'string') throw new Error('Unsupported lighting plan')
  const scene = object(plan.scene)
  const sample = buildDefaultScene()
  shape(scene.studio, sample.studio)
  shape(scene.camera, sample.camera)
  const templates = { lights: sample.lights[0], people: { ...sample.people[0], pose: DEFAULT_POSE }, objects: {
    id: '', name: '', kind: '', geometry: '', position: { x: 0, y: 0, z: 0 }, rotationY: 0,
    size: { width: 1, height: 1, depth: 1 }, color: '', material: '', castShadow: true, receiveShadow: true, visible: true, showLabel: true,
  } }
  for (const key of ['lights', 'people', 'objects'] as const) {
    const rows = scene[key]
    if (!Array.isArray(rows) || rows.length > 200) throw new Error('Invalid plan collection')
    const ids = new Set<string>()
    for (const row of rows) {
      shape(row, templates[key])
      const id = object(row).id as string
      if (!id || ids.has(id)) throw new Error('Duplicate plan ID')
      ids.add(id)
    }
  }
  if (!Array.isArray(plan.customFixtures)) throw new Error('Missing fixtures')
  const fixtures = parseCustomFixturePack(JSON.stringify(plan.customFixtures), { now: Date.now() })
  if (fixtures.errors.length || fixtures.fixtures.length !== plan.customFixtures.length) throw new Error('Invalid fixtures')
  const result = plan as unknown as LightingPlan
  if (result.scene.studio.width <= 0 || result.scene.studio.depth <= 0 || result.scene.studio.height <= 0 || result.scene.camera.focalLength <= 0
    || !['16:9', '4:3', '1:1', '9:16'].includes(result.scene.camera.aspectRatio)
    || result.scene.lights.some((l) => !['hard', 'soft', 'panel'].includes(l.type))) throw new Error('Invalid scene settings')
  return { ...result, customFixtures: fixtures.fixtures }
}

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export function topViewSvg(scene: SceneConfig): string {
  const w = scene.studio.width, d = scene.studio.depth
  const scale = Math.min(680 / w, 480 / d)
  const px = (x: number) => 400 + x * scale
  const pz = (z: number) => 290 + z * scale
  const mark = (p: Vector3, label: string, color: string) => `<circle cx="${px(p.x)}" cy="${pz(p.z)}" r="9" fill="${color}"/><text x="${px(p.x) + 13}" y="${pz(p.z) + 5}" font-size="14">${escapeHtml(label)}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Top view"><rect width="800" height="600" fill="#f6f5f1"/>
    <rect x="${px(-w / 2)}" y="${pz(-d / 2)}" width="${w * scale}" height="${d * scale}" fill="white" stroke="#555"/>
    <text x="30" y="28" font-size="16">${w} × ${d} m · X → · Z ↓ · Y = height</text>
    ${scene.objects.filter((o) => o.visible).map((o, i) => `<g transform="translate(${px(o.position.x)} ${pz(o.position.z)}) rotate(${-o.rotationY})"><rect x="${-o.size.width * scale / 2}" y="${-o.size.depth * scale / 2}" width="${o.size.width * scale}" height="${o.size.depth * scale}" fill="#ddd" stroke="#888"/></g>${mark(o.position, `O${i + 1}`, '#888')}`).join('')}
    ${scene.people.map((p, i) => mark(p.position, `P${i + 1}`, '#222')).join('')}
    ${scene.lights.map((l, i) => `<line x1="${px(l.position.x)}" y1="${pz(l.position.z)}" x2="${px(getEffectiveLightTarget(l, scene.people).x)}" y2="${pz(getEffectiveLightTarget(l, scene.people).z)}" stroke="#aa7b17" stroke-dasharray="4 4"/>${mark(l.position, `L${i + 1}${l.enabled ? '' : ' (off)'}`, l.enabled ? '#bd8a21' : '#bbb')}`).join('')}
    ${mark(clampCameraInsideStudio(scene.camera.position, scene.studio), 'CAM', '#6451b7')}</svg>`
}

export function lightingPlanHtml(plan: LightingPlan, preview: string, labels: Record<string, string>, modifierLabel: (id: string | undefined) => string = (id) => id ?? '—'): string {
  const e = escapeHtml, s = plan.scene
  const pos = (p: Vector3) => `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`
  const rows = s.lights.map((light, i) => {
    const fixture = findFixtureById(light.fixturePresetId, plan.customFixtures)
    return `<tr><td>L${i + 1} · ${e(light.name)}${light.enabled ? '' : ' (off)'}</td><td>${e(fixture?.label ?? light.type)}<br>${e(modifierLabel(light.modifierId))}</td><td>${pos(light.position)}</td><td>${pos(getEffectiveLightTarget(light, s.people))}</td><td>${light.intensity}<br>${e(light.color)} / ${light.colorTemperature ?? '—'} K<br>${light.beamAngle}° / ${light.softness} / ${light.distance} m</td></tr>`
  }).join('')
  const json = JSON.stringify(plan).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(plan.name)} · Direct Light</title><style>body{max-width:1040px;margin:40px auto;padding:0 24px;color:#242328;font:15px/1.6 system-ui,sans-serif}h1{font-size:32px}h2{margin-top:32px}img,svg{width:100%;height:auto}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid #ddd;text-align:left;padding:10px;vertical-align:top}small{color:#666} @media print{body{margin:0}h2{break-after:avoid}tr,img,svg{break-inside:avoid}}</style></head><body>
  <h1>${e(plan.name)}</h1><p>Direct Light · ${e(labels.note)}</p>
  <h2>${e(labels.camera)}</h2>${/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(preview) ? `<img alt="Camera preview" src="${preview}">` : ''}
  <p>CAM: ${pos(clampCameraInsideStudio(s.camera.position, s.studio))} → ${pos(getEffectiveCameraTarget(s.camera, s.people))} · ${s.camera.focalLength} mm · ${s.camera.aspectRatio}</p>
  <h2>${e(labels.top)}</h2>${topViewSvg(s)}
  <h2>${e(labels.lights)}</h2><table><thead><tr><th>${e(labels.name)}</th><th>${e(labels.fixture)}</th><th>X, Y, Z (m)</th><th>${e(labels.target)}</th><th>${e(labels.settings)}</th></tr></thead><tbody>${rows}</tbody></table>
  <p>${s.people.map((p, i) => `P${i + 1}: ${e(p.name)} (${pos(p.position)})`).join(' · ')}</p>
  <p>${s.objects.filter((o) => o.visible).map((o, i) => `O${i + 1}: ${e(o.name)} (${pos(o.position)})`).join(' · ')}</p>
  <small>${e(labels.restore)}</small><script type="application/json" id="direct-light-plan">${json}</script></body></html>`
}
