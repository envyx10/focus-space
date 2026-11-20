import { useEffect, useState } from 'react'
import { field, type SceneId } from '~/field/scenes'

/**
 * Whichever chapter crosses the middle of the screen sets the scene: the field changes shape and the
 * atmosphere (`html[data-scene]`, read by the CSS) changes light. Returns the current chapter for the nav.
 */
export function useScenes(): SceneId {
  const [scene, setScene] = useState<SceneId>('hero')

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const id = (e.target as HTMLElement).dataset.scene as SceneId
          field.scene = id
          document.documentElement.dataset.scene = id
          setScene(id)
        }
      },
      // a thin band across the middle of the viewport: exactly one chapter is "here" at a time
      { rootMargin: '-48% 0px -48% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    document.documentElement.dataset.scene = 'hero'
    return () => io.disconnect()
  }, [])

  return scene
}
