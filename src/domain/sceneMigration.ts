import type {
  LightConfig,
  LightingPreset,
  PersonConfig,
  SceneConfig,
  SceneObjectConfig,
  SceneObjectGeometry,
  SceneObjectKind,
  StudioConfig,
} from '../types'
import { buildDefaultScene, buildPersonFromPreset } from '../data/defaults'
import { DEFAULT_POSE } from '../data/poses'

type LegacyScene = Partial<SceneConfig> & {
  person?: Partial<PersonConfig>
}

const objectGeometryByKind: Record<SceneObjectKind, SceneObjectGeometry> = {
  table: 'box',
  chair: 'chair',
  stool: 'cylinder',
  sofa: 'sofa',
  platform: 'box',
  plinth: 'box',
  cylinderPlinth: 'cylinder',
  mannequin: 'mannequinFull',
  backdropPanel: 'panel',
  box: 'box',
  // v0.6c control gear
  blackFlag: 'gearPanel',
  reflectorBoard: 'gearPanel',
  diffusionFrame: 'gearPanel',
}

function normalizePerson(person: Partial<PersonConfig> | undefined, index: number): PersonConfig {
  const fallback = buildPersonFromPreset(index, person?.id)
  return {
    ...fallback,
    ...person,
    position: { ...fallback.position, ...(person?.position ?? {}) },
    pose: { ...DEFAULT_POSE, ...(person?.pose ?? {}) },
    showFacePlane: person?.showFacePlane ?? fallback.showFacePlane,
  }
}

function normalizeLight(
  light: Partial<LightConfig> | undefined,
  fallback: LightConfig,
  firstPersonId: string | undefined,
): LightConfig {
  return {
    ...fallback,
    ...light,
    position: { ...fallback.position, ...(light?.position ?? {}) },
    target: { ...fallback.target, ...(light?.target ?? {}) },
    targetMode: light?.targetMode ?? fallback.targetMode ?? 'manual',
    targetPersonId: light?.targetPersonId ?? fallback.targetPersonId ?? firstPersonId,
  }
}

function normalizeObject(object: Partial<SceneObjectConfig> | undefined, index: number): SceneObjectConfig {
  const rawKind = object?.kind
  const kind = rawKind && rawKind in objectGeometryByKind ? rawKind : 'box'
  const geometry = object?.geometry ?? objectGeometryByKind[kind]
  return {
    id: object?.id ?? `object-migrated-${index + 1}`,
    name: object?.name ?? `Object ${index + 1}`,
    kind,
    geometry,
    position: { x: 0, y: 0, z: 0, ...(object?.position ?? {}) },
    rotationY: object?.rotationY ?? 0,
    size: { width: 0.6, depth: 0.45, height: 0.45, ...(object?.size ?? {}) },
    color: object?.color ?? '#f1f0ea',
    material: object?.material ?? 'matteWhite',
    castShadow: object?.castShadow ?? true,
    receiveShadow: object?.receiveShadow ?? true,
    visible: object?.visible ?? true,
    showLabel: object?.showLabel ?? true,
  }
}

export function normalizeScene(scene: Partial<SceneConfig> | undefined): SceneConfig {
  const legacyScene = scene as LegacyScene | undefined
  const fallback = buildDefaultScene()
  const peopleSource =
    Array.isArray(legacyScene?.people)
      ? legacyScene.people
      : legacyScene?.person
        ? [legacyScene.person]
        : fallback.people
  const people = peopleSource.map((person, index) => normalizePerson(person, index))
  const firstPersonId = people[0]?.id
  const lightSource = Array.isArray(legacyScene?.lights) ? legacyScene.lights : fallback.lights

  return {
    studio: {
      ...fallback.studio,
      ...(legacyScene?.studio as Partial<StudioConfig> | undefined),
    },
    people,
    objects: Array.isArray(legacyScene?.objects)
      ? legacyScene.objects.map((object, index) => normalizeObject(object, index))
      : [],
    lights: lightSource.map((light, index) =>
      normalizeLight(light, fallback.lights[index] ?? fallback.lights[0], firstPersonId),
    ),
    camera: {
      ...fallback.camera,
      ...legacyScene?.camera,
      position: { ...fallback.camera.position, ...(legacyScene?.camera?.position ?? {}) },
      target: { ...fallback.camera.target, ...(legacyScene?.camera?.target ?? {}) },
      // v0.4c: old scenes have no camera target mode → manual, locked to first person
      targetMode: legacyScene?.camera?.targetMode ?? fallback.camera.targetMode ?? 'manual',
      targetPersonId: legacyScene?.camera?.targetPersonId ?? fallback.camera.targetPersonId ?? firstPersonId,
    },
  }
}

export function normalizePreset(preset: LightingPreset): LightingPreset {
  return {
    ...preset,
    sceneSnapshot: normalizeScene(preset.sceneSnapshot),
  }
}
