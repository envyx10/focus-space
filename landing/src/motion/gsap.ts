import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'power3.out', duration: 1 })

export { gsap, ScrollTrigger }

export const REDUCE = '(prefers-reduced-motion: reduce)'
export const MOTION = '(prefers-reduced-motion: no-preference)'

/**
 * Page-wide entrances: `[data-reveal]` blocks rise into place and split headlines (`.split`) lift word by word
 * as they come into view. An IntersectionObserver sets `data-in` (an attribute React never rewrites) and CSS does the motion, so nothing depends on
 * scroll positions measured before fonts, sticky chapters or the sphere have settled. Anything still hidden
 * after a jump (a link to a chapter) is shown at once. With reduced motion everything is simply there.
 */
export function setupReveals(): () => void {
  const root = document.documentElement
  if (matchMedia(REDUCE).matches) return () => {}
  root.classList.add('reveals')
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        ;(e.target as HTMLElement).dataset.in = ''
        io.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  document.querySelectorAll('[data-reveal], .split:not([data-manual])').forEach((el) => io.observe(el))
  // past content (reached by a jump) must never stay hidden above the viewport
  const sweep = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in]), .split:not([data-manual]):not([data-in])').forEach((el) => el.getBoundingClientRect().bottom < innerHeight && (el.dataset.in = ''))
  addEventListener('scroll', sweep, { passive: true })
  return () => {
    io.disconnect()
    removeEventListener('scroll', sweep)
    root.classList.remove('reveals')
  }
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#░▒▓@%&'

/** Turns an element's text into noise and resolves it, letter by letter, into `text`. */
export function scramble(el: HTMLElement, text: string, ms = 900): () => void {
  const start = performance.now()
  let raf = 0
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / ms)
    const fixed = Math.floor(p * text.length)
    let out = text.slice(0, fixed)
    for (let i = fixed; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    el.textContent = out
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
