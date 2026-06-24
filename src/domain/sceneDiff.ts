import type { PoseConfig, SceneConfig, SceneObjectSize } from '../types'
import { isControlGearKind } from '../data/sceneObjects'
import { t, type AppLanguage } from '../i18n'
import { getPosePresetLabel } from '../i18n/display'

/**
 * Category-level scene diff for the A/B compare summary. Not a deep diff —
 * just enough signal for a director to know "this compare is mostly about
 * lights / positions / props" at a glance. See ROADMAP §10.
 *
 * Returns an array with one entry per category in a stable order:
 * lights, people, objects, gear, pose, camera, studio.
 *
 * v0.6e: control gear ('控光器材') is split out of '道具' because, since v0.6d,
 * moving gear into/out of a light path changes the picture — the director needs
 * to see that as its own change, not buried under props.
 */

export type DiffCategory = 'lights' | 'people' | 'objects' | 'gear' | 'pose' | 'camera' | 'studio'

export type CategoryDiff = {
  category: DiffCategory
  label: string // localized category label
  same: boolean
  hint: string // localized one-line hint
}

export function compareScenes(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff[] {
  return [
    diffLights(a, b, language),
    diffPeople(a, b, language),
    diffObjects(a, b, language),
    diffGear(a, b, language),
    diffPose(a, b, language),
    diffCamera(a, b, language),
    diffStudio(a, b, language),
  ]
}

// ─── per-category diff helpers (pure) ─────────────────────────────────────

function diffLights(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const aOn = a.lights.filter((l) => l.enabled).length
  const bOn = b.lights.filter((l) => l.enabled).length
  const same =
    a.lights.length === b.lights.length &&
    a.lights.every((la, i) => {
      const lb = b.lights[i]
      if (!lb) return false
      return (
        la.type === lb.type &&
        Math.abs(la.intensity - lb.intensity) < 0.01 &&
        la.color === lb.color &&
        la.enabled === lb.enabled &&
        closeVec(la.position, lb.position) &&
        Math.abs(la.softness - lb.softness) < 0.01 &&
        (la.modifierId ?? '') === (lb.modifierId ?? '')
      )
    })
  const hint = same
    ? t(language, 'sceneDiff.lights.same')
    : aOn === bOn && a.lights.length === b.lights.length
      ? t(language, 'sceneDiff.lights.changed')
      : t(language, 'sceneDiff.lights.counts', { aOn, aTotal: a.lights.length, bOn, bTotal: b.lights.length })
  return { category: 'lights', label: t(language, 'diffCategory.lights'), same, hint }
}

function diffPeople(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same =
    a.people.length === b.people.length &&
    a.people.every((pa, i) => {
      const pb = b.people[i]
      if (!pb) return false
      return closeVec(pa.position, pb.position) && Math.abs(pa.rotationY - pb.rotationY) < 0.01
    })
  const hint = same
    ? t(language, 'sceneDiff.people.same', { count: a.people.length })
    : a.people.length === b.people.length
      ? t(language, 'sceneDiff.people.changed')
      : t(language, 'sceneDiff.people.counts', { aCount: a.people.length, bCount: b.people.length })
  return { category: 'people', label: t(language, 'diffCategory.people'), same, hint }
}

// v0.6e: props only (gear is split into diffGear below).
function diffObjects(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const ao = a.objects.filter((o) => !isControlGearKind(o.kind))
  const bo = b.objects.filter((o) => !isControlGearKind(o.kind))
  const same =
    ao.length === bo.length &&
    ao.every((oa, i) => {
      const ob = bo[i]
      if (!ob) return false
      return (
        oa.kind === ob.kind &&
        closeVec(oa.position, ob.position) &&
        Math.abs(oa.rotationY - ob.rotationY) < 0.01
      )
    })
  const hint = same
    ? t(language, 'sceneDiff.objects.same', { count: ao.length })
    : ao.length === bo.length
      ? t(language, 'sceneDiff.objects.changed')
      : t(language, 'sceneDiff.objects.counts', { aCount: ao.length, bCount: bo.length })
  return { category: 'objects', label: t(language, 'diffCategory.objects'), same, hint }
}

// v0.6e: in-studio control gear (black flag / reflector board / diffusion frame).
// Compares kind/position/rotationY AND size + visibility, because all of those
// change the gear's optical footprint (V0_6E_CLOSEOUT_SPEC §4.2).
function diffGear(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const ag = a.objects.filter((o) => isControlGearKind(o.kind))
  const bg = b.objects.filter((o) => isControlGearKind(o.kind))
  const same =
    ag.length === bg.length &&
    ag.every((oa, i) => {
      const ob = bg[i]
      if (!ob) return false
      return (
        oa.kind === ob.kind &&
        oa.visible === ob.visible &&
        closeVec(oa.position, ob.position) &&
        Math.abs(oa.rotationY - ob.rotationY) < 0.01 &&
        closeSize(oa.size, ob.size)
      )
    })
  const hint = same
    ? t(language, 'sceneDiff.gear.same', { count: ag.length })
    : ag.length === bg.length
      ? t(language, 'sceneDiff.gear.changed')
      : t(language, 'sceneDiff.gear.counts', { aCount: ag.length, bCount: bg.length })
  return { category: 'gear', label: t(language, 'diffCategory.gear'), same, hint }
}

function diffPose(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same =
    a.people.length === b.people.length &&
    a.people.every((pa, i) => {
      const pb = b.people[i]
      if (!pb) return false
      return samePose(pa.pose, pb.pose)
    })
  const hint = same
    ? t(language, 'sceneDiff.pose.same')
    : t(language, 'sceneDiff.pose.changed', {
        aPose: poseLabel(a.people[0], language),
        bPose: poseLabel(b.people[0], language),
      })
  return { category: 'pose', label: t(language, 'diffCategory.pose'), same, hint }
}

function diffCamera(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const aTargetMode = a.camera.targetMode ?? 'manual'
  const bTargetMode = b.camera.targetMode ?? 'manual'
  const sameLockedPerson =
    aTargetMode === 'person' && bTargetMode === 'person'
      ? a.camera.targetPersonId === b.camera.targetPersonId
      : true
  const same =
    a.camera.aspectRatio === b.camera.aspectRatio &&
    a.camera.focalLength === b.camera.focalLength &&
    aTargetMode === bTargetMode &&
    sameLockedPerson &&
    closeVec(a.camera.position, b.camera.position) &&
    closeVec(a.camera.target, b.camera.target)
  const hint = same
    ? t(language, 'sceneDiff.camera.same')
    : t(language, 'sceneDiff.camera.changed', { aFocal: a.camera.focalLength, bFocal: b.camera.focalLength })
  return { category: 'camera', label: t(language, 'diffCategory.camera'), same, hint }
}

function diffStudio(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same =
    a.studio.wallReflectance === b.studio.wallReflectance &&
    a.studio.floorReflectance === b.studio.floorReflectance &&
    a.studio.ambientLevel === b.studio.ambientLevel
  const hint = same
    ? t(language, 'sceneDiff.studio.same')
    : t(language, 'sceneDiff.studio.changed', {
        aReflectance: a.studio.wallReflectance.toFixed(2),
        bReflectance: b.studio.wallReflectance.toFixed(2),
      })
  return { category: 'studio', label: t(language, 'diffCategory.studio'), same, hint }
}

// ─── shared helpers ─────────────────────────────────────────────────────────

function closeVec(
  a: { x: number; y: number; z: number } | undefined,
  b: { x: number; y: number; z: number } | undefined,
  eps = 0.01,
): boolean {
  if (!a || !b) return a === b
  return (
    Math.abs(a.x - b.x) < eps &&
    Math.abs(a.y - b.y) < eps &&
    Math.abs(a.z - b.z) < eps
  )
}

function closeSize(a: SceneObjectSize, b: SceneObjectSize, eps = 0.01): boolean {
  return (
    Math.abs(a.width - b.width) < eps &&
    Math.abs(a.depth - b.depth) < eps &&
    Math.abs(a.height - b.height) < eps
  )
}

const POSE_NUMBER_KEYS: (keyof PoseConfig)[] = [
  'headYaw',
  'headPitch',
  'torsoYaw',
  'torsoPitch',
  'leftUpperArmPitch',
  'leftUpperArmRoll',
  'leftForearmBend',
  'leftForearmYaw',
  'rightUpperArmPitch',
  'rightUpperArmRoll',
  'rightForearmBend',
  'rightForearmYaw',
]

function samePose(a: PoseConfig | undefined, b: PoseConfig | undefined): boolean {
  if (!a || !b) return a === b
  return (
    a.presetId === b.presetId &&
    !!a.seated === !!b.seated &&
    POSE_NUMBER_KEYS.every((key) => Math.abs(Number(a[key] ?? 0) - Number(b[key] ?? 0)) < 0.01)
  )
}

// v0.10.1: localized via getPosePresetLabel (which also maps legacy aliases).
// no person → "none"; person with no presetId → standing fallback.
function poseLabel(person: SceneConfig['people'][number] | undefined, language: AppLanguage): string {
  if (!person) return getPosePresetLabel(language, 'none')
  return getPosePresetLabel(language, person.pose?.presetId)
}
