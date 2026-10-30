// Generates procedural placeholder loops into public/sounds/ until real CC0 recordings replace them.
// Usage: node scripts/gen-placeholder-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs'

const RATE = 22050
const SECONDS = 8
const N = RATE * SECONDS
const FADE = Math.round(RATE * 0.5)

let seed = 1
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1

const white = (n = N) => Float32Array.from({ length: n }, rand)

function lowpass(x, cutoff) {
  const a = Math.exp((-2 * Math.PI * cutoff) / RATE)
  const y = new Float32Array(x.length)
  let p = 0
  for (let i = 0; i < x.length; i++) y[i] = p = (1 - a) * x[i] + a * p
  return y
}

const highpass = (x, cutoff) => {
  const lp = lowpass(x, cutoff)
  return x.map((v, i) => v - lp[i])
}

const bandpass = (x, lo, hi) => highpass(lowpass(x, hi), lo)

function brown(n = N) {
  const y = new Float32Array(n)
  let p = 0
  for (let i = 0; i < n; i++) y[i] = p = (p + rand() * 0.02) * 0.998
  return y
}

const mix = (...parts) => {
  const y = new Float32Array(N)
  for (const [x, g] of parts) for (let i = 0; i < N; i++) y[i] += x[i] * g
  return y
}

// Sparse decaying events: drips, crackles, taps, clinks.
function events(rate, make) {
  const y = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    if (Math.random() < rate / RATE) {
      const ev = make()
      for (let j = 0; j < ev.length && i + j < N; j++) y[i + j] += ev[j]
    }
  }
  return y
}

const ping = (freq, decay, amp) => () =>
  Float32Array.from({ length: Math.round(RATE * decay * 4) }, (_, j) => Math.sin((2 * Math.PI * freq * (0.8 + Math.random() * 0.4) * j) / RATE) * Math.exp(-j / (RATE * decay)) * amp)

const click = (decay, amp) => () => Float32Array.from({ length: Math.round(RATE * decay * 5) }, (_, j) => rand() * Math.exp(-j / (RATE * decay)) * amp * Math.random())

const swell = (x, hz, depth) => x.map((v, i) => v * (1 - depth + depth * (0.5 + 0.5 * Math.sin((2 * Math.PI * hz * i) / RATE + Math.sin(i / RATE)))))

function normalize(x, peak = 0.7) {
  const m = x.reduce((a, v) => Math.max(a, Math.abs(v)), 1e-9)
  return x.map((v) => (v / m) * peak)
}

// Crossfade the tail into the head so the loop has no seam.
function loopable(x) {
  const out = x.slice(0, x.length - FADE)
  for (let i = 0; i < FADE; i++) {
    const t = i / FADE
    out[i] = out[i] * t + x[x.length - FADE + i] * (1 - t)
  }
  return out
}

function wav(x) {
  const b = Buffer.alloc(44 + x.length * 2)
  b.write('RIFF', 0)
  b.writeUInt32LE(36 + x.length * 2, 4)
  b.write('WAVEfmt ', 8)
  b.writeUInt32LE(16, 16)
  b.writeUInt16LE(1, 20)
  b.writeUInt16LE(1, 22)
  b.writeUInt32LE(RATE, 24)
  b.writeUInt32LE(RATE * 2, 28)
  b.writeUInt16LE(2, 32)
  b.writeUInt16LE(16, 34)
  b.write('data', 36)
  b.writeUInt32LE(x.length * 2, 40)
  x.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2))
  return b
}

const sounds = {
  'rain-suave': () => lowpass(white(), 2500),
  'rain-ventana': () => mix([lowpass(white(), 3000), 1], [events(6, ping(2600, 0.012, 1.2)), 1]),
  'rain-tormenta': () => mix([lowpass(white(), 5000), 1], [brown(), 6], [swell(lowpass(brown(), 80), 0.07, 0.9), 14]),
  'rain-tienda': () => mix([lowpass(white(), 1800), 0.5], [bandpass(events(90, click(0.004, 1)), 300, 2500), 2.5]),
  'fire-hoguera': () => mix([brown(), 8], [highpass(events(14, click(0.002, 1)), 1500), 2], [lowpass(white(), 400), 0.3]),
  'fire-chimenea': () => mix([brown(), 10], [highpass(events(5, click(0.003, 0.8)), 1000), 1.5], [lowpass(white(), 250), 0.4]),
  'cafe-cafeteria': () => mix([swell(bandpass(white(), 300, 2500), 1.7, 0.5), 1], [events(0.6, ping(3200, 0.08, 0.5)), 1]),
  'cafe-biblioteca': () => mix([bandpass(white(), 200, 1200), 0.25], [events(0.3, () => bandpass(click(0.06, 0.6)(), 800, 4000)), 1]),
  'wind-suave': () => swell(lowpass(white(), 600), 0.12, 0.8),
  'wind-bosque': () => mix([swell(lowpass(white(), 700), 0.1, 0.8), 1], [swell(highpass(white(), 3000), 0.3, 0.9), 0.35]),
}

mkdirSync('public/sounds', { recursive: true })
for (const [name, make] of Object.entries(sounds)) {
  writeFileSync(`public/sounds/${name}.wav`, wav(loopable(normalize(make()))))
}
const chime = new Float32Array(Math.round(RATE * 1.6))
for (let i = 0; i < chime.length; i++) {
  const t = i / RATE
  chime[i] = (Math.sin(2 * Math.PI * 880 * t) + 0.6 * Math.sin(2 * Math.PI * 1320 * t)) * Math.exp(-t * 2.5) * 0.35
}
writeFileSync('public/sounds/chime.wav', wav(chime))
console.log('placeholder sounds written to public/sounds/')
