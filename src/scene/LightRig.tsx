import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { LightConfig, PersonConfig, SceneObjectConfig, StudioConfig, Vector3 } from '../types'
import {
  LIGHT_TYPE_DEFAULTS,
  getPenumbra,
  getShadowBias,
  getShadowRadius,
} from '../data/rendering'
import { effectiveLightColor } from '../lib/color'
import { getEffectiveLightTarget } from '../domain/lightTargets'
import { getEffectiveLightParams, getLightModifierPreset } from '../domain/lightModifiers'
import {
  applyGearOpticsToLightParams,
  getGearLightOptics,
  getReflectorFillLights,
} from '../domain/controlGearOptics'
import { FIXTURE_PRESETS } from '../data/fixturePresets'
import { SPOT_INTENSITY_SCALE, computeGlobalFill } from './lighting'
import { LightVisual, lightVisualKind } from './LightVisual'
import { LightModifierVisual } from './LightModifierVisual'

const MAX_SPOT_ANGLE = THREE.MathUtils.degToRad(80)

// ---------------------------------------------------------------------------
// Global fill: ambient + hemisphere from reflectance, plus colored bounce.
// ---------------------------------------------------------------------------
export function GlobalFill({
  studio,
  lights,
  objects,
  people,
}: {
  studio: StudioConfig
  lights: LightConfig[]
  objects?: SceneObjectConfig[]
  people?: PersonConfig[]
}) {
  const fill = useMemo(
    () => computeGlobalFill(studio, lights, objects ?? [], people ?? []),
    [studio, lights, objects, people],
  )
  return (
    <>
      <ambientLight intensity={fill.ambientIntensity} />
      <hemisphereLight
        intensity={fill.hemisphereIntensity}
        color={'#ffffff'}
        groundColor={studio.floorColor}
      />
      {fill.bounceIntensity > 0.001 && (
        <ambientLight intensity={fill.bounceIntensity} color={fill.bounceColor} />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// One fixture: a shadow-casting SpotLight + a selectable gizmo.
// ---------------------------------------------------------------------------
type LightProps = {
  light: LightConfig
  target: Vector3
  objects: SceneObjectConfig[]
  selected: boolean
  showGizmo: boolean
  onSelect: (e: ThreeEvent<MouseEvent>) => void
  onPointerDownGizmo: (e: ThreeEvent<PointerEvent>) => void
}

function StudioLight({ light, target, objects, selected, showGizmo, onSelect, onPointerDownGizmo }: LightProps) {
  const spotRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Group>(null)

  const typeDef = LIGHT_TYPE_DEFAULTS[light.type]
  const color = useMemo(
    () => effectiveLightColor({ color: light.color, colorTemperature: light.colorTemperature }),
    [light.color, light.colorTemperature],
  )
  // v0.6a: a control modifier shifts effective intensity / beam / softness; the
  // SpotLight + visible body read from these, the raw light fields stay intact.
  // v0.6d: in-studio gear (black flag cut / diffusion frame) between this light and
  // its target further shifts the effective params, on top of the v0.6a modifier.
  const effective = applyGearOpticsToLightParams(
    getEffectiveLightParams(light),
    getGearLightOptics(light, target, objects),
  )
  const angle = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(effective.beamAngle), 0.1, MAX_SPOT_ANGLE)
  const penumbra = getPenumbra(effective.softness)
  const intensity = effective.intensity * SPOT_INTENSITY_SCALE

  // v0.5.1: pick a visible light body from the light type + its fixture category.
  // 'point' lights keep the existing sphere gizmo (avoids a double-sphere); only
  // softbox/panel/tube draw an extra emissive body.
  const fixtureCategory = light.fixturePresetId
    ? FIXTURE_PRESETS.find((f) => f.id === light.fixturePresetId)?.category
    : undefined
  const visualKind = lightVisualKind(light.type, fixtureCategory)
  // v0.6b: the attached control modifier draws its own body in front of the head.
  const modifierVisualKind = getLightModifierPreset(light.modifierId)?.visualKind ?? 'none'

  useLayoutEffect(() => {
    const s = spotRef.current
    if (!s || !targetRef.current) return
    s.target = targetRef.current
    s.shadow.mapSize.set(typeDef.shadowMapSize, typeDef.shadowMapSize)
    s.shadow.radius = getShadowRadius(effective.softness)
    s.shadow.blurSamples = Math.round(8 + effective.softness * 24)
    s.shadow.bias = getShadowBias(effective.softness)
    s.shadow.normalBias = light.normalBias ?? 0
    s.shadow.camera.near = 0.4
    s.shadow.camera.far = Math.max(24, effective.distance + 14)
    s.shadow.camera.updateProjectionMatrix()
    // Force the shadow map to rebuild when the resolution changes.
    s.shadow.map?.dispose()
    s.shadow.map = null as unknown as THREE.WebGLRenderTarget
  }, [light.enabled, effective.softness, effective.distance, typeDef.shadowMapSize, light.normalBias])

  const pos: [number, number, number] = [light.position.x, light.position.y, light.position.z]
  const tgt: [number, number, number] = [target.x, target.y, target.z]
  const gizmoColor = light.enabled ? `#${color.getHexString()}` : '#5a5a64'

  return (
    <>
      <group ref={targetRef} position={tgt} />
      {light.enabled && (
        <spotLight
          ref={spotRef}
          position={pos}
          color={color}
          intensity={intensity}
          angle={angle}
          penumbra={penumbra}
          decay={typeDef.decay}
          distance={light.distance}
          castShadow
        />
      )}

      {showGizmo && light.enabled && visualKind !== 'point' && (
        <LightVisual
          position={light.position}
          target={target}
          color={`#${color.getHexString()}`}
          kind={visualKind}
          softness={effective.softness}
          onClick={onSelect}
          onPointerDown={onPointerDownGizmo}
        />
      )}

      {light.enabled && modifierVisualKind !== 'none' && (
        <LightModifierVisual position={light.position} target={target} kind={modifierVisualKind} />
      )}

      {showGizmo && (
        <group>
          {/* fixture marker */}
          <mesh position={pos} onClick={onSelect} onPointerDown={onPointerDownGizmo}>
            <sphereGeometry args={[selected ? 0.19 : 0.16, 20, 20]} />
            <meshBasicMaterial color={gizmoColor} toneMapped={false} />
          </mesh>
          {selected && (
            <mesh position={pos}>
              <sphereGeometry args={[0.28, 20, 20]} />
              <meshBasicMaterial color="#d8b4fe" wireframe transparent opacity={0.7} />
            </mesh>
          )}
          {/* aim direction */}
          <Line points={[pos, tgt]} color={gizmoColor} lineWidth={1.4} transparent opacity={0.7} />
          {/* drop line to read ground position */}
          <Line
            points={[pos, [light.position.x, 0, light.position.z]]}
            color="#8a8a93"
            lineWidth={1}
            dashed
            dashScale={3}
            transparent
            opacity={0.55}
          />
          <mesh position={[light.position.x, 0.02, light.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 20]} />
            <meshBasicMaterial color={gizmoColor} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
type RigProps = {
  lights: LightConfig[]
  people: PersonConfig[]
  objects: SceneObjectConfig[]
  selectedId: string | null
  showGizmos: boolean
  onSelect: (id: string) => void
  onPointerDownLight: (id: string, e: ThreeEvent<PointerEvent>) => void
}

export function LightRig({ lights, people, objects, selectedId, showGizmos, onSelect, onPointerDownLight }: RigProps) {
  // v0.6d: reflector boards become runtime virtual fill lights derived from the
  // scene — never written into scene.lights, never count toward MAX_LIGHTS, no
  // shadow. intensity from the helper is the raw appIntensity (0..0.38); the
  // render scale (× SPOT_INTENSITY_SCALE) is applied here, per V0_6D_OPTICS_SPEC §6.
  const reflectorFills = useMemo(
    () => getReflectorFillLights(lights, people, objects),
    [lights, people, objects],
  )

  return (
    <>
      {lights.map((light) => {
        const target = getEffectiveLightTarget(light, people)
        return (
          <StudioLight
            key={light.id}
            light={light}
            target={target}
            objects={objects}
            selected={selectedId === light.id}
            showGizmo={showGizmos}
            onSelect={(e) => {
              e.stopPropagation()
              onSelect(light.id)
            }}
            onPointerDownGizmo={(e) => onPointerDownLight(light.id, e)}
          />
        )
      })}

      {reflectorFills.map((fill) => (
        <pointLight
          key={fill.id}
          position={[fill.position.x, fill.position.y, fill.position.z]}
          color={fill.color}
          intensity={fill.intensity * SPOT_INTENSITY_SCALE}
          distance={4.5}
          decay={1.6}
        />
      ))}
    </>
  )
}
