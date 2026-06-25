// Core data structures for Direct Light.
// Mirrors README §14, extended with a few prototype-only fields.
// Keep this the single source of truth shared by store, scene, and UI.

export type Vector3 = { x: number; y: number; z: number }

export type LightType = 'hard' | 'soft' | 'panel'

export type LightTargetMode = 'manual' | 'person' | 'peopleCenter'

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16'

export type ShadowMode = 'variance' | 'soft'

export type StudioConfig = {
  width: number
  depth: number
  height: number
  wallReflectance: number
  floorReflectance: number
  hasCyclorama: boolean
  ambientLevel: number
  // prototype extras
  wallColor: string
  floorColor: string
  showSideWalls: boolean
  showCeiling: boolean
  // Shadow map algorithm. 'variance' = VSM (smooth penumbra, may ring on curved
  // geometry); 'soft' = PCFSoft (no ringing, slightly less smooth penumbra).
  shadowMode?: ShadowMode
}

export type SceneObjectKind =
  | 'table'
  | 'chair'
  | 'stool'
  | 'sofa'
  | 'platform'
  | 'plinth'
  | 'cylinderPlinth'
  | 'mannequin'
  | 'backdropPanel'
  | 'box'
  // v0.6c in-studio standalone control gear; v0.6d derives approximate optics from kind/pose.
  | 'blackFlag' // 黑旗 / 旗板：黑色遮光板
  | 'reflectorBoard' // 反光板（白旗板）
  | 'diffusionFrame' // 柔光布框

export type SceneObjectMaterial =
  | 'matteWhite'
  | 'matteBlack'
  | 'matteGray'
  | 'wood'
  | 'metal'
  | 'glass'
  | 'fabric'
  | 'scrimWhite' // v0.6c 半透明柔光白（柔光布框）

export type SceneObjectSize = { width: number; depth: number; height: number }

// Which simplified mesh a scene object draws. `kind` is the product category
// (table/chair/…) and is not enough on its own — a 'table' can be a box (long)
// or a cylinder (round) — so the render geometry is carried explicitly.
export type SceneObjectGeometry =
  | 'box'
  | 'cylinder'
  | 'chair'
  | 'sofa'
  | 'mannequinHalf'
  | 'mannequinFull'
  | 'panel'
  | 'gearPanel' // v0.6c 控光板：薄板工作面 + 简易支架 + 底座

export type SceneObjectConfig = {
  id: string
  name: string
  kind: SceneObjectKind
  geometry: SceneObjectGeometry
  position: Vector3
  rotationY: number
  size: SceneObjectSize
  color: string
  material: SceneObjectMaterial
  castShadow: boolean
  receiveShadow: boolean
  visible: boolean
  showLabel: boolean
}

// v0.4 basic pose. All joint angles are in DEGREES (readable presets + direct
// sliders); the Person rig converts to radians. Sign conventions (person faces
// +Z by default): headPitch/torsoPitch + = lean/nod forward; *Yaw + = turn left;
// upperArmPitch + = swing forward; upperArmRoll + = raise outward (abduct);
// forearmBend + = bend the elbow up; forearmYaw + = twist the forearm inward
// toward the body centerline (v0.4b — lets hand-on-hip reach the side hip).
// seated (v0.4b): when true the leg rig folds into a sitting assembly with the
// hips at the group origin (place the person at seat-top height); the 10
// upper-body angles above still apply unchanged.
export type PoseConfig = {
  presetId: string
  headYaw: number
  headPitch: number
  torsoYaw: number
  torsoPitch: number
  leftUpperArmPitch: number
  leftUpperArmRoll: number
  leftForearmBend: number
  leftForearmYaw: number
  rightUpperArmPitch: number
  rightUpperArmRoll: number
  rightForearmBend: number
  rightForearmYaw: number
  seated?: boolean
}

// attach-to-support (v0.4.5): when a person is placed on a support
// object, these fields bind them so subsequent moves/rotates of that object
// carry the person along. Clearing them detaches.
export type SupportBinding = {
  supportObjectId: string
  // Person's X/Z position expressed in the support's local frame (after
  // removing the support's rotationY). Used to recompute world X/Z when the
  // support moves or rotates.
  supportLocalOffset: { x: number; z: number }
  // Difference between person.rotationY and object.rotationY at bind time.
  // Re-applied as person.rotationY = supportRotationOffset + object.rotationY
  // whenever the support rotates.
  supportRotationOffset: number
}

export type PersonConfig = {
  id: string
  name: string
  position: Vector3
  rotationY: number
  height: number
  skinTone: string
  clothingColor: string
  showFacePlane: boolean
  pose: PoseConfig
  // 'dummy' = procedural rig; any other string = id in PERSON_MODELS registry.
  // Absent defaults to the first entry in PERSON_MODELS.
  modelVariant?: string
  // Optional attach-to-support binding. Absent = person is free on the ground
  // (or placed once without live follow-through). See HERMES.md §6.
  supportObjectId?: string
  supportLocalOffset?: { x: number; z: number }
  supportRotationOffset?: number
}

