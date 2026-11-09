import type { SceneId } from '~/field/scenes'

/** Where "Abrir Focus/Space" goes. Set VITE_APP_URL when deploying; in dev the app runs on :5173. */
export const APP_URL: string = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? 'http://localhost:5173' : 'https://github.com/envyx10/focus-space')
export const REPO_URL = 'https://github.com/envyx10/focus-space'

export const CHAPTERS: { anchor: string; n: string; name: string; scenes: SceneId[] }[] = [
  { anchor: 'top', n: '01', name: 'Portada', scenes: ['hero'] },
  { anchor: 'features', n: '02', name: 'Todo en su sitio', scenes: ['f-timer', 'f-tasks', 'f-sound', 'f-focus', 'f-personal', 'f-mobile'] },
  { anchor: 'rhythm', n: '03', name: 'El ritmo', scenes: ['rhythm'] },
  { anchor: 'breathe', n: '04', name: 'Respira', scenes: ['breathe'] },
  { anchor: 'details', n: '05', name: 'Los detalles', scenes: ['details'] },
  { anchor: 'faq', n: '06', name: 'Preguntas', scenes: ['faq'] },
  { anchor: 'local', n: '07', name: 'En local', scenes: ['local'] },
  { anchor: 'enter', n: '08', name: 'Entra', scenes: ['enter'] },
]

export const chapterOf = (scene: SceneId) => CHAPTERS.findIndex((c) => c.scenes.includes(scene))
