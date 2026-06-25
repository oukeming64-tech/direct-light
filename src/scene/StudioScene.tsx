import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '../state/store'
import type { SceneConfig, ShadowMode, StudioConfig, ViewMode } from '../types'
import { RENDERER_SETTINGS } from '../data/rendering'
import { getEffectiveLightTarget } from '../domain/lightTargets'
import { clampCameraInsideStudio, getEffectiveCameraTarget } from '../domain/cameraMath'
import { Studio } from './Studio'
import { Person } from './Person'
import { GlobalFill, LightRig } from './LightRig'
import { SceneObjects } from './SceneObjects'
import { CaptureBridge } from './capture'
import { OrthoRig, PerspectiveRig } from './CameraRig'
import { GroundDragController } from './GroundDragController'
import { CameraGizmo } from './CameraGizmo'
import { DistanceLabel } from './DistanceLabel'

// Applies the shadow map algorithm at runtime and flushes cached maps on change.
// Must live inside <Canvas> so it can access the R3F renderer via useThree.
function ShadowModeSync({ mode }: { mode: ShadowMode }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.shadowMap.type = mode === 'soft' ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap
    scene.traverse((obj) => {
      const light = obj as THREE.Light
      if (light.isLight && light.shadow?.map) {
        light.shadow.map.dispose()
        ;(light.shadow as { map: THREE.WebGLRenderTarget | null }).map = null
      }
    })
    gl.shadowMap.needsUpdate = true
  }, [mode, gl, scene])
  return null
}

type SceneContentsProps = {
  scene: SceneConfig
  view: ViewMode
  interactive: boolean
  registerCapture: boolean
}

function SceneContents({ scene, view, interactive, registerCapture }: SceneContentsProps) {
  const selection = useStore((s) => s.selection)
  const dragTarget = useStore((s) => s.dragTarget)
  const select = useStore((s) => s.select)
  const setDragTarget = useStore((s) => s.setDragTarget)

  const showGizmos = interactive && view !== 'camera'
  const selectedLightId = interactive && selection?.kind === 'light' ? selection.id : null
  const selectedObjectId = interactive && selection?.kind === 'object' ? selection.id : null
  const person = scene.people[0]

  // Free-orbit pivot: capture the director target once when entering free view so
  // later camera.target edits (e.g. the 看向高度 slider) don't yank the orbit pivot
  // and pan the whole free view. The user still pans it freely; capture reads live.
  const freePivot = useMemo<[number, number, number]>(
    () => [scene.camera.target.x, scene.camera.target.y, scene.camera.target.z],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view],
  )

  const onPointerDownLight = (id: string, e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    select({ kind: 'light', id })
    if (view !== 'camera') setDragTarget({ kind: 'light', id })
  }

  const onPointerDownObject = (id: string, e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    select({ kind: 'object', id })
    if (view !== 'camera') setDragTarget({ kind: 'object', id })
  }

  return (
    <>
      <color attach="background" args={['#0b0c10']} />
      <ShadowModeSync mode={scene.studio.shadowMode ?? 'variance'} />

      {view === 'camera' || view === 'free' ? (
        <PerspectiveRig
          mode={view}
          cam={scene.camera}
          studio={scene.studio}
          target={getEffectiveCameraTarget(scene.camera, scene.people)}
        />
      ) : (
        <OrthoRig mode={view} />
      )}

      {interactive && view !== 'camera' && (
        <OrbitControls
          key={view}
          makeDefault
          enabled={dragTarget === null}
          enableRotate={view === 'free'}
          enablePan
          enableZoom
          target={view === 'free' ? freePivot : view === 'side' ? [0, 1.2, 0] : [0, 0, 0]}
        />
      )}

      {interactive && view === 'free' && <FreeCameraCaptureBridge />}
      {view === 'free' && <FreeCameraClamp studio={scene.studio} />}
      {interactive && view === 'free' && <FreeOrbitWheelRotate />}

      <GlobalFill studio={scene.studio} lights={scene.lights} objects={scene.objects} people={scene.people} />
      <Studio
        studio={scene.studio}
        suppressSideWalls={view === 'side' || view === 'free'}
        onSelect={interactive ? () => select({ kind: 'studio', id: 'studio' }) : undefined}
      />

      {scene.people.map((p) => (
        <Person
          key={p.id}
          person={p}
          selected={interactive && selection?.kind === 'person' && selection.id === p.id}
          onSelect={
            interactive
              ? (e) => {
                  e.stopPropagation()
                  select({ kind: 'person', id: p.id })
                }
              : undefined
          }
          onPointerDown={
            interactive
              ? (e) => {
                  e.stopPropagation()
                  select({ kind: 'person', id: p.id })
                  if (view !== 'camera') setDragTarget({ kind: 'person', id: p.id })
                }
              : undefined
          }
        />
      ))}

      <SceneObjects
        objects={scene.objects}
        selectedId={selectedObjectId}
        interactive={interactive}
        onSelect={(id) => interactive && select({ kind: 'object', id })}
        onPointerDownObject={onPointerDownObject}
      />

      <LightRig
        lights={scene.lights}
        people={scene.people}
        objects={scene.objects}
        selectedId={selectedLightId}
        showGizmos={showGizmos}
        onSelect={(id) => interactive && select({ kind: 'light', id })}
        onPointerDownLight={onPointerDownLight}
      />

      {showGizmos && (
        <CameraGizmo
          cam={scene.camera}
          selected={selection?.kind === 'camera'}
          onSelect={(e) => {
            e.stopPropagation()
            select({ kind: 'camera', id: 'camera' })
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
            select({ kind: 'camera', id: 'camera' })
            setDragTarget({ kind: 'camera', id: 'camera' })
          }}
        />
      )}

      {(view === 'top' || view === 'side') &&
        person &&
        scene.lights
          .filter((l) => l.enabled)
          .map((l) => {
            const target = getEffectiveLightTarget(l, scene.people)
            return <DistanceLabel key={l.id} light={l} target={[target.x, target.y, target.z]} />
          })}

      {interactive && <GroundDragController />}
      {registerCapture && <CaptureBridge />}
    </>
  )
}

