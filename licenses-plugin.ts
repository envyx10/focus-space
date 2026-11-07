import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * The packages compiled into the production bundle. MIT and 0BSD ask that each copyright notice
 * travels with the code, and the bundler does not keep them, so the build writes them to
 * `licenses.txt`. Keep this list in step with THIRD_PARTY_LICENSES.md (a test checks it).
 */
export const RUNTIME_PACKAGES = [
  '@supabase/auth-js',
  '@supabase/functions-js',
  '@supabase/phoenix',
  '@supabase/postgrest-js',
  '@supabase/realtime-js',
  '@supabase/storage-js',
  '@supabase/supabase-js',
  'iceberg-js',
  'react',
  'react-dom',
  'scheduler',
  'three',
  'tslib',
]

/** The package's own license file, wherever it keeps it (LICENSE, LICENSE.md, LICENSE.txt…). */
export function findLicenseFile(root: string, pkg: string): string | undefined {
  const dir = join(root, 'node_modules', pkg)
  if (!existsSync(dir)) return undefined
  const name = readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f))
  return name ? join(dir, name) : undefined
}

export function buildLicensesText(root: string): string {
  const rule = '='.repeat(72)
  const parts = [
    'Focus/Space. Licenses of the code and of what it contains.\nFocus/Space. Licencias del código y de lo que contiene.',
    `${rule}\nFocus/Space (source code)\n${rule}\n\n${readFileSync(join(root, 'LICENSE'), 'utf8').trim()}`,
  ]
  for (const pkg of RUNTIME_PACKAGES) {
    const file = findLicenseFile(root, pkg)
    if (!file) throw new Error(`licenses: no license file found for ${pkg}`)
    const version = (JSON.parse(readFileSync(join(root, 'node_modules', pkg, 'package.json'), 'utf8')) as { version: string }).version
    parts.push(`${rule}\n${pkg} ${version}\n${rule}\n\n${readFileSync(file, 'utf8').trim()}`)
  }
  parts.push(
    `${rule}\nSounds, typefaces and the rest\n${rule}\n\nSounds: CC0 1.0 (public domain), listed one by one in public/sounds/CREDITS.md.\nTypefaces: SIL Open Font License 1.1, loaded from Google Fonts at run time.\nFull picture: THIRD_PARTY_LICENSES.md and README.md in https://github.com/envyx10/focus-space`,
  )
  return parts.join('\n\n') + '\n'
}

export function licensesPlugin(): Plugin {
  let root = process.cwd()
  return {
    name: 'focus-space-licenses',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'licenses.txt', source: buildLicensesText(root) })
    },
  }
}
