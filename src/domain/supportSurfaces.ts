import type { PersonConfig, SceneObjectConfig } from '../types'
import type { AppLanguage } from '../i18n'
import { getSupportSurfaceLabel } from '../i18n/display'

// v0.4b: a surface is either something you SIT on (chair/sofa/stool → seated
// pose, hips at the seat top) or something you STAND on (table/platform/plinth/
// box → standing pose, feet at the top). The role drives the auto pose switch
// in placeOnSurface.
export type SupportRole = 'seat' | 'stand'

export type SupportSurface = {
  object: SceneObjectConfig
  y: number
  role: SupportRole
  label: string
}

export function getObjectSupportRole(obj: SceneObjectConfig): SupportRole | null {
  switch (obj.kind) {
    case 'chair':
    case 'sofa':
    case 'stool':
      return 'seat'
    case 'table':
    case 'platform':
    case 'plinth':
    case 'cylinderPlinth':
    case 'box':
      return 'stand'
    default:
      return null
  }
}

export function getObjectSupportY(obj: SceneObjectConfig): number | null {
  if (obj.visible === false) return null

  switch (obj.kind) {
    case 'table':
    case 'platform':
    case 'plinth':
    case 'cylinderPlinth':
    case 'box':
    case 'stool': // a stool has no backrest, so its seat is the top surface
      return obj.position.y + obj.size.height
    case 'chair':
      return obj.position.y + obj.size.height * 0.56
    case 'sofa':
      return obj.position.y + obj.size.height * 0.52
    default:
      return null
  }
}

// v0.10.1: the per-kind surface word is now localized in i18n/display.ts
// (getSupportSurfaceLabel); the old Chinese-returning getObjectSupportLabel was
// removed with the label move.

export function getPersonSupportSurfaces(
  objects: SceneObjectConfig[],
  language: AppLanguage,
): SupportSurface[] {
  return objects
    .map((object) => {
      const y = getObjectSupportY(object)
      const role = getObjectSupportRole(object)
      if (y == null || role == null) return null
      return {
        object,
        y,
        role,
        label: getSupportSurfaceLabel(language, object, y, role),
      }
    })
    .filter((surface): surface is SupportSurface => surface !== null)
}

// ─── attach-to-support helpers (v0.4.5) ────────────────────────────────────
// These are pure functions. The store uses them to:
//   1. Compute a binding when a person is placed on a support.
//   2. Recompute a bound person's world position when the support moves/rotates.
//   3. Strip the binding fields when a person is detached.

/**
 * Convert a person's world X/Z position into the support object's local frame,
 * undoing the object's `rotationY` so that when the object rotates later, we
 * can re-project back to the new world frame and the person follows.
 */
export function worldToSupportLocal(
  personXZ: { x: number; z: number },
  object: SceneObjectConfig,
): { x: number; z: number } {
  const dx = personXZ.x - object.position.x
  const dz = personXZ.z - object.position.z
  const c = Math.cos(-object.rotationY)
  const s = Math.sin(-object.rotationY)
  return { x: dx * c - dz * s, z: dx * s + dz * c }
}

/**
 * Inverse of `worldToSupportLocal`: given a local offset stored on a person,
 * project it back to the world frame using the object's current position and
 * rotationY. Returns absolute world X/Z.
 */
export function supportLocalToWorld(
  localOffset: { x: number; z: number },
  object: SceneObjectConfig,
): { x: number; z: number } {
  const c = Math.cos(object.rotationY)
  const s = Math.sin(object.rotationY)
  return {
    x: object.position.x + localOffset.x * c - localOffset.z * s,
    z: object.position.z + localOffset.x * s + localOffset.z * c,
  }
}

/**
 * Build the set of PersonConfig fields that create a fresh attach-to-support
 * binding. Caller merges the result into the person's patch (along with
 * position.y = surfaceY and any pose change done by placeOnSurface).
 */
export function buildSupportBinding(
  person: PersonConfig,
  object: SceneObjectConfig,
): Pick<PersonConfig, 'supportObjectId' | 'supportLocalOffset' | 'supportRotationOffset'> {
  return {
    supportObjectId: object.id,
    supportLocalOffset: worldToSupportLocal(person.position, object),
    supportRotationOffset: person.rotationY - object.rotationY,
  }
}

/**
 * Fields to merge into a person when detaching from their support (e.g. the
 * user clicks "回到地面" / "起立回地面" or manually drags the XZ sliders).
 * Leaves all other person fields untouched.
 */
export const CLEAR_SUPPORT_BINDING: Pick<
  PersonConfig,
  'supportObjectId' | 'supportLocalOffset' | 'supportRotationOffset'
> = {
  supportObjectId: undefined,
  supportLocalOffset: undefined,
  supportRotationOffset: undefined,
}

/**
 * After a support object has been updated (moved / rotated / size change),
 * recompute one bound person's world position and rotationY from the object's
 * new state. Returns the fields to merge into the person.
 *
 * - position.x / .z are recomputed from `supportLocalOffset` and the new
 *   object position + rotationY.
 * - position.y follows the object's new support Y so seated/standing height
 *   stays correct when the object's `size.height` or `position.y` changed.
 * - rotationY stays stable relative to the object by reapplying
 *   `supportRotationOffset + object.rotationY`.
 */
export function recomputePersonFromSupport(
  person: PersonConfig,
  object: SceneObjectConfig,
): Partial<PersonConfig> {
  if (!person.supportLocalOffset) return {}
  const xz = supportLocalToWorld(person.supportLocalOffset, object)
  const surfaceY = getObjectSupportY(object) ?? person.position.y
  const rotationY =
    person.supportRotationOffset != null
      ? person.supportRotationOffset + object.rotationY
      : person.rotationY
  return {
    position: { x: xz.x, y: surfaceY, z: xz.z },
    rotationY,
  }
}

/**
 * Return true if `person` is currently attached to the given `objectId`.
 */
export function isPersonAttachedTo(person: PersonConfig, objectId: string): boolean {
  return person.supportObjectId === objectId
}