// v0.4c "设为当前自由视角": when the camera panel bumps freeCameraCaptureRequestId,
// read the live orbit camera + OrbitControls target and write them into scene.camera.
// Lives inside the Canvas so it can read the R3F camera; only mounted in free view.
function FreeCameraCaptureBridge() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as { target?: { x: number; y: number; z: number } } | null
  const requestId = useStore((s) => s.freeCameraCaptureRequestId)
  const setCameraFromFree = useStore((s) => s.setCameraFromFree)
  const handled = useRef(requestId)

  useEffect(() => {
    if (requestId === handled.current) return
    handled.current = requestId
    const t = controls?.target
    setCameraFromFree(
      { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      t ? { x: t.x, y: t.y, z: t.z } : { x: 0, y: 1.05, z: 0 },
    )
  }, [requestId, camera, controls, setCameraFromFree])

  return null
}

// v0.4c: in free orbit, clamp the camera into the studio each frame so orbiting
// past a wall slides along it instead of showing a flat-white frame. Runs at
// default priority — after drei OrbitControls' update (priority -1) — so the clamp
// sticks; OrbitControls re-derives its spherical from the clamped position next
// frame, keeping it stable (no jitter while inside, since the clamp is a no-op).
function FreeCameraClamp({ studio }: { studio: StudioConfig }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as { target?: { x: number; y: number; z: number } } | null
  useFrame(() => {
    const c = clampCameraInsideStudio(camera.position, studio)
    if (c.x !== camera.position.x || c.y !== camera.position.y || c.z !== camera.position.z) {
      camera.position.set(c.x, c.y, c.z)
      const t = controls?.target
      if (t) camera.lookAt(t.x, t.y, t.z)
    }
  })
  return null
}

// v0.8 bugfix: on Mac touch-surface mice (Magic Mouse / trackpad) a horizontal
// swipe arrives as a horizontal wheel event whose deltaY component makes
// OrbitControls zoom — so "drag left/right to turn" felt like zoom. In free
// orbit we treat a horizontal-dominant wheel as an azimuth rotation around the
// orbit target and let only vertical wheel zoom. Button-drag rotation is
// unchanged. The listener runs in the capture phase on window — an ancestor of
// the canvas — so it preempts OrbitControls' own wheel handler and can stop the
// event before it zooms. update() re-derives the orbit angle from the live
// camera position each frame, so the manual rotation sticks.
const WHEEL_ROTATE_SENSITIVITY = 0.005 // radians per unit of horizontal wheel delta
const WHEEL_ROTATE_MAX_STEP = 0.2 // clamp per-event rotation so momentum swipes don't snap

function FreeOrbitWheelRotate() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const controls = useThree((s) => s.controls) as
    | { target?: { x: number; y: number; z: number }; update?: () => void }
    | null

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.target !== gl.domElement) return // only over the 3D canvas
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return // vertical → let OrbitControls zoom
      const target = controls?.target
      if (!target) return
      e.preventDefault()
      e.stopPropagation()
      const theta = Math.max(-WHEEL_ROTATE_MAX_STEP, Math.min(WHEEL_ROTATE_MAX_STEP, -e.deltaX * WHEEL_ROTATE_SENSITIVITY))
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      const ox = camera.position.x - target.x
      const oz = camera.position.z - target.z
      camera.position.x = target.x + ox * cos + oz * sin
      camera.position.z = target.z - ox * sin + oz * cos
      camera.lookAt(target.x, target.y, target.z)
      controls?.update?.()
    }
    window.addEventListener('wheel', onWheel, { capture: true, passive: false })
    return () => window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
  }, [camera, gl, controls])

  return null
}

type StudioSceneProps = {
  // Scene to render. Defaults to the live store scene (single-view usage).
  scene?: SceneConfig
  // Forced view. Defaults to the store viewMode. Compare panes pass 'camera'.
  view?: ViewMode
  // When false the canvas is a passive render: no selection, drag, or gizmos.
  interactive?: boolean
  // Only one canvas may own the capture bridge (export / save thumbnail).
  registerCapture?: boolean
}

export function StudioScene({
  scene: sceneProp,
  view: viewProp,
  interactive = true,
  registerCapture = true,
}: StudioSceneProps = {}) {
  const storeScene = useStore((s) => s.scene)
  const storeView = useStore((s) => s.viewMode)
  const select = useStore((s) => s.select)
  const setDragTarget = useStore((s) => s.setDragTarget)

  const scene = sceneProp ?? storeScene
  const view = viewProp ?? storeView

  // Safety: end any drag if the pointer is released outside the canvas.
  useEffect(() => {
    if (!interactive) return
    const up = () => setDragTarget(null)
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [setDragTarget, interactive])

  return (
    <Canvas
      shadows={scene.studio.shadowMode === 'soft' ? 'soft' : 'variance'}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = RENDERER_SETTINGS.toneMappingExposure
      }}
      onPointerMissed={interactive ? () => select(null) : undefined}
    >
      <SceneContents
        scene={scene}
        view={view}
        interactive={interactive}
        registerCapture={registerCapture}
      />
    </Canvas>
  )
}