// v0.5 fixture preset library — describes "what fixture this is" in director/DP
// language. The actual app params still come from the light's own fields; a
// fixture preset just seeds them (see V0_5_FIXTURE_SPEC.md).
export type FixtureCategory = 'cob' | 'panel' | 'tube' | 'fresnel' | 'practical' | 'effect'

export type FixtureColorEngine =
  | 'daylight'
  | 'tungsten'
  | 'bi-color'
  | 'rgb'
  | 'rgbww'
  | 'rgbacl'
  | 'nebula-c8'

export type FixturePowerClass = 'small' | 'medium' | 'large' | 'very-large'

export type FixtureUse = 'key' | 'fill' | 'rim' | 'background' | 'effect'

// v0.9: where a fixture comes from. Built-in library entries are 'builtin' (or
// undefined); user-authored ones are 'custom'.
export type FixtureSource = 'builtin' | 'custom'

// The shape of one fixture in the library. Built-in entries live in
// src/data/fixturePresets.ts (FIXTURE_PRESETS); user-authored ones are
// CustomFixturePreset (below) and share this exact shape. `directLightDefaults`
// is what actually gets seeded into a LightConfig when the fixture is applied;
// the native* / official* fields are real-world reference only.
export type FixturePreset = {
  id: string
  label: string
  brand: string
  model: string
  category: FixtureCategory
  colorEngine: FixtureColorEngine
  powerClass: FixturePowerClass
  supportsColor: boolean
  nativeCctRange?: [number, number]
  nativeBeamAngle?: number
  officialPowerW?: number
  recommendedUses: FixtureUse[]
  defaultModifiers: string[]
  directLightDefaults: {
    type: LightType
    intensity: number
    beamAngle: number
    softness: number
    distance: number
    color: string
    colorTemperature?: number
  }
  notes: string
  sourceUrl?: string
  sourceCheckedAt?: string
  // v0.9: 'builtin' (or undefined) for the bundled library, 'custom' for
  // user-authored fixtures. Lets the merged dropdown tag/manage custom entries.
  source?: FixtureSource
}

// v0.9: a user-authored fixture. Same shape as a built-in (so it is fully
// interchangeable in the 器械 dropdown + applyFixturePreset) plus the required
// provenance/identity metadata the bundled library doesn't carry.
export type CustomFixturePreset = FixturePreset & {
  source: 'custom'
  createdAt: number
  updatedAt: number
}

// v0.9: the import/export envelope. A "pack" holds 1..N custom fixtures so a
// single-fixture export and a whole-library export use the same file shape.
export type CustomFixturePack = {
  schema: 'direct-light/custom-fixtures'
  version: number // current = 1
  exportedAt?: number
  fixtures: CustomFixturePreset[]
}

export type LightConfig = {
  id: string
  name: string
  type: LightType
  enabled: boolean
  position: Vector3
  target: Vector3
  targetMode?: LightTargetMode
  targetPersonId?: string
  intensity: number
  color: string
  colorTemperature?: number
  beamAngle: number // degrees, user-facing
  softness: number // 0..1, drives shadow edge + penumbra
  distance: number // throw distance in meters
  // v0.5: which fixture preset seeded this light. Optional; a starting point,
  // not a lock — manual edits to intensity/color/etc. do NOT clear it.
  fixturePresetId?: string
  // v0.6a: per-light control modifier. This changes effective light quality
  // through a pure helper, but does not overwrite the user's raw light sliders.
  modifierId?: string
  // Shadow normal bias (0..0.05). Offsets the shadow lookup along the surface
  // normal to reduce VSM light-bleeding on curved geometry (esp. sphere silhouettes).
  normalBias?: number
}

// v0.4c: camera target can be manual, or follow a person / the people-center
// (mirrors LightTargetMode). targetMode only drives `target`, never `position`.
export type CameraTargetMode = 'manual' | 'person' | 'peopleCenter'

export type CameraConfig = {
  position: Vector3
  target: Vector3
  focalLength: number // mm (source of truth for fov)
  aspectRatio: AspectRatio
  targetMode?: CameraTargetMode
  targetPersonId?: string
}

export type SceneConfig = {
  studio: StudioConfig
  people: PersonConfig[]
  objects: SceneObjectConfig[]
  lights: LightConfig[]
  camera: CameraConfig
}

export type LightingPreset = {
  id: string
  name: string
  sceneSnapshot: SceneConfig
  previewImage?: string
  createdAt: number
}

// ---- UI-only types ----

export type ViewMode = 'camera' | 'free' | 'top' | 'side' | 'compare'

export type SelectionKind = 'light' | 'person' | 'object' | 'camera' | 'studio'

export type Selection = { kind: SelectionKind; id: string } | null
