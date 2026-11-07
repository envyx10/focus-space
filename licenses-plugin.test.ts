import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { RUNTIME_PACKAGES, buildLicensesText, findLicenseFile, packageOf } from './licenses-plugin.ts'

const root = process.cwd()

describe('licenses.txt', () => {
  it('finds a license file for every package that ships in the bundle', () => {
    for (const pkg of RUNTIME_PACKAGES) expect(findLicenseFile(root, pkg), pkg).toBeTruthy()
  })

  it('lists the same packages as THIRD_PARTY_LICENSES.md', () => {
    const doc = readFileSync('THIRD_PARTY_LICENSES.md', 'utf8')
    for (const pkg of RUNTIME_PACKAGES) expect(doc, pkg).toContain(`[${pkg}]`)
    expect(doc).toContain(`These ${RUNTIME_PACKAGES.length} packages`)
  })

  it('tells which package a bundled module comes from', () => {
    expect(packageOf('C:\\app\\node_modules\\react-dom\\cjs\\react-dom.production.js')).toBe('react-dom')
    expect(packageOf('/app/node_modules/@supabase/auth-js/dist/module/index.js')).toBe('@supabase/auth-js')
    expect(packageOf('/app/node_modules/a/node_modules/@ungap/structured-clone/esm/index.js')).toBe('@ungap/structured-clone')
    expect(packageOf('/app/src/main.tsx')).toBeUndefined()
    expect(packageOf('\0vite/preload-helper.js')).toBeUndefined()
  })

  it('carries our license and every dependency notice', () => {
    const text = buildLicensesText(root)
    expect(text).toContain('Functional Source License')
    for (const pkg of RUNTIME_PACKAGES) expect(text).toContain(pkg)
    expect(text).toMatch(/Copyright/i)
  })
})
