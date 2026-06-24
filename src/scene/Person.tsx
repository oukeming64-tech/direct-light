import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { PersonConfig } from '../types'
import { PERSON_MATERIAL } from '../data/rendering'
import { DEFAULT_POSE } from '../data/poses'
import { PersonGLB } from './PersonGLB'
import { PERSON_MODELS } from '../data/personModels'

type Props = {
  person: PersonConfig
  selected?: boolean
  onSelect?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
}

// v0.4b seated leg fold (degrees). Hip swings the thigh forward+slightly down,
// the knee brings the calf back to vertical. hip + knee ≈ 0 → calf is plumb, so
// the total drop (thigh dip + calf) lands the feet near the floor for a typical
// chair/stool/sofa seat height.
const SEAT_HIP_FLEX = -84
const SEAT_KNEE_FLEX = 84

// Proportions are authored for a 1.75m actor, then scaled to person.height.
// Arms are split into upper arm + forearm so the elbow can bend (v0.4 pose);
// legs are split into thigh + calf so they can fold for the seated pose (v0.4b).
function proportions(height: number) {
  const s = height / 1.75
  const legLen = 0.92 * s
  return {
    legLen,
    legRadius: 0.075 * s,
    thighLen: legLen * 0.5,
    calfLen: legLen * 0.5,
    hipWidth: 0.18 * s,
    pelvisH: 0.18 * s,
    torsoH: 0.5 * s,
    torsoW: 0.34 * s,
    torsoD: 0.2 * s,
    shoulderW: 0.42 * s,
    neckH: 0.07 * s,
    headR: 0.115 * s,
    armRadius: 0.055 * s,
    upperArmLen: 0.62 * s * 0.52,
    forearmLen: 0.62 * s * 0.48,
  }
}

