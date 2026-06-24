// Auto-discovers every .glb in src/models/ at build time via Vite glob.
// To add a new model: drop the .glb into src/models/ — it appears automatically.
// Scale and foot-offset are computed at runtime from the model's bounding box,
// so no per-model metadata is needed. To override the display label, add an
// entry to LABEL_OVERRIDES below.

export type PersonModelDef = {
  id: string
  label: string
  path: string
}

const LABEL_OVERRIDES: Record<string, string> = {
  van_darkholme:  'Van♂Darkholme',
  van_darkholme2: 'Van♂Darkholme 2',
}

function humanize(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const globs = import.meta.glob('/src/models/*.glb', { query: '?url', import: 'default', eager: true }) as Record<string, string>

export const PERSON_MODELS: PersonModelDef[] = Object.entries(globs).map(([key, url]) => {
  const id = key.split('/').pop()!.replace(/\.glb$/i, '')
  return {
    id,
    label: LABEL_OVERRIDES[id] ?? humanize(id),
    path: url,
  }
})
