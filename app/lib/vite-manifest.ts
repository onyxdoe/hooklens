import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Manifest } from 'vite'

let cached: Manifest | null | undefined

export function loadViteManifest(): Manifest | null {
  if (cached !== undefined) return cached

  try {
    const manifestPath = join(
      dirname(fileURLToPath(import.meta.url)),
      '../client/.vite/manifest.json',
    )
    cached = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest
  } catch {
    cached = null
  }

  return cached
}
