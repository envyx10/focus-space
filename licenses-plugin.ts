import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * The packages compiled into the production bundle. MIT, ISC, BSD and 0BSD ask that each copyright
 * notice travels with the code, and the bundler does not keep them, so the build writes them to
 * `licenses.txt`. Keep this list in step with THIRD_PARTY_LICENSES.md (a test checks it); the build
 * fails if the bundle contains a package that is not here.
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
  // Markdown renderer for task descriptions, in its own lazy chunk.
  '@ungap/structured-clone',
  'bail',
  'ccount',
  'comma-separated-tokens',
  'decode-named-character-reference',
  'devlop',
  'escape-string-regexp',
  'estree-util-is-identifier-name',
  'extend',
  'hast-util-to-jsx-runtime',
  'hast-util-to-text',
  'hast-util-whitespace',
  'highlight.js',
  'html-url-attributes',
  'inline-style-parser',
  'is-plain-obj',
  'longest-streak',
  'lowlight',
  'markdown-table',
  'mdast-util-find-and-replace',
  'mdast-util-from-markdown',
  'mdast-util-gfm',
  'mdast-util-gfm-autolink-literal',
  'mdast-util-gfm-footnote',
  'mdast-util-gfm-strikethrough',
  'mdast-util-gfm-table',
  'mdast-util-gfm-task-list-item',
  'mdast-util-phrasing',
  'mdast-util-to-hast',
  'mdast-util-to-markdown',
  'mdast-util-to-string',
  'micromark',
  'micromark-core-commonmark',
  'micromark-extension-gfm',
  'micromark-extension-gfm-autolink-literal',
  'micromark-extension-gfm-footnote',
  'micromark-extension-gfm-strikethrough',
  'micromark-extension-gfm-table',
  'micromark-extension-gfm-task-list-item',
  'micromark-factory-destination',
  'micromark-factory-label',
  'micromark-factory-space',
  'micromark-factory-title',
  'micromark-factory-whitespace',
  'micromark-util-character',
  'micromark-util-chunked',
  'micromark-util-classify-character',
  'micromark-util-combine-extensions',
  'micromark-util-decode-numeric-character-reference',
  'micromark-util-decode-string',
  'micromark-util-edit-map',
  'micromark-util-html-tag-name',
  'micromark-util-normalize-identifier',
  'micromark-util-resolve-all',
  'micromark-util-sanitize-uri',
  'micromark-util-subtokenize',
  'property-information',
  'react-markdown',
  'rehype-highlight',
  'remark-gfm',
  'remark-parse',
  'remark-rehype',
  'space-separated-tokens',
  'style-to-object',
  'trim-lines',
  'trough',
  'unified',
  'unist-util-is',
  'unist-util-position',
  'unist-util-stringify-position',
  'unist-util-visit',
  'unist-util-visit-parents',
  'vfile',
  'vfile-message',
]

/**
 * The package a bundled module comes from: the last `node_modules/<name>` (or
 * `node_modules/@scope/<name>`) in its path, or undefined for our own code and virtual modules.
 */
export function packageOf(id: string): string | undefined {
  const all = id.replaceAll('\\', '/').match(/node_modules\/(?:@[^/]+\/)?[^/]+/g)
  return all?.at(-1)?.slice('node_modules/'.length)
}

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
    generateBundle(_, bundle) {
      const listed = new Set(RUNTIME_PACKAGES)
      const missing = new Set<string>()
      for (const out of Object.values(bundle)) {
        if (out.type !== 'chunk') continue
        for (const id of out.moduleIds) {
          const pkg = packageOf(id)
          if (pkg && !listed.has(pkg)) missing.add(pkg)
        }
      }
      if (missing.size) {
        this.error(
          `licenses: the bundle includes packages missing from RUNTIME_PACKAGES: ${[...missing].sort().join(', ')}. ` +
            'Add them to licenses-plugin.ts and THIRD_PARTY_LICENSES.md.',
        )
      }
      this.emitFile({ type: 'asset', fileName: 'licenses.txt', source: buildLicensesText(root) })
    },
  }
}