export function PersonDummy({ person, selected, onSelect, onPointerDown }: Props) {
  const p = useMemo(() => proportions(person.height), [person.height])
  const skin = { color: person.skinTone, roughness: PERSON_MATERIAL.skinRoughness, metalness: 0 }
  const cloth = { color: person.clothingColor, roughness: PERSON_MATERIAL.clothingRoughness, metalness: 0 }
  const ang = (d: number) => THREE.MathUtils.degToRad(d)
  // Fallback keeps older saved presets / snapshots (pre-pose) from crashing.
  const ps = person.pose ?? DEFAULT_POSE
  const seated = !!ps.seated

  // Standing: origin = feet on the ground/surface, body built upward.
  // Seated: origin = seat top (placeOnSurface puts the person there); the pelvis
  // rests on the seat and the legs fold down. Either way the torso-and-above
  // subtree is identical — only the hip height and the leg assembly differ.
  const torsoPivotY = seated ? p.pelvisH : p.legLen + p.pelvisH
  const pelvisY = seated ? p.pelvisH / 2 : p.legLen + p.pelvisH / 2

  return (
    <group
      position={[person.position.x, person.position.y, person.position.z]}
      rotation={[0, person.rotationY, 0]}
      onClick={onSelect}
      onPointerDown={onPointerDown}
    >
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={onSelect} onPointerDown={onPointerDown}>
        <circleGeometry args={[0.56, 32]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {/* legs */}
      {seated
        ? // seated: thigh forward + calf down, folded at hip and knee
          [-1, 1].map((side) => (
            <group
              key={side}
              position={[(side * p.hipWidth) / 2, p.pelvisH * 0.1, p.torsoD * 0.35]}
              rotation={[ang(SEAT_HIP_FLEX), 0, 0]}
            >
              <mesh position={[0, -p.thighLen / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[p.legRadius, p.legRadius * 0.92, p.thighLen, 16]} />
                <meshStandardMaterial {...cloth} />
              </mesh>
              <group position={[0, -p.thighLen, 0]} rotation={[ang(SEAT_KNEE_FLEX), 0, 0]}>
                <mesh position={[0, -p.calfLen / 2, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[p.legRadius * 0.92, p.legRadius * 0.85, p.calfLen, 16]} />
                  <meshStandardMaterial {...cloth} />
                </mesh>
              </group>
            </group>
          ))
        : // standing: two straight vertical legs
          [-1, 1].map((side) => (
            <mesh key={side} position={[(side * p.hipWidth) / 2, p.legLen / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[p.legRadius, p.legRadius * 0.9, p.legLen, 16]} />
              <meshStandardMaterial {...cloth} />
            </mesh>
          ))}

      {/* pelvis (static) */}
      <mesh position={[0, pelvisY, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.torsoW, p.pelvisH, p.torsoD]} />
        <meshStandardMaterial {...cloth} />
      </mesh>

      {/* torso pivot: yaw (twist) + pitch (lean) carry everything above the waist */}
      <group position={[0, torsoPivotY, 0]} rotation={[ang(ps.torsoPitch), ang(ps.torsoYaw), 0]}>
        <mesh position={[0, p.torsoH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[p.torsoW, p.torsoH, p.torsoD]} />
          <meshStandardMaterial {...cloth} />
        </mesh>

        <mesh position={[0, p.torsoH, 0]} castShadow receiveShadow>
          <boxGeometry args={[p.shoulderW, p.torsoD * 0.9, p.torsoD]} />
          <meshStandardMaterial {...cloth} />
        </mesh>

        {/* head pivot: yaw (turn) + pitch (nod) */}
        <group position={[0, p.torsoH, 0]} rotation={[ang(ps.headPitch), ang(ps.headYaw), 0]}>
          <mesh position={[0, p.neckH / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[p.headR * 0.45, p.headR * 0.5, p.neckH, 12]} />
            <meshStandardMaterial {...skin} />
          </mesh>
          <mesh position={[0, p.neckH + p.headR, 0]} castShadow receiveShadow>
            <sphereGeometry args={[p.headR, 28, 28]} />
            <meshStandardMaterial {...skin} />
          </mesh>
          {person.showFacePlane && (
            <mesh position={[0, p.neckH + p.headR, p.headR * 0.92]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <coneGeometry args={[p.headR * 0.22, p.headR * 0.5, 12]} />
              <meshStandardMaterial color={person.skinTone} roughness={0.6} metalness={0} />
            </mesh>
          )}
        </group>

        {/* left arm: shoulder pivot (pitch fwd/back, roll = abduction) + elbow (bend + inward yaw) */}
        <group
          position={[-(p.shoulderW / 2 + p.armRadius), p.torsoH, 0]}
          rotation={[-ang(ps.leftUpperArmPitch), 0, -ang(ps.leftUpperArmRoll)]}
        >
          <mesh position={[0, -p.upperArmLen / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[p.armRadius, p.armRadius * 0.9, p.upperArmLen, 14]} />
            <meshStandardMaterial {...skin} />
          </mesh>
          {/* elbow: yaw twists the upper-arm axis (outer) so it sweeps the
              already-bent forearm — must wrap the bend, since a forearm aligned
              with the local Y axis is unaffected by a same-node Y rotation */}
          <group position={[0, -p.upperArmLen, 0]} rotation={[0, -ang(ps.leftForearmYaw), 0]}>
            <group rotation={[-ang(ps.leftForearmBend), 0, 0]}>
              <mesh position={[0, -p.forearmLen / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[p.armRadius * 0.9, p.armRadius * 0.8, p.forearmLen, 14]} />
                <meshStandardMaterial {...skin} />
              </mesh>
            </group>
          </group>
        </group>

        {/* right arm */}
        <group
          position={[p.shoulderW / 2 + p.armRadius, p.torsoH, 0]}
          rotation={[-ang(ps.rightUpperArmPitch), 0, ang(ps.rightUpperArmRoll)]}
        >
          <mesh position={[0, -p.upperArmLen / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[p.armRadius, p.armRadius * 0.9, p.upperArmLen, 14]} />
            <meshStandardMaterial {...skin} />
          </mesh>
          <group position={[0, -p.upperArmLen, 0]} rotation={[0, ang(ps.rightForearmYaw), 0]}>
            <group rotation={[-ang(ps.rightForearmBend), 0, 0]}>
              <mesh position={[0, -p.forearmLen / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[p.armRadius * 0.9, p.armRadius * 0.8, p.forearmLen, 14]} />
                <meshStandardMaterial {...skin} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* selection contact ring */}
      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.5, 48]} />
          <meshBasicMaterial color="#d8b4fe" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

// Dispatches to the GLB model or the procedural dummy based on person.modelVariant.
// Defaults to the GLB. The dummy is the Suspense fallback while the GLB loads.
export function Person(props: Props) {
  const variant = props.person.modelVariant ?? PERSON_MODELS[0]?.id ?? 'dummy'
  if (variant === 'dummy') return <PersonDummy {...props} />
  return (
    <Suspense fallback={<PersonDummy {...props} />}>
      <PersonGLB {...props} />
    </Suspense>
  )
}
