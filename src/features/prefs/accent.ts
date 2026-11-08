export const DEFAULT_ACCENT = '#ff4b1f'

/** Quick picks in Settings; the colour input covers everything else. */
export const ACCENTS = [DEFAULT_ACCENT, '#ffb000', '#a3e635', '#22d3a6', '#38bdf8', '#a78bfa', '#f472b6'] as const

export const isHex = (x: unknown): x is string => typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x)

/** Channels in 0..1, in the form the shader wants. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Text colour for things sitting on the accent: dark on light colours, light on dark ones. */
export function onAccent(hex: string): '#0b0b0b' | '#ecebe6' {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  // 0.18 is where black and white text have the same WCAG contrast
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.18 ? '#0b0b0b' : '#ecebe6'
}
