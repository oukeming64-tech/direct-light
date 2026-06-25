import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { PersonConfig, PoseConfig } from '../types'
import { PERSON_MODELS } from '../data/personModels'

type Props = {
  person: PersonConfig
  selected?: boolean
  onSelect?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
}

// Best-effort Mixamo bone → PoseConfig mapping.
// Silently skips any bone name that doesn't exist in the loaded rig, so this
// works fine on a static mesh (no bones) and degrades gracefully on unknown rigs.
function applyPoseToBones(root: THREE.Object3D, pose: PoseConfig) {
  const deg = THREE.MathUtils.degToRad
  const set = (name: string, x: number, y: number, z: number) => {
    const bone = root.getObjectByName(name)
    if (!bone) return
    bone.rotation.set(x, y, z)
  }

  set('mixamorigHead',      deg(pose.headPitch),              deg(pose.headYaw),              0)
  set('mixamorigNeck',      deg(pose.headPitch * 0.3),        deg(pose.headYaw * 0.3),        0)
  set('mixamorigSpine',     deg(pose.torsoPitch * 0.4),       deg(pose.torsoYaw * 0.4),       0)
  set('mixamorigSpine1',    deg(pose.torsoPitch * 0.4),       deg(pose.torsoYaw * 0.4),       0)
  set('mixamorigSpine2',    deg(pose.torsoPitch * 0.2),       deg(pose.torsoYaw * 0.2),       0)
  // Mixamo arms hang along ±X in rest; raise/abduct map to Z, forward swing to X.
  set('mixamorigLeftArm',   deg(-pose.leftUpperArmPitch * 0.5),  0, deg(-pose.leftUpperArmRoll))
  set('mixamorigLeftForeArm',  deg(-pose.leftForearmBend),   deg(-pose.leftForearmYaw),       0)
  set('mixamorigRightArm',  deg(-pose.rightUpperArmPitch * 0.5), 0, deg(pose.rightUpperArmRoll))
  set('mixamorigRightForeArm', deg(-pose.rightForearmBend),  deg(pose.rightForearmYaw),       0)
}

export function PersonGLB({ person, selected, onSelect, onPointerDown }: Props) {
  const modelDef = PERSON_MODELS.find(m => m.id === person.modelVariant) ?? PERSON_MODELS[0]
  const { scene } = useGLTF(modelDef.path)

  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        ;(node as THREE.Mesh).castShadow = true
        ;(node as THREE.Mesh).receiveShadow = true
      }
    })
    return clone
  }, [scene])

  // Compute world-space bbox once per model load (Box3 applies all root-node
  // transforms, so this is correct regardless of axis convention or unit scale).
  const box = useMemo(() => new THREE.Box3().setFromObject(cloned), [cloned])
  const modelHeight = box.isEmpty() ? 1.75 : box.max.y - box.min.y
  const scale = person.height / modelHeight
  // Lift so the bottom of the model sits at person.position.y instead of floating/sinking.
  const yLift = box.isEmpty() ? 0 : -box.min.y * scale

  useEffect(() => {
    if (person.pose) applyPoseToBones(cloned, person.pose)
  }, [cloned, person.pose])

  return (
    <group
      position={[person.position.x, person.position.y, person.position.z]}
      rotation={[0, person.rotationY, 0]}
      onClick={onSelect}
      onPointerDown={onPointerDown}
    >
      {/* invisible ground-level hit disc, same as PersonDummy */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={onSelect} onPointerDown={onPointerDown}>
        <circleGeometry args={[0.56, 32]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      <primitive object={cloned} scale={[scale, scale, scale]} position={[0, yLift, 0]} />

      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.5, 48]} />
          <meshBasicMaterial color="#d8b4fe" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

// No eager preload: the dummy is the default, so GLBs load lazily on first
// selection (Suspense shows the dummy as fallback meanwhile). This keeps startup
// from fetching multi-MB models nobody asked for.

